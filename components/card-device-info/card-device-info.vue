<template>
	<view class="card device-card">
		<view class="title">设备</view>
		<view class="device-grid">
			<view class="device-item">
				<view class="label">蓝牙名称</view>
				<view class="value">{{ deviceName }}</view>
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
		<button class="guide-btn" type="primary" :disabled="isSending" @click="$emit('openGuide')">
			新手引导
		</button>
	</view>
</template>

<script setup>
defineProps({
	deviceName: {
		type: String,
		default: '未获取到设备名称'
	},
	deviceId: {
		type: String,
		default: ''
	},
	statusText: {
		type: String,
		default: '未连接'
	},
	batteryLevel: {
		type: String,
		default: '--'
	},
	isSending: {
		type: Boolean,
		default: false
	}
})

defineEmits(['openGuide'])
</script>

<style lang="scss" scoped>
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
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}
</style>
