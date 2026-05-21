<template>
	<view class="content">
		<card-device-info :device-name="matchedDeviceName" :device-id="deviceId" :status-text="statusText"
			:battery-level="batteryLevel" :is-sending="isSending" @openGuide="handleOpenGuide" />
		<card-eq-settings :selected-eq="selectedEq" :is-sending="isSending" @setEq="handleSetEQ" />
		<card-media-control :is-sending="isSending" @takePhoto="handleTakePhoto" @startRecording="handleStartRecording"
			@stopRecording="handleStopRecording" @setDuration="handleSetRecordingDuration" />
		<card-file-query :files-cnt="filesCnt" :is-sending="isSending" @query="handleQueryFilesCnt"
			@format="handleFormatDevice" />
		<card-version-info :bt-version="btVersion" :linux-version="linuxVersion" :gx8002-version="gx8002Version"
			:is-sending="isSending" @queryBt="handleQueryBtVersion" @queryLinux="handleQueryLinuxVersion"
			@queryGx8002="handleQueryGx8002Version" />
		<card-data-sender v-model="customCommand" :is-sending="isSending" @send="handleSendCustomCommand" />
		<card-data-receiver :received-data="receivedData" @clear="handleClearReceivedData" />
		<tutorial v-model="showGuide" :guide-ack="guideAck" />
	</view>
</template>

<script setup>
import {
	ref
} from 'vue'
import {
	onLoad
} from '@dcloudio/uni-app'
import Tutorial from '../../components/tutorial/tutorial.vue'
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

const COMMAND_CODES = {
	QUERY_BATTERY: '05',
	QUERY_FILES_CNT: '07',
	APP_FORMAT: '08',
	QUERY_BT_VERSION: '14',
	QUERY_LINUX_VERSION: '15',
	SET_RECORDING_DURATION: '25',
	FILE_IMPORT: '29',
	PHOTO: '60',
	START_RECORDING: '61',
	STOP_RECORDING: '62',
	APP_WEARING: '66',
	QUERY_GX8002_VERSION: '69',
	SET_EQ: '82',
	GET_EQ: '83',
}

// 生成完整命令的辅助函数
const buildCommand = (code, len = '00', data = '') => {
	const cmd = `AA 02 03 ${code} 00 ${len}${data ? ` ${data}` : ''}`
	return buildSppHexCommandWithCrc(cmd)
}

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

	// 命令处理器映射
	const commandHandlers = {
		0x05: (bytes) => {
			// 查询电池电量
			const level = parseBatteryLevelFromPacket(bytes)
			if (level !== null) {
				batteryLevel.value = `${level}%`
			}
		},
		0x07: (bytes) => {
			// 查询文件数量
			const count = parseFilesCountFromPacket(bytes)
			if (count !== null) {
				filesCnt.value = count
			}
		},
		0x08: (bytes) => {
			// 格式化完成
			const format = parseFilesCountFormatFromPacket(bytes)
			if (format === '1') {
				filesCnt.value = 0
			}
		},
		0x14: (bytes) => {
			// BT 版本
			const version = parseCommandVersion(bytes, 0x14)
			if (version) {
				btVersion.value = version
			}
		},
		0x15: (bytes) => {
			// Linux 版本
			const version = parseCommandVersion(bytes, 0x15)
			if (version) {
				linuxVersion.value = version
			}
		},
		0x68: (bytes) => {
			// 主动上报电池电量
			const level = parseBatteryLevelFromPacket(bytes)
			if (level !== null) {
				batteryLevel.value = `${level}%`
			}
		},
		0x69: (bytes) => {
			// GX8002 版本
			const version = parseCommandVersion(bytes, 0x69)
			if (version) {
				gx8002Version.value = version
			}
		},
		0x81: (bytes, index) => {
			// 指南确认
			guideAck.value = {
				step: bytes[index + 6] & 0xFF,
				result: bytes[index + 7] & 0xFF,
				receivedAt: Date.now()
			}
		},
		0x83: (bytes, index) => {
			// Get EQ 响应
			const eqValue = bytes[index + 6]
			if (eqValue !== undefined) {
				selectedEq.value = eqValue
			}
		},
	}

	// 处理接收到的 SPP 数据
	const processSppDataFrame = (bytes) => {
		const formatted = formatHexFrames(bytes)
		receivedData.value += formatted + '\n'

		// 查找所有帧头并处理
		for (let i = 0; i <= bytes.length - 4; i++) {
			if (bytes[i] === 0xAA && bytes[i + 1] === 0x03 && bytes[i + 2] === 0x02) {
				const commandCode = bytes[i + 3]
				const handler = commandHandlers[commandCode]
				if (handler) {
					handler(bytes, i)
				}
			}
		}
	}

	setOnSppReceive(processSppDataFrame)


	// 如果当前已连接，启动时额外查询一次电量（只查询一次，后续由接收回调更新）
	if (sppState.connected) {
		setTimeout(() => {
			try {
				sendSppHexCommand(buildCommand(COMMAND_CODES.QUERY_BATTERY))
				sendSppHexCommand(buildCommand(COMMAND_CODES.GET_EQ))
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
	sendCaptureCommand(buildCommand(COMMAND_CODES.PHOTO))
}

const handleStartRecording = () => {
	sendCaptureCommand(buildCommand(COMMAND_CODES.START_RECORDING))
}

const handleStopRecording = () => {
	sendCaptureCommand(buildCommand(COMMAND_CODES.STOP_RECORDING))
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

	const eqHex = payload.toString(16).toUpperCase().padStart(2, '0')
	sendCaptureCommand(buildCommand(COMMAND_CODES.SET_EQ, '01', eqHex))
}

const handleSetRecordingDuration = (durationCode) => {
	const payload = Number(durationCode)
	
	// 0 = 未设置，不发送命令
	if (payload === 0) {
		return
	}
	
	// 转换为原来的值（减1）
	const actualValue = payload - 1
	if (!Number.isInteger(actualValue) || actualValue < 0 || actualValue > 0xFF) {
		uni.showToast({
			title: '录制时长参数无效',
			icon: 'none'
		})
		return
	}

	const durationHex = actualValue.toString(16).toUpperCase().padStart(2, '0')
	sendCaptureCommand(buildCommand(COMMAND_CODES.SET_RECORDING_DURATION, '01', durationHex))
}

const handleQueryFilesCnt = () => {
	filesCnt.value = '查询中...'
	sendCaptureCommand(buildCommand(COMMAND_CODES.QUERY_FILES_CNT))
}

const handleFormatDevice = () => {
	sendCaptureCommand(buildCommand(COMMAND_CODES.FORMAT_DEVICE))
}

const handleQueryBtVersion = () => {
	btVersion.value = '查询中...'
	sendCaptureCommand(buildCommand(COMMAND_CODES.QUERY_BT_VERSION))
}

const handleQueryLinuxVersion = () => {
	linuxVersion.value = '查询中...'
	sendCaptureCommand(buildCommand(COMMAND_CODES.QUERY_LINUX_VERSION))
}

const handleQueryGx8002Version = () => {
	gx8002Version.value = '查询中...'
	sendCaptureCommand(buildCommand(COMMAND_CODES.QUERY_GX8002_VERSION))
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