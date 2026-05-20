<template>
	<view class="content">
		<view class="card">
			<view class="button-group">
				<button class="scan-btn" type="primary" @click="handleScanClick" :disabled="isScanning">
					{{ isScanning ? '搜索中...' : '搜索蓝牙设备' }}
				</button>
				<button class="skip-btn" type="warn" @click="skipToDevice">
					skip
				</button>
			</view>

			<view class="status">{{ statusText }}</view>

			<view v-if="deviceList.length === 0" class="empty">
				暂无设备，点击上方按钮开始搜索
			</view>

			<scroll-view v-else class="device-list" scroll-y>
				<view
					v-for="device in deviceList"
					:key="device.deviceId"
					class="device-item"
					@click="connectDevice(device)"
				>
					<view class="device-name">{{ device.name || '未命名设备' }}</view>
					<view class="device-id">{{ device.deviceId }}</view>
					<view class="device-rssi">{{ device.isBonded ? '已配对设备' : '未配对设备' }}</view>
				</view>
			</scroll-view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onUnload } from '@dcloudio/uni-app'
import { connectSpp } from '../../utils/spp'

const isScanning = ref(false)
const deviceList = ref([])
const statusText = ref('请先开启蓝牙，然后点击搜索附近设备')

let androidAdapter = null
let discoveryReceiver = null

const upsertDevice = (deviceInfo) => {
	const index = deviceList.value.findIndex((item) => item.deviceId === deviceInfo.deviceId)
	if (index === -1) {
		deviceList.value.push(deviceInfo)
		return
	}
	deviceList.value[index] = {
		...deviceList.value[index],
		...deviceInfo
	}
}

const getAndroidAdapter = () => {
	if (typeof plus === 'undefined' || !plus.android) {
		throw new Error('当前环境不支持SPP，请在Android App端运行')
	}
	const BluetoothAdapter = plus.android.importClass('android.bluetooth.BluetoothAdapter')
	const adapter = BluetoothAdapter.getDefaultAdapter()
	if (!adapter) {
		throw new Error('设备不支持蓝牙')
	}
	if (!plus.android.invoke(adapter, 'isEnabled')) {
		throw new Error('蓝牙未开启')
	}
	androidAdapter = adapter
	return adapter
}

const getAndroidApiLevel = () => {
	try {
		const Build = plus.android.importClass('android.os.Build')
		return Number(Build.VERSION.SDK_INT || 0)
	} catch (error) {
		return 0
	}
}

const requestAndroidPermissions = (permissions = []) => new Promise((resolve, reject) => {
	if (!permissions.length || typeof plus === 'undefined' || !plus.android || !plus.android.requestPermissions) {
		resolve()
		return
	}

	plus.android.requestPermissions(
		permissions,
		(resultObj) => {
			const deniedPresent = resultObj?.deniedPresent || []
			const deniedAlways = resultObj?.deniedAlways || []
			const deniedList = [...deniedPresent, ...deniedAlways]
			if (deniedList.length > 0) {
				reject(new Error('蓝牙搜索权限被拒绝，请在系统设置中开启后重试'))
				return
			}
			resolve()
		},
		(error) => {
			reject(new Error(error?.message || '请求蓝牙权限失败'))
		}
	)
})

const ensureLocationSwitchEnabled = () => {
	const main = plus.android.runtimeMainActivity()
	const LocationManager = plus.android.importClass('android.location.LocationManager')
	const locationManager = plus.android.invoke(main, 'getSystemService', 'location')
	if (!locationManager) {
		return
	}
	const gpsEnabled = !!plus.android.invoke(locationManager, 'isProviderEnabled', LocationManager.GPS_PROVIDER)
	const networkEnabled = !!plus.android.invoke(locationManager, 'isProviderEnabled', LocationManager.NETWORK_PROVIDER)
	if (!gpsEnabled && !networkEnabled) {
		throw new Error('请先开启系统定位开关，再搜索蓝牙设备')
	}
}

const ensureScanPrerequisites = async () => {
	const apiLevel = getAndroidApiLevel()
	const permissions = apiLevel >= 31
		? ['android.permission.BLUETOOTH_SCAN', 'android.permission.BLUETOOTH_CONNECT']
		: ['android.permission.ACCESS_FINE_LOCATION']
	await requestAndroidPermissions(permissions)
	if (apiLevel > 0 && apiLevel < 31) {
		ensureLocationSwitchEnabled()
	}
}

const getBondedDevices = (adapter) => {
	const BluetoothDevice = plus.android.importClass('android.bluetooth.BluetoothDevice')
	const bondedSet = plus.android.invoke(adapter, 'getBondedDevices')
	const iterator = plus.android.invoke(bondedSet, 'iterator')
	const list = []
	while (plus.android.invoke(iterator, 'hasNext')) {
		const device = plus.android.invoke(iterator, 'next')
		const bondState = plus.android.invoke(device, 'getBondState')
		list.push({
			name: plus.android.invoke(device, 'getName') || '未命名设备',
			deviceId: plus.android.invoke(device, 'getAddress'),
			isBonded: bondState === BluetoothDevice.BOND_BONDED
		})
	}
	return list
}

const unregisterDiscoveryReceiver = () => {
	if (!discoveryReceiver || typeof plus === 'undefined' || !plus.android) {
		return
	}
	try {
		const main = plus.android.runtimeMainActivity()
		plus.android.invoke(main, 'unregisterReceiver', discoveryReceiver)
	} catch (error) {
		// ignore unregister errors
	}
	discoveryReceiver = null
}

const stopClassicDiscovery = () => {
	if (!androidAdapter) {
		return
	}
	try {
		if (plus.android.invoke(androidAdapter, 'isDiscovering')) {
			plus.android.invoke(androidAdapter, 'cancelDiscovery')
		}
	} catch (error) {
		// ignore stop errors
	}
}

const registerDiscoveryReceiver = () => {
	unregisterDiscoveryReceiver()

	const main = plus.android.runtimeMainActivity()
	const IntentFilter = plus.android.importClass('android.content.IntentFilter')
	const BluetoothDevice = plus.android.importClass('android.bluetooth.BluetoothDevice')
	const BluetoothAdapter = plus.android.importClass('android.bluetooth.BluetoothAdapter')
	const filter = new IntentFilter()
	plus.android.invoke(filter, 'addAction', BluetoothDevice.ACTION_FOUND)
	plus.android.invoke(filter, 'addAction', BluetoothAdapter.ACTION_DISCOVERY_FINISHED)

	discoveryReceiver = plus.android.implements('io.dcloud.feature.internal.reflect.BroadcastReceiver', {
		onReceive: (context, intent) => {
			const action = plus.android.invoke(intent, 'getAction')
			if (action === BluetoothDevice.ACTION_FOUND) {
				const found = plus.android.invoke(intent, 'getParcelableExtra', BluetoothDevice.EXTRA_DEVICE)
				if (!found) {
					return
				}
				const address = plus.android.invoke(found, 'getAddress')
				if (!address) {
					return
				}
				const bondState = plus.android.invoke(found, 'getBondState')
				upsertDevice({
					name: plus.android.invoke(found, 'getName') || '未命名设备',
					deviceId: address,
					isBonded: bondState === BluetoothDevice.BOND_BONDED
				})
				return
			}

			if (action === BluetoothAdapter.ACTION_DISCOVERY_FINISHED) {
				isScanning.value = false
				statusText.value = deviceList.value.length > 0 ? '搜索完成，请点击设备进行SPP连接' : '未搜索到附近设备'
			}
		}
	})

	plus.android.invoke(main, 'registerReceiver', discoveryReceiver, filter)
}

const handleScanClick = async () => {
	if (isScanning.value) {
		return
	}
	try {
		await ensureScanPrerequisites()
		statusText.value = '正在搜索附近蓝牙设备...'
		isScanning.value = true
		const adapter = getAndroidAdapter()
		deviceList.value = getBondedDevices(adapter)
		registerDiscoveryReceiver()
		stopClassicDiscovery()
		const started = plus.android.invoke(adapter, 'startDiscovery')
		if (!started) {
			isScanning.value = false
			statusText.value = deviceList.value.length > 0 ? '无法启动搜索，已显示已配对设备，请检查系统定位是否开启' : '无法启动搜索，请检查蓝牙和定位权限后重试'
		}
	} catch (err) {
		const message = err?.message || err?.errMsg || '蓝牙不可用，请检查蓝牙状态'
		statusText.value = message
		uni.showToast({
			title: '搜索失败',
			icon: 'none'
		})
	} finally {
		if (!isScanning.value) {
			stopClassicDiscovery()
			unregisterDiscoveryReceiver()
		}
	}
}

const connectDevice = async (device) => {
	const targetId = device.deviceId
	if (!targetId) {
		return
	}

	try {
		statusText.value = `正在SPP连接: ${device.name || targetId}`
		connectSpp(targetId)

		const connectedName = device.name || targetId
		statusText.value = `SPP连接成功: ${connectedName}`
		uni.showToast({ title: '连接成功', icon: 'success' })
		setTimeout(() => {
			uni.navigateTo({
				url: `/pages/device/device?deviceName=${encodeURIComponent(connectedName)}&deviceId=${encodeURIComponent(targetId)}`
			})
		}, 300)
	} catch (err) {
		statusText.value = err?.message || err?.errMsg || 'SPP连接失败'
		uni.showToast({ title: '连接失败', icon: 'none' })
	}
}

const skipToDevice = () => {
	uni.navigateTo({
		url: '/pages/device/device'
	})
}

onUnload(() => {
	isScanning.value = false
	stopClassicDiscovery()
	unregisterDiscoveryReceiver()
})
</script>

<style lang="scss" scoped>
.content {
	min-height: 100vh;
	padding: 24rpx;
	background: #f3f6fb;
	box-sizing: border-box;
}

.card {
	background: #ffffff;
	border-radius: 20rpx;
	padding: 24rpx;
	box-shadow: 0 8rpx 30rpx rgba(26, 44, 80, 0.08);
}

.button-group {
	display: flex;
	gap: 12rpx;
	margin-bottom: 20rpx;
}

.scan-btn {
	grid-column: 1;
}

.skip-btn {
	grid-column: 2;
	width: 20%;
}

.status {
	font-size: 26rpx;
	color: #31415f;
	margin-bottom: 18rpx; 
	word-break: break-all;
}

.empty {
	padding: 40rpx 0;
	text-align: center;
	font-size: 26rpx;
	color: #7e8ca8;
}

.device-list {
	max-height: 70vh;
}

.device-item {
	padding: 20rpx;
	border: 1rpx solid #dbe4f2;
	border-radius: 14rpx;
	margin-bottom: 16rpx;
	background: #f9fbff;
}

.device-name {
	font-size: 30rpx;
	font-weight: 600;
	color: #1f2f4d;
	margin-bottom: 10rpx;
}

.device-id,
.device-rssi {
	font-size: 24rpx;
	color: #5f6f8f;
	word-break: break-all;
}

button {
	width: 100%;
	height: 88rpx;
	line-height: 88rpx;
	border-radius: 16rpx;
	font-size: 30rpx;
	font-weight: 600;
	letter-spacing: 2rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}
</style>
