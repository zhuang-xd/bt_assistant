<template>
	<view class="content">
		<view class="card">
			<view class="title">设备</view>
			<view class="label">蓝牙名称</view>
			<view class="value">{{ matchedDeviceName }}</view>
			<view class="label">蓝牙地址</view>
			<view class="value">{{ deviceId || '未获取到deviceId' }}</view>
			<view class="label">连接状态</view>
			<view class="value">{{ statusText }}</view>
		</view>
		<view class="card">
			<view class="media-card">
				<view class="title">媒体</view>
				<button type="primary" :disabled="isSending" @click="handleTakePhoto">
					拍照
				</button>
				<view class="media-card-record">
					<button type="primary" :disabled="isSending" @click="handleStartRecording">
						开始录像
					</button>
					<button class="media-btn btn" type="primary" :disabled="isSending" @click="handleStopRecording">
						停止录像
					</button>
				</view>
				<view class="media-card-record">
					<button type="primary" :disabled="isSending" @click="handleSetRecordingDuration(0)">
						15s
					</button>
					<button class="media-btn btn" type="primary" :disabled="isSending" @click="handleSetRecordingDuration(1)">
						1min
					</button>
					<button class="media-btn btn" type="primary" :disabled="isSending" @click="handleSetRecordingDuration(2)">
						3min
					</button>
					<button class="media-btn btn" type="primary" :disabled="isSending" @click="handleSetRecordingDuration(3)">
						5min
					</button>
					<button class="media-btn btn" type="primary" :disabled="isSending" @click="handleSetRecordingDuration(4)">
						10min
					</button>
				</view>
			</view>
		</view>
		<view class="card ">
			<view class="title">电量</view>
				<view class="query-result">
					<view class="query-result-label">电量</view>
					<view class="query-result-value">{{ batteryLevel }}</view>
				</view>
		</view>
		<view class="card ">
			<view class="title">查询文件</view>
			<view class="query-card">
				<view class="query-result">
					<view class="query-result-label">文件数量</view>
					<view class="query-result-value">{{ filesCnt }}</view>
				</view>
				<button type="primary" :disabled="isSending" @click="handleFilesClear">
					清空
				</button>
				<button type="primary" :disabled="isSending" @click="handleQueryFilesCnt">
					查询
				</button>
			</view>
			<button type="primary" :disabled="isSending" @click="handleFormatDevice">
				格式化
			</button>
		</view>
		<!-- <view class="card ">
			<view class="title">摘下休眠</view>
			<view class="sleep-card">
				<button type="primary" :disabled="isSending" @click="handleUpdateWearingOn">
					开启
				</button>
				<button type="primary" :disabled="isSending" @click="handleUpdateWearingOff">
					关闭
				</button>
			</view>
		</view> -->
		<view class="card ">
			<view class="title">版本号</view>
			<view class="version-card">
				<view class="version-item">
					<view class="query-result">
						<view class="query-result-label">杰理版本</view>
						<view class="query-result-value version-text">{{ btVersion }}</view>
					</view>
					<button type="primary" :disabled="isSending" @click="handleQueryBtVersion">
						查询
					</button>
				</view>
				<view class="version-item">
					<view class="query-result">
						<view class="query-result-label">富瀚版本</view>
						<view class="query-result-value version-text">{{ linuxVersion }}</view>
					</view>
					<button type="primary" :disabled="isSending" @click="handleQueryLinuxVersion">
						查询	
					</button>
				</view>
				<view class="version-item">
					<view class="query-result">
						<view class="query-result-label">国新版本</view>
						<view class="query-result-value version-text">{{ gx8002Version }}</view>
					</view>
					<button type="primary" :disabled="isSending" @click="handleQueryGx8002Version">
						查询	
					</button>
				</view>
			</view>
		</view>
		<view class="card">
			<view class="title">发送数据</view>
			<view class="send-card">
				<input class="send-input" type="text" v-model="customCommand"
					placeholder="例如 AA 02 03 07 00 00 D0 54" />
				<button type="primary" :disabled="isSending" @click="handleSendCustomCommand">
					发送
				</button>
			</view>
		</view>
		<view class="card">
			<view class="receive-header">
				<view class="title">接收数据</view>
			</view>
			<scroll-view scroll-y class="receive-box">
				<text class="receive-text">{{ receivedData }}</text>
			</scroll-view>
			<button class="clear-btn" size="mini" :disabled="!receivedData" @click="handleClearReceivedData">
				清空
			</button>
		</view>
	</view>
</template>

<script setup>
import {
	ref
} from 'vue'
import {
	onLoad
} from '@dcloudio/uni-app'
import {
	getSppState,
	sendSppHexCommand,
	buildSppHexCommandWithCrc,
	setOnSppReceive
} from '../../utils/spp'

const matchedDeviceName = ref('未获取到设备名称')
const deviceId = ref('')
const statusText = ref('未连接')
const batteryLevel = ref('')
const receivedData = ref('')
const filesCnt = ref(0)
const btVersion = ref('未查询')
const linuxVersion = ref('未查询')
const gx8002Version = ref('未查询')
const isSending = ref(false)
const customCommand = ref('AA 02 03 07 00 00 D0 54')
const FILE_IMPORT_COMMAND = buildSppHexCommandWithCrc('AA 02 03 29 00 00')
const P2P_SERVER_IP = '192.168.49.1'
const P2P_SERVER_PORT = 8556
const P2P_CONNECT_TIMEOUT_MS = 6000
const P2P_READ_TIMEOUT_MS = 3000
const P2P_OUTPUT_DIR = '_doc/p2p'
const PHOTO_COMMAND = buildSppHexCommandWithCrc('AA 02 03 60 00 00')
const START_RECORDING_COMMAND = buildSppHexCommandWithCrc('AA 02 03 61 00 00')
const STOP_RECORDING_COMMAND = buildSppHexCommandWithCrc('AA 02 03 62 00 00')
const SET_RECORDING_DURATION_COMMAND_PREFIX = 'AA 02 03 25 00 01'
const QUERY_FILES_CNT_COMMAND = buildSppHexCommandWithCrc('AA 02 03 07 00 00')
const QUERY_FILES_CLEAR_COMMAND = buildSppHexCommandWithCrc('AA 02 03 08 00 00')
const QUERY_BT_VERSION_COMMAND = buildSppHexCommandWithCrc('AA 02 03 14 00 00')
const QUERY_LINUX_VERSION_COMMAND = buildSppHexCommandWithCrc('AA 02 03 15 00 00')
const QUERY_BATTERY_COMMAND = buildSppHexCommandWithCrc('AA 02 03 05 00 00')
const QUERY_GX8002_VERSION_COMMAND = buildSppHexCommandWithCrc('AA 02 03 69 00 00')
const APP_WEARING_ON_COMMAND = buildSppHexCommandWithCrc('AA 02 03 66 00 01 01')
const APP_WEARING_OFF_COMMAND = buildSppHexCommandWithCrc('AA 02 03 66 00 01 00')
const APP_FORMAT_COMMAND = buildSppHexCommandWithCrc('AA 02 03 08 00 00')


const isAndroidPlusRuntime = () => typeof plus !== 'undefined' && !!plus.android

const closeAndroidQuietly = (target) => {
	if (!target) {
		return
	}
	try {
		plus.android.invoke(target, 'close')
	} catch (error) {
		// ignore close errors
	}
}

const wait = (ms) => new Promise((resolve) => {
	setTimeout(resolve, ms)
})

const ensureP2POutputDirectory = () => new Promise((resolve, reject) => {
	plus.io.resolveLocalFileSystemURL(
		'_doc/',
		(root) => {
			root.getDirectory(
				'p2p',
				{
					create: true
				},
				() => resolve(),
				(error) => reject(new Error(error?.message || '创建下载目录失败'))
			)
		},
		(error) => reject(new Error(error?.message || '访问本地目录失败'))
	)
})

const receiveP2PFileBytes = () => {
	if (!isAndroidPlusRuntime()) {
		throw new Error('当前环境不支持P2P下载，请在Android App端运行')
	}

	let socket = null
	let inputStream = null
	let byteArrayOutputStream = null

	try {
		socket = plus.android.newObject('java.net.Socket')
		const socketAddress = plus.android.newObject('java.net.InetSocketAddress', P2P_SERVER_IP, P2P_SERVER_PORT)
		plus.android.invoke(socket, 'connect', socketAddress, P2P_CONNECT_TIMEOUT_MS)
		plus.android.invoke(socket, 'setSoTimeout', P2P_READ_TIMEOUT_MS)

		inputStream = plus.android.invoke(socket, 'getInputStream')
		byteArrayOutputStream = plus.android.newObject('java.io.ByteArrayOutputStream')

		let receivedLength = 0
		while (true) {
			let nextByte = -1
			try {
				nextByte = plus.android.invoke(inputStream, 'read')
			} catch (error) {
				const message = String(error?.message || '')
				if (receivedLength > 0 && /timed out|timeout/i.test(message)) {
					break
				}
				throw error
			}

			if (nextByte === -1) {
				break
			}

			receivedLength += 1
			plus.android.invoke(byteArrayOutputStream, 'write', nextByte)
		}

		if (receivedLength <= 0) {
			throw new Error('未接收到P2P文件数据')
		}

		const bytes = plus.android.invoke(byteArrayOutputStream, 'toByteArray')
		return {
			bytes,
			length: receivedLength
		}
	} finally {
		closeAndroidQuietly(inputStream)
		closeAndroidQuietly(byteArrayOutputStream)
		closeAndroidQuietly(socket)
	}
}

const saveP2PFileToLocal = async (javaBytes) => {
	if (!isAndroidPlusRuntime()) {
		throw new Error('当前环境不支持保存文件')
	}

	await ensureP2POutputDirectory()

	const fileName = `p2p_${Date.now()}.bin`
	const relativePath = `${P2P_OUTPUT_DIR}/${fileName}`
	const absolutePath = plus.io.convertLocalFileSystemURL(relativePath)

	let outputStream = null
	try {
		outputStream = plus.android.newObject('java.io.FileOutputStream', absolutePath)
		plus.android.invoke(outputStream, 'write', javaBytes)
		plus.android.invoke(outputStream, 'flush')
	} finally {
		closeAndroidQuietly(outputStream)
	}

	return relativePath
}

const parseFilesCountFromPacket = (bytes) => {
	if (!Array.isArray(bytes) || bytes.length < 11) {
		return null
	}

	for (let i = 0; i <= bytes.length - 11; i += 1) {
		const isFileCountPacket =
			bytes[i] === 0xAA &&
			bytes[i + 1] === 0x03 &&
			bytes[i + 2] === 0x02 &&
			bytes[i + 3] === 0x07 &&
			bytes[i + 4] === 0x00 &&
			bytes[i + 5] === 0x03 &&
			bytes[i + 6] === 0x00

		if (!isFileCountPacket) {
			continue
		}

		const low = bytes[i + 7] & 0xFF
		const high = bytes[i + 8] & 0xFF
		return low
	}

	return null
}

const parseBatteryLevelFromPacket = (bytes) => {
	if (!Array.isArray(bytes) || bytes.length < 5) {
		return null
	}

	for (let i = 0; i <= bytes.length - 5; i += 1) {
		const isHeader = bytes[i] === 0xAA && bytes[i + 1] === 0x03 && bytes[i + 2] === 0x02
		if (!isHeader) continue

		const cmd = bytes[i + 3] & 0xFF

		// 支持常见的电量返回格式：0x68 或 0x05（兼容不同固件）
		if (cmd !== 0x68 && cmd !== 0x05) continue

		// 优先尝试已知偏移：i+6（现有实现），其次 i+5、i+4
		const candidateOffsets = [6, 5, 4]
		for (let off of candidateOffsets) {
			const pos = i + off
			if (pos < 0 || pos >= bytes.length) continue
			const val = bytes[pos] & 0xFF
			if (val >= 0 && val <= 100) {
				return val
			}
		}
	}

	return null
}

// 精准解析杰理/富瀚版本号 ASCII字符串
const parseCommandResponseHex = (bytes, commandCode) => {
	if (!Array.isArray(bytes) || bytes.length < 8) {
		return null
	}

	for (let i = 0; i <= bytes.length - 8; i++) {
		// 匹配协议头 AA 03 02 + 指令码
		const match =
			bytes[i] === 0xAA &&
			bytes[i+1] === 0x03 &&
			bytes[i+2] === 0x02 &&
			bytes[i+3] === commandCode

		if (!match) continue

		// ======================
		// 跳过：AA 03 02 15 00 00 0b
		// ======================
		const startIndex = i + 6
		const versionBytes = []
		
		// 读取连续有效ASCII，直到不是可打印字符为止
		for (let j = startIndex; j < bytes.length; j++) {
			const b = bytes[j]
			// 只提取 0-9 . 这些字符
			if ((b >= 0x30 && b <= 0x39) || b === 0x2E) {
				versionBytes.push(b)
			} else {
				break
			}
		}

		// 转字符串
		return String.fromCharCode(...versionBytes)
	}

	return null
}

const decodeParam = (value) => {
	if (!value) {
		return ''
	}
	try {
		return decodeURIComponent(value)
	} catch (error) {
		return value
	}
}

onLoad((options = {}) => {
	const routeDeviceName = decodeParam(options.deviceName)
	const routeDeviceId = decodeParam(options.deviceId)
	const sppState = getSppState()

	matchedDeviceName.value = routeDeviceName || sppState.deviceName || '未获取到设备名称'
	deviceId.value = routeDeviceId || sppState.deviceId || ''
	statusText.value = sppState.connected ? '已连接' : '未连接'

	setOnSppReceive((bytes) => {
		const hexString = bytes.map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join(' ')
		receivedData.value += hexString + '\n'

		const parsedBatteryLevel = parseBatteryLevelFromPacket(bytes)
		if (parsedBatteryLevel !== null) {
			batteryLevel.value = `${parsedBatteryLevel}%`
		}

		const parsedFilesCount = parseFilesCountFromPacket(bytes)
		if (parsedFilesCount !== null) {
			filesCnt.value = parsedFilesCount
		}

		const btVersionResponse = parseCommandResponseHex(bytes, 0x14)
		if (btVersionResponse) {
			btVersion.value = btVersionResponse
		}

		const linuxVersionResponse = parseCommandResponseHex(bytes, 0x15)
		if (linuxVersionResponse) {
			linuxVersion.value = linuxVersionResponse
		}

		const gx8002VersionResponse = parseCommandResponseHex(bytes, 0x69)
		if (gx8002VersionResponse) {
			gx8002Version.value = gx8002VersionResponse
		}
	})


	// 如果当前已连接，启动时额外查询一次电量（只查询一次，后续由接收回调更新）
	if (sppState.connected) {
		setTimeout(() => {
			try {
				sendSppHexCommand(QUERY_BATTERY_COMMAND)
			} catch (err) {
				// 忽略发送错误
			}
		}, 200)
	}

})
const sendCaptureCommand = (command) => {
	if (isSending.value) {
		return
	}
	sendSppHexCommand(command)
	uni.showToast({
		title: '命令已发送',
		icon: 'success'
	})
}

const handleTakePhoto = () => {
	sendCaptureCommand(PHOTO_COMMAND)
}

const handleStartRecording = () => {
	sendCaptureCommand(START_RECORDING_COMMAND)
}

const handleStopRecording = () => {
	sendCaptureCommand(STOP_RECORDING_COMMAND)
}

const handleSetRecordingDuration = (durationCode) => {
	const payload = Number(durationCode)
	if (!Number.isInteger(payload) || payload < 0 || payload > 0xFF) {
		uni.showToast({
			title: '录制时长参数无效',
			icon: 'none'
		})
		return
	}

	sendCaptureCommand(
		buildSppHexCommandWithCrc(
			`${SET_RECORDING_DURATION_COMMAND_PREFIX} ${payload.toString(16).toUpperCase().padStart(2, '0')}`
		)
	)
}

const handleQueryFilesCnt = () => {
	sendCaptureCommand(QUERY_FILES_CNT_COMMAND)
}

const handleFormatDevice = () => {
	sendCaptureCommand(APP_FORMAT_COMMAND)
}

const handleFilesClear = () => {
	sendCaptureCommand(QUERY_FILES_CLEAR_COMMAND)
}

const handleQueryBtVersion = () => {
	btVersion.value = '查询中...'
	sendCaptureCommand(QUERY_BT_VERSION_COMMAND)
}

const handleQueryLinuxVersion = () => {
	linuxVersion.value = '查询中...'
	sendCaptureCommand(QUERY_LINUX_VERSION_COMMAND)
}

const handleQueryGx8002Version = () => {
    gx8002Version.value = '查询中...'
    sendCaptureCommand(QUERY_GX8002_VERSION_COMMAND)
}

const handleUpdateWearingOn = () => {
	sendCaptureCommand(APP_WEARING_ON_COMMAND)
}
const handleUpdateWearingOff = () => {
	sendCaptureCommand(APP_WEARING_OFF_COMMAND)
}

const handleSendCustomCommand = () => {
	const command = customCommand.value.trim()
	if (!command) {
		uni.showToast({
			title: '请输入命令',
			icon: 'none'
		})
		return
	}

	try {
		sendSppHexCommand(command)
		uni.showToast({
			title: '命令已发送',
			icon: 'success'
		})
	} catch (error) {
		uni.showToast({
			title: error?.message || '发送失败',
			icon: 'none'
		})
	}
}

const handleP2PFileTransfer = async () => {
	if (isSending.value) {
		return
	}

	if (!isAndroidPlusRuntime()) {
		uni.showToast({
			title: '请在Android App端运行',
			icon: 'none'
		})
		return
	}

	isSending.value = true
	uni.showLoading({
		title: 'P2P下载中',
		mask: true
	})

	try {
		sendSppHexCommand(FILE_IMPORT_COMMAND)
		await wait(400)

		const {
			bytes,
			length
		} = receiveP2PFileBytes()
		const localPath = await saveP2PFileToLocal(bytes)

		receivedData.value += `[P2P] 已下载 ${length} 字节 -> ${localPath}\n`
		uni.showToast({
			title: '下载完成',
			icon: 'success'
		})
	} catch (error) {
		uni.showToast({
			title: error?.message || 'P2P下载失败',
			icon: 'none'
		})
	} finally {
		uni.hideLoading()
		isSending.value = false
	}
}

const handleClearReceivedData = () => {
	receivedData.value = ''
}
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
	padding: 28rpx;
	box-shadow: 0 8rpx 30rpx rgba(26, 44, 80, 0.08);
	margin-bottom: 10px;
}

.title {
	font-size: 34rpx;
	font-weight: 600;
	color: #1f2f4d;
	margin-bottom: 24rpx;
}

.receive-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16rpx;

	.title {
		margin-bottom: 0;
	}

	.clear-btn {
		width: auto;
		height: 56rpx;
		line-height: 56rpx;
		padding: 0 20rpx;
		font-size: 24rpx;
		letter-spacing: 0;
		border-radius: 12rpx;
		flex-shrink: 0;
	}
}

.label {
	font-size: 24rpx;
	color: #6b7b9b;
	margin-bottom: 12rpx;
}

.value {
	font-size: 30rpx;
	color: #253a63;
	word-break: break-all;
	margin-bottom: 20rpx;
}


.media-card {
	display: flex;
	margin: 12rpx;
	flex-direction: column;
	gap: 16rpx;
}

.media-card-record {
	display: flex;
	gap: 16rpx;
}

.receive-box {
	height: 300rpx;
	background: #f8f9fa;
	border-radius: 12rpx;
	padding: 16rpx;
	box-sizing: border-box;
}

.receive-text {
	font-size: 26rpx;
	color: #333;
	word-wrap: break-word;
	white-space: pre-wrap;
}

.media-btn {
	width: 100%;
}


.query-card {
	display: flex;
	// flex-direction: column;
	gap: 20rpx;

	.query-result {
		width: 80%;
	}

	button {
		width: 20%;
		flex-shrink: 0;
	}
}

.query-result {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 22rpx 24rpx;
	border-radius: 16rpx;
	background: linear-gradient(180deg, #f7faff 0%, #eef4ff 100%);
	border: 1rpx solid #dbe5fb;
	margin-bottom: 4rpx;
	box-sizing: border-box;
	gap: 20rpx;
}

.send-card {
	display: flex;
	gap: 20rpx;
	align-items: center;

	.send-input {
		flex: 1;
		height: 88rpx;
		padding: 0 24rpx;
		border: 1rpx solid #dbe5fb;
		border-radius: 16rpx;
		background: #f8fbff;
		font-size: 28rpx;
		color: #1f2f4d;
	}

	button {
		width: 20%;
		flex-shrink: 0;
	}
}


.query-result-label {
	font-size: 26rpx;
	color: #6b7b9b;
	white-space: nowrap;
}

.query-result-value {
	font-size: 48rpx;
	font-weight: 700;
	color: #1f4ed8;
	line-height: 1;
	min-width: 96rpx;
	text-align: right;
}

.version-text {
	font-size: 24rpx;
	line-height: 1.4;
	word-break: break-all;
	white-space: normal;
}

.version-card {
	display: flex;
	flex-direction: column;
	gap: 20rpx;
	
	.version-item {
		display: flex;
		flex-direction: row;
		.query-result {
			display: flex;
			width: 80%;
		}
	
		button {
			width: 20%;
			flex-shrink: 0;
		}
	}

}

.sleep-card {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16rpx;
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