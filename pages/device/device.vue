<template>
	<view class="content">
		<view class="card device-card">
			<view class="title">设备</view>
			<view class="device-grid">
				<view class="device-item">
					<view class="label">蓝牙名称</view>
					<view class="value">{{ matchedDeviceName }}</view>
				</view>
				<view class="device-item">
					<view class="label">蓝牙地址</view>
					<view class="value">{{ deviceId || '未获取到deviceId' }}</view>
				</view>
				<view class="device-item">
					<view class="label">连接状态</view>
					<view class="value">{{ statusText }}</view>
				</view>
				<view class="device-item">
					<view class="label">电量</view>
					<view class="value">{{ batteryLevel }}</view>
				</view>
			</view>
			<button class="guide-btn" type="primary" :disabled="isSending" @click="handleOpenGuide">
				新手引导
			</button>
		</view>
		<view class="card">
			<view class="media-card">
				<view class="title">媒体</view>
				<button type="primary" :disabled="isSending" @click="handleTakePhoto">
					拍照
				</button>
				<view class="general-card">
					<button type="primary" :disabled="isSending" @click="handleStartRecording">
						开始录像
					</button>
					<button class="media-btn btn" type="primary" :disabled="isSending" @click="handleStopRecording">
						停止录像
					</button>
				</view>
				<view class="general-card">
					<button class="media-btn btn" type="primary" :disabled="isSending " @click="handleSetRecordingDuration(0)">
						15s
					</button>
					<button class="media-btn btn" type="primary" :disabled="isSending"
						@click="handleSetRecordingDuration(1)">
						1min
					</button>
					<button class="media-btn btn" type="primary" :disabled="isSending"
						@click="handleSetRecordingDuration(2)">
						3min
					</button>
					<button class="media-btn btn" type="primary" :disabled="isSending"
						@click="handleSetRecordingDuration(3)">
						5min
					</button>
					<button class="media-btn btn" type="primary" :disabled="isSending"
						@click="handleSetRecordingDuration(4)">
						10min
					</button>
				</view>
			</view>
		</view>
		<view class="card">
			<view class="title">音效设置</view>
			<view class="general-card">
				<button class="media-btn btn eq-btn" :class="{ active: selectedEq === 0 }" type="primary"
					:disabled="isSending" @click="handleSetEQ(0)">
					标准
				</button>
				<button class="media-btn btn eq-btn" :class="{ active: selectedEq === 1 }" type="primary"
					:disabled="isSending" @click="handleSetEQ(1)">
					澎湃
				</button>
				<button class="media-btn btn eq-btn" :class="{ active: selectedEq === 2 }" type="primary"
					:disabled="isSending" @click="handleSetEQ(2)">
					静谧
				</button>
			</view>
		</view>
		<view class="card ">
			<view class="title">查询文件</view>
			<view class="query-card">
				<view class="query-result">
					<view class="query-result-label">文件数量</view>
					<view class="query-result-value">{{ filesCnt }}</view>
				</view>
				<button type="primary" :disabled="isSending" @click="handleFormatDevice">
					清空
				</button>
				<button type="primary" :disabled="isSending" @click="handleQueryFilesCnt">
					查询
				</button>
			</view>
		</view>
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
		<guide-popup v-model="showGuide" :guide-ack="guideAck" />
	</view>
</template>

<script setup>
import {
	ref
} from 'vue'
import {
	onLoad
} from '@dcloudio/uni-app'
import GuidePopup from '../../components/guide-popup/guide-popup.vue'
import {
	getSppState,
	sendSppHexCommand,
	buildSppHexCommandWithCrc,
	setOnSppReceive
} from '../../utils/spp'

const matchedDeviceName = ref('未获取到设备名称')
const deviceId = ref('')
const statusText = ref('未连接')
const batteryLevel = ref('--')
const receivedData = ref('')
const selectedEq = ref(null)
const filesCnt = ref(0)
const btVersion = ref('未查询')
const linuxVersion = ref('未查询')
const gx8002Version = ref('未查询')
const isSending = ref(false)
const showGuide = ref(false)
const guideAck = ref(null)
const customCommand = ref('AA 02 03 07 00 00 D0 54')
const FILE_IMPORT_COMMAND = buildSppHexCommandWithCrc('AA 02 03 29 00 00')
const PHOTO_COMMAND = buildSppHexCommandWithCrc('AA 02 03 60 00 00')
const START_RECORDING_COMMAND = buildSppHexCommandWithCrc('AA 02 03 61 00 00')
const STOP_RECORDING_COMMAND = buildSppHexCommandWithCrc('AA 02 03 62 00 00')
const SET_RECORDING_DURATION_COMMAND_PREFIX = 'AA 02 03 25 00 01'
const SET_EQ_COMMAND_PREFIX = 'AA 02 03 82 00 01'
const GET_EQ_COMMAND = buildSppHexCommandWithCrc('AA 02 03 83 00 00')
const QUERY_FILES_CNT_COMMAND = buildSppHexCommandWithCrc('AA 02 03 07 00 00')
const QUERY_BT_VERSION_COMMAND = buildSppHexCommandWithCrc('AA 02 03 14 00 00')
const QUERY_LINUX_VERSION_COMMAND = buildSppHexCommandWithCrc('AA 02 03 15 00 00')
const QUERY_BATTERY_COMMAND = buildSppHexCommandWithCrc('AA 02 03 05 00 00')
const QUERY_GX8002_VERSION_COMMAND = buildSppHexCommandWithCrc('AA 02 03 69 00 00')
const APP_WEARING_ON_COMMAND = buildSppHexCommandWithCrc('AA 02 03 66 00 01 01')
const APP_WEARING_OFF_COMMAND = buildSppHexCommandWithCrc('AA 02 03 66 00 01 00')
const APP_FORMAT_COMMAND = buildSppHexCommandWithCrc('AA 02 03 08 00 00')


const parseFilesCountFormatFromPacket = (bytes) => {
	if (!Array.isArray(bytes) || bytes.length < 9) {
		return null
	}

	for (let i = 0; i <= bytes.length - 7; i += 1) {
		const isFormatDonePacket =
			bytes[i] === 0xAA &&
			bytes[i + 1] === 0x03 &&
			bytes[i + 2] === 0x02 &&
			bytes[i + 3] === 0x08 &&
			bytes[i + 4] === 0x00 &&
			bytes[i + 5] === 0x01 &&
			bytes[i + 6] === 0x01

		if (isFormatDonePacket) {
			return '1'
		}
	}

	return null
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

const parseCommandGetEQ = (bytes) => {
	if (!Array.isArray(bytes) || bytes.length < 9) {
		return null
	}

	for (let i = 0; i <= bytes.length - 6; i += 1) {
		const isFormatDonePacket =
			bytes[i] === 0xAA &&
			bytes[i + 1] === 0x03 &&
			bytes[i + 2] === 0x02 &&
			bytes[i + 3] === 0x83 &&
			bytes[i + 4] === 0x00 &&
			bytes[i + 5] === 0x01


		if (isFormatDonePacket) {
			return bytes[i + 6];
		}
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
const parseCommandVersion = (bytes, commandCode) => {
	if (!Array.isArray(bytes) || bytes.length < 8) {
		return null
	}

	for (let i = 0; i <= bytes.length - 8; i++) {
		// 匹配协议头 AA 03 02 + 指令码
		const match =
			bytes[i] === 0xAA &&
			bytes[i + 1] === 0x03 &&
			bytes[i + 2] === 0x02 &&
			bytes[i + 3] === commandCode

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

const parseGuideAckFromPacket = (bytes) => {
	if (!Array.isArray(bytes) || bytes.length < 8) {
		return null
	}

	for (let i = 0; i <= bytes.length - 8; i += 1) {
		const isGuideAck =
			bytes[i] === 0xAA &&
			bytes[i + 1] === 0x03 &&
			bytes[i + 2] === 0x02 &&
			bytes[i + 3] === 0x81

		if (!isGuideAck) {
			continue
		}

		return {
			step: bytes[i + 6] & 0xFF,
			result: bytes[i + 7] & 0xFF
		}
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

		const guideAckResponse = parseGuideAckFromPacket(bytes)
		if (guideAckResponse) {
			guideAck.value = {
				...guideAckResponse,
				receivedAt: Date.now()
			}
		}

		const parsedBatteryLevel = parseBatteryLevelFromPacket(bytes)
		if (parsedBatteryLevel !== null) {
			batteryLevel.value = `${parsedBatteryLevel}%`
		}

		const parsedCurEq = parseCommandGetEQ(bytes)
		if (parsedCurEq !== null) {
			selectedEq.value = parsedCurEq
		}

		const parsedFilesCount = parseFilesCountFromPacket(bytes)
		if (parsedFilesCount !== null) {
			filesCnt.value = parsedFilesCount
		}

		const parsedFilesCountFormat = parseFilesCountFormatFromPacket(bytes)
		if (parsedFilesCountFormat === '1') {
			filesCnt.value = 0
		}

		const btVersionResponse = parseCommandVersion(bytes, 0x14)
		if (btVersionResponse) {
			btVersion.value = btVersionResponse
		}

		const linuxVersionResponse = parseCommandVersion(bytes, 0x15)
		if (linuxVersionResponse) {
			linuxVersion.value = linuxVersionResponse
		}

		const gx8002VersionResponse = parseCommandVersion(bytes, 0x69)
		if (gx8002VersionResponse) {
			gx8002Version.value = gx8002VersionResponse
		}
	})


	// 如果当前已连接，启动时额外查询一次电量（只查询一次，后续由接收回调更新）
	if (sppState.connected) {
		setTimeout(() => {
			try {
				sendSppHexCommand(QUERY_BATTERY_COMMAND)
				sendSppHexCommand(GET_EQ_COMMAND)
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

const handleSetEQ = (eqCode) => {
	const payload = Number(eqCode)
	if (!Number.isInteger(payload) || payload < 0 || payload > 0xFF) {
		uni.showToast({
			title: 'eq参数无效',
			icon: 'none'
		})
		return
	}

	selectedEq.value = payload

	sendCaptureCommand(
		buildSppHexCommandWithCrc(
			`${SET_EQ_COMMAND_PREFIX} ${payload.toString(16).toUpperCase().padStart(2, '0')}`
		)
	)
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
	filesCnt.value = '查询中...'
	sendCaptureCommand(QUERY_FILES_CNT_COMMAND)
}

const handleFormatDevice = () => {
	sendCaptureCommand(APP_FORMAT_COMMAND)
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

const handleOpenGuide = () => {
	showGuide.value = true
}

const handleCloseGuide = () => {
	showGuide.value = false
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
	margin-bottom: 18rpx;
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
	font-size: 22rpx;
	color: #6b7b9b;
	margin-bottom: 8rpx;
}

.value {
	font-size: 26rpx;
	color: #253a63;
	word-break: break-all;
	margin-bottom: 0;
}

.device-card {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.device-grid {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 12rpx;
}

.device-item {
	padding: 16rpx 18rpx;
	min-height: 112rpx;
	border-radius: 14rpx;
	border: 1rpx solid #dbe5fb;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.guide-btn {
	height: 76rpx;
	line-height: 76rpx;
	border-radius: 14rpx;
	font-size: 26rpx;
	letter-spacing: 1rpx;
}

.media-card {
	display: flex;
	margin: 12rpx;
	flex-direction: column;
	gap: 16rpx;
}

.general-card {
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

.eq-btn {
	opacity: 0.3;
	transition: all 0.18s ease;

	&.active {
		opacity: 1;
		transform: translateY(-1rpx);
		box-shadow: 0 8rpx 18rpx rgba(31, 78, 216, 0.18);
	}
}


.query-card {
	display: flex;
	// flex-direction: column;
	gap: 20rpx;
	margin-bottom: 5px;

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
	font-size: 28rpx;
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