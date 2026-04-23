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
			</view>
		</view>
		<view class="card ">
			<view class="title">查询文件</view>
			<view class="query-card">
				<view class="query-result">
					<view class="query-result-label">文件数量</view>
					<view class="query-result-value">{{ filesCnt }}</view>
				</view>
				<button type="primary" :disabled="isSending" @click="handleQueryFilesCnt">
					查询
				</button>
			</view>
		</view>
		<view class="card ">
			<view class="title">P2P导图</view>
			<view class="query-card">
				<view class="query-result">
					<view class="query-result-label">已导入文件数量</view>
					<view class="query-result-value">{{ filesCnt }}</view>
				</view>
				<button type="primary" :disabled="isSending" @click="handleP2PFileTransfer">
					导入
				</button>
			</view>
		</view>
		<view class="card">
			<view class="title">发送数据</view>
			<view class="send-card">
				<input
					class="send-input"
					type="text"
					v-model="customCommand"
					placeholder="例如 AA 02 03 07 00 00 D0 54"
				/>
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
	const receivedData = ref('')
	const filesCnt = ref(0)
	const isSending = ref(false)
	const customCommand = ref('AA 02 03 07 00 00 D0 54')
	const FILE_IMPORT_COMMAND = buildSppHexCommandWithCrc('AA 02 03 29 00 00')
	const P2P_SERVER_IP = '192.168.49.1'
	const P2P_SERVER_PORT = 8556
	const P2P_CONNECT_TIMEOUT_MS = 6000
	const P2P_SEND_CHUNK_SIZE = 4096
	const PHOTO_COMMAND = buildSppHexCommandWithCrc('AA 02 03 60 00 00')
	const START_RECORDING_COMMAND = buildSppHexCommandWithCrc('AA 02 03 61 00 00')
	const STOP_RECORDING_COMMAND = buildSppHexCommandWithCrc('AA 02 03 62 00 00')
	const QUERY_FILES_CNT_COMMAND = buildSppHexCommandWithCrc('AA 02 03 07 00 00')

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
			return (high << 8) | low
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

			const parsedFilesCount = parseFilesCountFromPacket(bytes)
			if (parsedFilesCount !== null) {
				filesCnt.value = parsedFilesCount
			}
		})
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

	const handleQueryFilesCnt = () => {
		sendCaptureCommand(QUERY_FILES_CNT_COMMAND)
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