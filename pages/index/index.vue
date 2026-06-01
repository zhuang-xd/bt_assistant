<template>
	<view class="page">
		<!-- 顶部栏 -->
		<view class="header">
			<view class="header-icon">
				<text class="icon-bt">&#x1F50C;</text>
			</view>
			<view class="header-info">
				<text class="header-title">蓝牙助手</text>
				<text class="header-subtitle">SPP 串口调试工具</text>
			</view>
		</view>

		<!-- 操作区 -->
		<view class="action-card">
			<view class="status-bar" :class="{ scanning: isScanning }">
				<view class="status-dot"></view>
				<text class="status-text">{{ statusText }}</text>
			</view>

			<view class="button-group">
				<button
					class="scan-btn"
					:class="{ scanning: isScanning }"
					@click="handleScanClick"
					:disabled="isScanning"
				>
					<text class="btn-icon">{{ isScanning ? '⏳' : '🔍' }}</text>
					<text>{{ isScanning ? '搜索中...' : '搜索蓝牙设备' }}</text>
				</button>
				<button class="skip-btn" @click="skipToDevice">
					<text class="btn-icon">⚙️</text>
					<text>跳过</text>
				</button>
			</view>
		</view>

		<!-- 设备列表 -->
		<view class="device-section">
			<view class="section-header">
				<text class="section-title">附近设备</text>
				<text class="section-count" v-if="deviceList.length > 0">{{ deviceList.length }} 台</text>
			</view>

			<view v-if="deviceList.length === 0" class="empty">
				<text class="empty-icon">📡</text>
				<text class="empty-title">暂无设备</text>
				<text class="empty-desc">点击上方按钮开始搜索附近的蓝牙设备</text>
			</view>

			<scroll-view v-else class="device-list" scroll-y>
				<view
					v-for="(device, index) in deviceList"
					:key="device.deviceId"
					class="device-item"
					:style="{ animationDelay: (index * 0.05) + 's' }"
					@click="connectDevice(device)"
				>
					<view class="device-left">
						<view class="device-avatar" :class="{ bonded: device.isBonded }">
							<text>{{ device.isBonded ? '🔗' : '📱' }}</text>
						</view>
					</view>
					<view class="device-center">
						<text class="device-name">{{ device.name || '未命名设备' }}</text>
						<text class="device-id">{{ device.deviceId }}</text>
					</view>
					<view class="device-right">
						<view class="device-tag" :class="{ bonded: device.isBonded }">
							<text>{{ device.isBonded ? '已配对' : '未配对' }}</text>
						</view>
						<text class="device-arrow">›</text>
					</view>
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
.page {
	min-height: 100vh;
	background: linear-gradient(180deg, #eef1f9 0%, #f0f2f8 30%, #f5f6fa 100%);
	padding: 0 24rpx;
	padding-bottom: 48rpx;
	box-sizing: border-box;
}

/* 顶部栏 */
.header {
	display: flex;
	align-items: center;
	padding: 48rpx 16rpx 32rpx;
	padding-top: calc(48rpx + var(--status-bar-height, 44px));
	gap: 20rpx;
}

.header-icon {
	width: 88rpx;
	height: 88rpx;
	border-radius: 24rpx;
	background: linear-gradient(135deg, #4f6ef6 0%, #7b93ff 100%);
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 24rpx rgba(79, 110, 246, 0.3);

	.icon-bt {
		font-size: 40rpx;
	}
}

.header-info {
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.header-title {
	font-size: 40rpx;
	font-weight: 700;
	color: #1a1a2e;
	letter-spacing: 1rpx;
}

.header-subtitle {
	font-size: 24rpx;
	color: #8e8e9a;
}

/* 操作卡片 */
.action-card {
	background: #ffffff;
	border-radius: 24rpx;
	padding: 28rpx;
	margin-bottom: 24rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.status-bar {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 24rpx;
	padding: 16rpx 20rpx;
	background: #f8f9fd;
	border-radius: 14rpx;
	transition: all 0.3s ease;

	&.scanning {
		background: #eef3ff;
		border: 1rpx solid #d4dfff;
	}
}

.status-dot {
	width: 14rpx;
	height: 14rpx;
	border-radius: 50%;
	background: #d1d1d6;
	flex-shrink: 0;
	transition: all 0.3s ease;

	.scanning & {
		background: #4f6ef6;
		animation: pulse 1.2s ease-in-out infinite;
		box-shadow: 0 0 0 0 rgba(79, 110, 246, 0.5);
	}
}

@keyframes pulse {
	0% {
		box-shadow: 0 0 0 0 rgba(79, 110, 246, 0.5);
	}
	70% {
		box-shadow: 0 0 0 12rpx rgba(79, 110, 246, 0);
	}
	100% {
		box-shadow: 0 0 0 0 rgba(79, 110, 246, 0);
	}
}

.status-text {
	font-size: 26rpx;
	color: #6b6b7e;
	line-height: 1.5;
	flex: 1;

	.scanning & {
		color: #3a54d4;
	}
}

.button-group {
	display: flex;
	gap: 16rpx;
}

.scan-btn {
	flex: 1;
	height: 88rpx;
	line-height: 88rpx;
	border-radius: 20rpx;
	font-size: 28rpx;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 10rpx;
	padding: 0 24rpx;
	background: linear-gradient(135deg, #4f6ef6 0%, #6b85ff 100%);
	color: #fff;
	border: none;
	box-shadow: 0 6rpx 20rpx rgba(79, 110, 246, 0.25);
	transition: all 0.2s ease;

	&::after {
		border: none;
	}

	&:active {
		transform: scale(0.97);
		box-shadow: 0 3rpx 10rpx rgba(79, 110, 246, 0.2);
	}

	&[disabled] {
		background: #d5d9eb;
		color: #a0a4b8;
		box-shadow: none;
	}

	.btn-icon {
		font-size: 32rpx;
	}
}

.skip-btn {
	width: 160rpx;
	height: 88rpx;
	line-height: 88rpx;
	border-radius: 20rpx;
	font-size: 28rpx;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	padding: 0;
	background: #f5f6fa;
	color: #5a5a6e;
	border: none;
	transition: all 0.2s ease;

	&::after {
		border: none;
	}

	&:active {
		background: #ebedf5;
		transform: scale(0.97);
	}

	.btn-icon {
		font-size: 28rpx;
	}
}

/* 设备列表区 */
.device-section {
	margin-top: 8rpx;
}

.section-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 8rpx;
	margin-bottom: 20rpx;
}

.section-title {
	font-size: 30rpx;
	font-weight: 700;
	color: #1a1a2e;
}

.section-count {
	font-size: 24rpx;
	color: #8e8e9a;
	background: #eef1f9;
	padding: 6rpx 16rpx;
	border-radius: 20rpx;
}

/* 空状态 */
.empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 80rpx 40rpx;
	background: #ffffff;
	border-radius: 24rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
}

.empty-icon {
	font-size: 80rpx;
	margin-bottom: 20rpx;
}

.empty-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #1a1a2e;
	margin-bottom: 12rpx;
}

.empty-desc {
	font-size: 26rpx;
	color: #8e8e9a;
	text-align: center;
	line-height: 1.6;
}

/* 设备列表 */
.device-list {
	max-height: 60vh;
}

.device-item {
	display: flex;
	align-items: center;
	padding: 24rpx;
	margin-bottom: 14rpx;
	background: #ffffff;
	border-radius: 20rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.03);
	gap: 18rpx;
	transition: all 0.2s ease;
	animation: fadeInUp 0.35s ease both;

	&:active {
		transform: scale(0.98);
		background: #f8f9fd;
		box-shadow: 0 4rpx 16rpx rgba(79, 110, 246, 0.08);
	}
}

@keyframes fadeInUp {
	from {
		opacity: 0;
		transform: translateY(20rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.device-left {
	flex-shrink: 0;
}

.device-avatar {
	width: 80rpx;
	height: 80rpx;
	border-radius: 20rpx;
	background: #f0f3ff;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 36rpx;
	transition: all 0.25s ease;

	&.bonded {
		background: #e8f5e9;
	}
}

.device-center {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 6rpx;
}

.device-name {
	font-size: 30rpx;
	font-weight: 600;
	color: #1a1a2e;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.device-id {
	font-size: 22rpx;
	color: #8e8e9a;
	font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.device-right {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 10rpx;
	flex-shrink: 0;
}

.device-tag {
	padding: 6rpx 14rpx;
	border-radius: 8rpx;
	font-size: 20rpx;
	font-weight: 500;
	background: #f0f3ff;
	color: #4f6ef6;

	&.bonded {
		background: #e8f5e9;
		color: #34c759;
	}
}

.device-arrow {
	font-size: 32rpx;
	color: #c8cce0;
	font-weight: 300;
}
</style>