<template>
	<view class="content">
		<card-device-info 
			:device-name="matchedDeviceName"
			:device-id="deviceId"
			:status-text="statusText"
			:battery-level="batteryLevel"
			:is-sending="isSending"
			@openGuide="handleOpenGuide"
		/>
		<card-media-control 
			:is-sending="isSending"
			@takePhoto="handleTakePhoto"
			@startRecording="handleStartRecording"
			@stopRecording="handleStopRecording"
			@setDuration="handleSetRecordingDuration"
		/>
		<card-eq-settings 
			:selected-eq="selectedEq"
			:is-sending="isSending"
			@setEq="handleSetEQ"
		/>
		<card-file-query 
			:files-cnt="filesCnt"
			:is-sending="isSending"
			@query="handleQueryFilesCnt"
			@format="handleFormatDevice"
		/>
		<card-version-info 
			:bt-version="btVersion"
			:linux-version="linuxVersion"
			:gx8002-version="gx8002Version"
			:is-sending="isSending"
			@queryBt="handleQueryBtVersion"
			@queryLinux="handleQueryLinuxVersion"
			@queryGx8002="handleQueryGx8002Version"
		/>
		<card-data-sender 
			v-model="customCommand"
			:is-sending="isSending"
			@send="handleSendCustomCommand"
		/>
		<card-data-receiver 
			:received-data="receivedData"
			@clear="handleClearReceivedData"
		/>
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
import CardDeviceInfo from '../../components/card-device-info/card-device-info.vue'
import CardMediaControl from '../../components/card-media-control/card-media-control.vue'
import CardEqSettings from '../../components/card-eq-settings/card-eq-settings.vue'
import CardFileQuery from '../../components/card-file-query/card-file-query.vue'
import CardVersionInfo from '../../components/card-version-info/card-version-info.vue'
import CardDataSender from '../../components/card-data-sender/card-data-sender.vue'
import CardDataReceiver from '../../components/card-data-receiver/card-data-receiver.vue'
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

// 将字节数组按帧格式化为带换行的 HEX 字符串：
// 遇到帧头 AA 03 02 时视为新帧起始，给每帧单独一行
const formatHexFrames = (bytes) => {
	if (!Array.isArray(bytes) || bytes.length === 0) return ''

	const hex = (b) => b.toString(16).toUpperCase().padStart(2, '0')

	const starts = []
	for (let i = 0; i <= bytes.length - 3; i++) {
		if (bytes[i] === 0xAA && bytes[i + 1] === 0x03 && bytes[i + 2] === 0x02) {
			starts.push(i)
		}
	}

	// 若没有检测到帧头，返回整段十六进制字符串（保持原行为）
	if (starts.length === 0) {
		return bytes.map(hex).join(' ')
	}

	const frames = []
	for (let k = 0; k < starts.length; k++) {
		const s = starts[k]
		const e = k + 1 < starts.length ? starts[k + 1] : bytes.length
		const slice = bytes.slice(s, e)
		frames.push(slice.map(hex).join(' '))
	}

	return frames.join('\n')
}

onLoad((options = {}) => {
	const routeDeviceName = decodeParam(options.deviceName)
	const routeDeviceId = decodeParam(options.deviceId)
	const sppState = getSppState()

	matchedDeviceName.value = routeDeviceName || sppState.deviceName || '未获取到设备名称'
	deviceId.value = routeDeviceId || sppState.deviceId || ''
	statusText.value = sppState.connected ? '已连接' : '未连接'

	setOnSppReceive((bytes) => {
		const formatted = formatHexFrames(bytes)
		receivedData.value += formatted + '\n'

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
</style>