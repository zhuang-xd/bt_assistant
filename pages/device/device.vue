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

			<button class="photo-btn" type="primary">拍照</button>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getSppState } from '../../utils/spp'

const matchedDeviceName = ref('未获取到设备名称')
const deviceId = ref('')
const statusText = ref('未连接')

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
	padding: 28rpx;
	box-shadow: 0 8rpx 30rpx rgba(26, 44, 80, 0.08);
}

.title {
	font-size: 34rpx;
	font-weight: 600;
	color: #1f2f4d;
	margin-bottom: 24rpx;
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

.photo-btn {
	margin-top: 12rpx;
}
</style>