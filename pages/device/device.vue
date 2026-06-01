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
			<tutorial v-model="showGuidePanel" />
		</view>
	</template>

	<script setup>
	import { ref } from 'vue'
	import { onLoad } from '@dcloudio/uni-app'
	import CardDeviceInfo from '../../components/card-device-info/card-device-info.vue'
	import CardEqSettings from '../../components/card-eq-settings/card-eq-settings.vue'
	import CardFileQuery from '../../components/card-file-query/card-file-query.vue'
	import CardVersionInfo from '../../components/card-version-info/card-version-info.vue'
	import CardDataReceiver from '../../components/card-data-receiver/card-data-receiver.vue'
	import CardDataSender from '../../components/card-data-sender/card-data-sender.vue'
	import CardMediaControl from '../../components/card-media-control/card-media-control.vue'
	import Tutorial from '../../components/tutorial/tutorial.vue'

	const deviceName = ref('未获取到设备名称')
	const deviceId = ref('')
	const statusText = ref('未连接')
	const batteryLevel = ref('--')
	const isSending = ref(false)

	const selectedEq = ref(null)
	const filesCnt = ref(0)
	const btVersion = ref('未查询')
	const linuxVersion = ref('未查询')
	const gx8002Version = ref('未查询')
	const receivedData = ref('')
	const sendData = ref('AA 02 03 07 00 00 D0 54')
	const showGuidePanel = ref(false)

	onLoad((options) => {
		if (options?.deviceName) {
			deviceName.value = decodeURIComponent(options.deviceName)
		}
		if (options?.deviceId) {
			deviceId.value = decodeURIComponent(options.deviceId)
			statusText.value = '已连接'
		}
	})

	const showGuide = () => {
		showGuidePanel.value = true
	}

	const handleSetEq = (mode) => {
		selectedEq.value = mode
		uni.showToast({ duration: 1500, title: `已切换音效: ${['标准', '澎湃', '静谧'][mode]}`, icon: 'none' })
	}

	const handleQueryFiles = () => {
		uni.showToast({ duration: 1500, title: '查询文件列表', icon: 'none' })
	}

	const handleFormatFiles = () => {
		filesCnt.value = 0
		uni.showToast({ duration: 1500, title: '已清空', icon: 'none' })
	}

	const handleQueryBt = () => {
		uni.showToast({ duration: 1500, title: '查询杰理版本', icon: 'none' })
	}

	const handleQueryLinux = () => {
		uni.showToast({ duration: 1500, title: '查询富瀚版本', icon: 'none' })
	}

	const handleQueryGx8002 = () => {
		uni.showToast({ duration: 1500, title: '查询国新版本', icon: 'none' })
	}

	const handleSend = () => {
		if (!sendData.value.trim()) {
			uni.showToast({ duration: 1500, title: '请输入发送数据', icon: 'none' })
			return
		}
		uni.showToast({ duration: 1500, title: '数据已发送', icon: 'success' })
	}

	const handleTakePhoto = () => {
		uni.showToast({ duration: 1500, title: '拍照', icon: 'none' })
	}

	const handleStartRecording = () => {
		uni.showToast({ duration: 1500, title: '开始录像', icon: 'none' })
	}

	const handleStopRecording = () => {
		uni.showToast({ duration: 1500, title: '停止录像', icon: 'none' })
	}

	const handleSetDuration = (duration) => {
		uni.showToast({ duration: 1500, title: `录制时长: ${['未设置', '15秒', '1分钟', '3分钟', '5分钟', '10分钟'][duration]}`, icon: 'none' })
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