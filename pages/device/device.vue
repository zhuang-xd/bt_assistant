<template>
		<view class="page">
			<scroll-view class="page-body" scroll-y>
				<!-- 设备信息卡片 -->
				<card-device-info
					:deviceName="deviceName"
					:deviceId="deviceId"
					:statusText="statusText"
					:batteryLevel="batteryLevel"
					:isSending="isSending"
					@openGuide="showGuide"
				/>

				<!-- 音效设置 -->
				<card-eq-settings
					:selectedEq="selectedEq"
					:isSending="isSending"
					@setEq="handleSetEq"
				/>

				<!-- 媒体控制 -->
				<card-media-control
					:isSending="isSending"
					@takePhoto="handleTakePhoto"
					@startRecording="handleStartRecording"
					@stopRecording="handleStopRecording"
					@setDuration="handleSetDuration"
				/>

				<!-- 文件查询 -->
				<card-file-query
					:filesCnt="filesCnt"
					:isSending="isSending"
					@query="handleQueryFiles"
					@format="handleFormatFiles"
				/>

				<!-- 版本信息 -->
				<card-version-info
					:btVersion="btVersion"
					:linuxVersion="linuxVersion"
					:gx8002Version="gx8002Version"
					:isSending="isSending"
					@queryBt="handleQueryBt"
					@queryLinux="handleQueryLinux"
					@queryGx8002="handleQueryGx8002"
				/>

				<!-- 其他配置 -->
				<card-others
					:isSending="isSending"
					:wearingStatus="wearingStatus"
						:photoRecog2Resolution="photoRecog2Resolution"
					@handleWearingStatus="handleSwitchWearing"
						@setPhotoRecog2Resolution="handleSetPhotoRecog2Resolution"
				/>

				<!-- 发送数据 -->
				<card-data-sender
					v-model="sendData"
					:isSending="isSending"
					@send="handleSend"
				/>

				<!-- 接收数据 -->
				<card-data-receiver
					:receivedData="receivedData"
					@clear="receivedData = ''"
				/>

				<!-- 底部安全距离 -->
				<view class="bottom-safe"></view>
			</scroll-view>

			<!-- 新手引导弹窗 -->
			<tutorial v-model="showGuidePanel" :guideAck="guideAck" />
		</view>
	</template>

	<script setup>
	import { ref } from 'vue'
	import { onLoad } from '@dcloudio/uni-app'
	import Tutorial from '../../components/tutorial/tutorial.vue'
	import CardDeviceInfo from '../../components/card-device-info/card-device-info.vue'
	import CardMediaControl from '../../components/card-media-control/card-media-control.vue'
	import CardEqSettings from '../../components/card-eq-settings/card-eq-settings.vue'
	import CardFileQuery from '../../components/card-file-query/card-file-query.vue'
	import CardVersionInfo from '../../components/card-version-info/card-version-info.vue'
	import CardDataSender from '../../components/card-data-sender/card-data-sender.vue'
	import CardDataReceiver from '../../components/card-data-receiver/card-data-receiver.vue'
	import CardOthers from '../../components/card-others/card-others.vue'
	import { getSppState, sendSppHexCommand, buildSppHexCommandWithCrc, setOnSppReceive } from '../../utils/spp'

	const COMMAND_CODES = {
		QUERY_BATTERY: '05',
		QUERY_FILES_CNT: '07',
		APP_FORMAT: '08',
		QUERY_BT_VERSION: '14',
		QUERY_LINUX_VERSION: '15',
		SET_RECORDING_DURATION: '25',
		PHOTO: '60',
		START_RECORDING: '61',
		STOP_RECORDING: '62',
		QUERY_GX8002_VERSION: '80',
		SET_EQ: '82',
		GET_EQ: '83',
		SET_SWITCH_WEARING: '84',
		GET_SWITCH_WEARING: '85',
		SET_PHOTO_RECOG2_RESOLUTION: '71',
		GET_PHOTO_RECOG2_RESOLUTION: '86',
	}

	const buildCommand = (code, len = '00', data = '') => {
		const cmd = `AA 02 03 ${code} 00 ${len}${data ? ` ${data}` : ''}`
		return buildSppHexCommandWithCrc(cmd)
	}

	const deviceName = ref('未获取到设备名称')
	const deviceId = ref('')
	const statusText = ref('未连接')
	const batteryLevel = ref('--')
	const isSending = ref(false)

	const selectedEq = ref(null)
	const wearingStatus = ref(false)
	const photoRecog2Resolution = ref(1)
	const filesCnt = ref(0)
	const btVersion = ref('未查询')
	const linuxVersion = ref('未查询')
	const gx8002Version = ref('未查询')
	const receivedData = ref('')
	const sendData = ref('AA 02 03 05 00 00 71 94') // 发送指令模块的默认内容
	const showGuidePanel = ref(false)
	const guideAck = ref(null)

	const parseFilesCountFromPacket = (bytes) => {
		if (!Array.isArray(bytes) || bytes.length < 11) return null
		for (let i = 0; i <= bytes.length - 11; i++) {
			if (bytes[i] === 0xAA && bytes[i + 1] === 0x03 && bytes[i + 2] === 0x02 &&
				bytes[i + 3] === 0x07 && bytes[i + 4] === 0x00 && bytes[i + 5] === 0x03 && bytes[i + 6] === 0x00) {
				return bytes[i + 7] & 0xFF
			}
		}
		return null
	}

	const parseFormatDoneFromPacket = (bytes) => {
		if (!Array.isArray(bytes) || bytes.length < 7) return null
		for (let i = 0; i <= bytes.length - 7; i++) {
			if (bytes[i] === 0xAA && bytes[i + 1] === 0x03 && bytes[i + 2] === 0x02 &&
				bytes[i + 3] === 0x08 && bytes[i + 4] === 0x00 && bytes[i + 5] === 0x01 && bytes[i + 6] === 0x01) {
				return true
			}
		}
		return null
	}

	const parseBatteryLevelFromPacket = (bytes) => {
		if (!Array.isArray(bytes) || bytes.length < 5) return null
		for (let i = 0; i <= bytes.length - 5; i++) {
			if (bytes[i] !== 0xAA || bytes[i + 1] !== 0x03 || bytes[i + 2] !== 0x02) continue
			const cmd = bytes[i + 3] & 0xFF
			if (cmd !== 0x68 && cmd !== 0x05) continue
			for (const off of [6, 5, 4]) {
				const pos = i + off
				if (pos >= 0 && pos < bytes.length) {
					const val = bytes[pos] & 0xFF
					if (val >= 0 && val <= 100) return val
				}
			}
		}
		return null
	}

	const parseCommandVersion = (bytes, commandCode) => {
		if (!Array.isArray(bytes) || bytes.length < 8) return null
		for (let i = 0; i <= bytes.length - 8; i++) {
			if (bytes[i] !== 0xAA || bytes[i + 1] !== 0x03 || bytes[i + 2] !== 0x02 || bytes[i + 3] !== commandCode) continue
			const versionBytes = []
			for (let j = i + 6; j < bytes.length; j++) {
				const b = bytes[j]
				if ((b >= 0x30 && b <= 0x39) || b === 0x2E) {
					versionBytes.push(b)
				} else {
					break
				}
			}
			return String.fromCharCode(...versionBytes)
		}
		return null
	}

	const formatHexFrames = (bytes) => {
		if (!Array.isArray(bytes) || bytes.length === 0) return ''
		const hex = (b) => b.toString(16).toUpperCase().padStart(2, '0')
		const starts = []
		for (let i = 0; i <= bytes.length - 3; i++) {
			if (bytes[i] === 0xAA && bytes[i + 1] === 0x03 && bytes[i + 2] === 0x02) {
				starts.push(i)
			}
		}
		if (starts.length === 0) return bytes.map(hex).join(' ')
		const frames = []
		for (let k = 0; k < starts.length; k++) {
			const s = starts[k]
			const e = k + 1 < starts.length ? starts[k + 1] : bytes.length
			frames.push(bytes.slice(s, e).map(hex).join(' '))
		}
		return frames.join('\n')
	}

	const decodeParam = (value) => {
		if (!value) return ''
		try { return decodeURIComponent(value) } catch (e) { return value }
	}

	onLoad((options = {}) => {
		const routeDeviceName = decodeParam(options.deviceName)
		const routeDeviceId = decodeParam(options.deviceId)
		const sppState = getSppState()

		deviceName.value = routeDeviceName || sppState.deviceName || '未获取到设备名称'
		deviceId.value = routeDeviceId || sppState.deviceId || ''
		statusText.value = sppState.connected ? '已连接' : '未连接'

		const commandHandlers = {
			0x05: (bytes) => {
				const level = parseBatteryLevelFromPacket(bytes)
				if (level !== null) batteryLevel.value = `${level}%`
			},
			0x07: (bytes) => {
				const count = parseFilesCountFromPacket(bytes)
				if (count !== null) filesCnt.value = count
			},
			0x08: (bytes) => {
				if (parseFormatDoneFromPacket(bytes)) filesCnt.value = 0
			},
			0x14: (bytes) => {
				const version = parseCommandVersion(bytes, 0x14)
				if (version) btVersion.value = version
			},
			0x15: (bytes) => {
				const version = parseCommandVersion(bytes, 0x15)
				if (version) linuxVersion.value = version
			},
			0x68: (bytes) => {
				const level = parseBatteryLevelFromPacket(bytes)
				if (level !== null) batteryLevel.value = `${level}%`
			},
			0x80: (bytes) => {
				const version = parseCommandVersion(bytes, 0x80)
				if (version) gx8002Version.value = version
			},
			0x81: (bytes, index) => {
				guideAck.value = {
					step: bytes[index + 6] & 0xFF,
					result: bytes[index + 7] & 0xFF,
					receivedAt: Date.now()
				}
			},
			0x83: (bytes, index) => {
				const eqValue = bytes[index + 6]
				if (eqValue !== undefined) selectedEq.value = eqValue
			},
			// 识图速度设置
			0x85: (bytes, index) => {
				const statusValue = bytes[index + 6]
				if (statusValue !== undefined) wearingStatus.value = statusValue === 0x01
			},
			// 识图速度读取
			0x86: (bytes, index) => {
				const resolutionValue = bytes[index + 6]
				if (resolutionValue !== undefined && resolutionValue >= 0 && resolutionValue <= 3) {
					photoRecog2Resolution.value = resolutionValue
				}
			},
		}

		const processSppDataFrame = (bytes) => {
			receivedData.value += formatHexFrames(bytes) + '\n'
			for (let i = 0; i <= bytes.length - 4; i++) {
				if (bytes[i] === 0xAA && bytes[i + 1] === 0x03 && bytes[i + 2] === 0x02) {
					const handler = commandHandlers[bytes[i + 3]]
					if (handler) handler(bytes, i)
				}
			}
		}

		setOnSppReceive(processSppDataFrame)

		if (sppState.connected) {
			setTimeout(() => {
				try {
					sendSppHexCommand(buildCommand(COMMAND_CODES.QUERY_BATTERY)) // 查询电池电量
					sendSppHexCommand(buildCommand(COMMAND_CODES.GET_EQ)) // 查询当前eq设置
					sendSppHexCommand(buildCommand(COMMAND_CODES.GET_SWITCH_WEARING)) // 查询当前佩戴检测状态
					sendSppHexCommand(buildCommand(COMMAND_CODES.GET_PHOTO_RECOG2_RESOLUTION)) // 查询当前识图速度
				} catch (e) { /* ignore */ }
			}, 200)
		}
	})

	const sendCaptureCommand = (command) => {
		if (isSending.value) return
		sendSppHexCommand(command)
		uni.showToast({ title: '命令已发送', icon: 'success' })
	}

	const showGuide = () => {
		showGuidePanel.value = true
	}

	const handleSetEq = (mode) => {
		const payload = Number(mode)
		if (!Number.isInteger(payload) || payload < 0 || payload > 0xFF) {
			uni.showToast({ title: 'eq参数无效', icon: 'none' })
			return
		}
		selectedEq.value = payload
		const eqHex = payload.toString(16).toUpperCase().padStart(2, '0')
		sendCaptureCommand(buildCommand(COMMAND_CODES.SET_EQ, '01', eqHex))
	}

	const handleQueryFiles = () => {
		filesCnt.value = '查询中...'
		sendCaptureCommand(buildCommand(COMMAND_CODES.QUERY_FILES_CNT))
	}

	const handleFormatFiles = () => {
		sendCaptureCommand(buildCommand(COMMAND_CODES.APP_FORMAT))
	}

	const handleQueryBt = () => {
		btVersion.value = '查询中...'
		sendCaptureCommand(buildCommand(COMMAND_CODES.QUERY_BT_VERSION))
	}

	const handleQueryLinux = () => {
		linuxVersion.value = '查询中...'
		sendCaptureCommand(buildCommand(COMMAND_CODES.QUERY_LINUX_VERSION))
	}

	const handleQueryGx8002 = () => {
		gx8002Version.value = '查询中...'
		sendCaptureCommand(buildCommand(COMMAND_CODES.QUERY_GX8002_VERSION))
	}
	const handleSwitchWearing = (status) => {
		// status: true 开启佩戴检测, false 关闭佩戴检测
		const commandData = status ? '01' : '00'
		wearingStatus.value = status
		sendCaptureCommand(buildCommand(COMMAND_CODES.SET_SWITCH_WEARING, '01', commandData))
	}

	const handleSetPhotoRecog2Resolution = (speed) => {
		const payload = Number(speed)
		if (!Number.isInteger(payload) || payload < 0 || payload > 3) {
			uni.showToast({ title: '识图速度参数无效', icon: 'none' })
			return
		}
		photoRecog2Resolution.value = payload
		const speedHex = payload.toString(16).toUpperCase().padStart(2, '0')
		sendCaptureCommand(buildCommand(COMMAND_CODES.SET_PHOTO_RECOG2_RESOLUTION, '01', speedHex))
	}

	const handleSend = () => {
		const command = sendData.value.trim()
		if (!command) {
			uni.showToast({ title: '请输入命令', icon: 'none' })
			return
		}
		try {
			sendSppHexCommand(command)
			uni.showToast({ title: '命令已发送', icon: 'success' })
		} catch (error) {
			uni.showToast({ title: error?.message || '发送失败', icon: 'none' })
		}
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

	const handleSetDuration = (duration) => {
		const payload = Number(duration)
		if (payload === 0) return
		const actualValue = payload - 1
		if (!Number.isInteger(actualValue) || actualValue < 0 || actualValue > 0xFF) {
			uni.showToast({ title: '录制时长参数无效', icon: 'none' })
			return
		}
		const durationHex = actualValue.toString(16).toUpperCase().padStart(2, '0')
		sendCaptureCommand(buildCommand(COMMAND_CODES.SET_RECORDING_DURATION, '01', durationHex))
	}
	</script>

	<style lang="scss" scoped>
	.page {
		width: 100%;
		min-height: 100vh;
		background: linear-gradient(180deg, #eef1f9 0%, #f0f2f8 30%, #f5f6fa 100%);
		display: flex;
		flex-direction: column;
		overflow-x: hidden;
		box-sizing: border-box;
	}

	.page-body {
		flex: 1;
		width: 100%;
		padding: 24rpx;
		padding-bottom: 0;
		box-sizing: border-box;
	}

	.bottom-safe {
		height: 48rpx;
	}
	</style>