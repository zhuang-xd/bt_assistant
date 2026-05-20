<template>
	<view class="card">
		<view class="media-card">
			<view class="title">媒体</view>
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
			<view class="general-card">
				<button class="media-btn btn" type="primary" :disabled="isSending" @click="$emit('setDuration', 0)">
					15s
				</button>
				<button class="media-btn btn" type="primary" :disabled="isSending" @click="$emit('setDuration', 1)">
					1min
				</button>
				<button class="media-btn btn" type="primary" :disabled="isSending" @click="$emit('setDuration', 2)">
					3min
				</button>
				<button class="media-btn btn" type="primary" :disabled="isSending" @click="$emit('setDuration', 3)">
					5min
				</button>
				<button class="media-btn btn" type="primary" :disabled="isSending" @click="$emit('setDuration', 4)">
					10min
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

defineEmits(['takePhoto', 'startRecording', 'stopRecording', 'setDuration'])
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
