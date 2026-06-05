<template>
	<view class="card">
		<view class="card-header">
			<text class="card-icon">📷</text>
			<view class="title">媒体</view>
		</view>

		<view class="media-card">
			<button type="primary" :disabled="isSending" @click="$emit('takePhoto')">
				拍照
			</button>
			<view class="general-card">
				<button type="primary" :disabled="isSending" @click="$emit('startRecording')">
					开始录像
				</button>
				<button class="media-btn btn" type="primary" :disabled="isSending" @click="$emit('stopRecording')">
					停止录像
				</button>
			</view>
		</view>
	</view>
</template>

<script setup>
defineProps({
	isSending: {
		type: Boolean,
		default: false
	}
})

defineEmits(['takePhoto', 'startRecording', 'stopRecording'])
</script>

<style lang="scss" scoped>
.card {
	background: #ffffff;
	border-radius: 20rpx;
	padding: 28rpx;
	box-shadow: 0 8rpx 30rpx rgba(26, 44, 80, 0.08);
	margin-bottom: 10px;
}

.card-header {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 20rpx;
}

.card-icon {
	font-size: 32rpx;
}

.title {
	font-size: 32rpx;
	font-weight: 700;
	color: #1a1a2e;
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

.media-btn {
	width: 100%;
}

.btn {
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
