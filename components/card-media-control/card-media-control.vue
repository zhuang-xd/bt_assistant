<template>
	<view class="card">
		<view class="card-header">
			<text class="card-icon">📷</text>
			<text class="title">媒体控制</text>
		</view>

		<!-- 拍照 - 独立一行，横向布局 -->
		<view
			class="media-btn photo-btn"
			:class="{ disabled: isSending }"
			@click="!isSending && $emit('takePhoto')"
		>
			<view class="photo-inner">
				<text class="media-icon">📸</text>
				<text class="media-label">拍照</text>
				<text class="media-desc">远程拍摄</text>
			</view>
		</view>

		<!-- 录像 + 停止 - 并排一行 -->
		<view class="media-row">
			<view
				class="media-btn"
				:class="{ disabled: isSending }"
				@click="!isSending && $emit('startRecording')"
			>
				<view class="media-btn-inner">
					<text class="media-icon">🎬</text>
					<text class="media-label">录像</text>
					<text class="media-desc">开始录制</text>
				</view>
			</view>
			<view
				class="media-btn"
				:class="{ disabled: isSending }"
				@click="!isSending && $emit('stopRecording')"
			>
				<view class="media-btn-inner">
					<text class="media-icon">⏹</text>
					<text class="media-label">停止</text>
					<text class="media-desc">结束录制</text>
				</view>
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
	border-radius: 24rpx;
	padding: 28rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
	margin-bottom: 20rpx;
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

.media-row {
	display: flex;
	gap: 14rpx;
}

.photo-btn {
	margin-bottom: 14rpx;
	padding: 16rpx 20rpx;

	.photo-inner {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12rpx;
	}
}

.media-btn {
	flex: 1;
	position: relative;
	padding: 24rpx 16rpx;
	border-radius: 18rpx;
	background: #f8f9fd;
	border: 2rpx solid transparent;
	transition: all 0.25s ease;
	overflow: hidden;

	&:active:not(.disabled) {
		transform: scale(0.96);
		background: linear-gradient(135deg, #eef3ff 0%, #e8edff 100%);
		border-color: #4f6ef6;
		box-shadow: 0 4rpx 16rpx rgba(79, 110, 246, 0.12);
	}

	&.disabled {
		opacity: 0.5;
	}
}

.media-btn-inner {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
}

.media-icon {
	font-size: 40rpx;
	margin-bottom: 4rpx;
}

.media-label {
	font-size: 28rpx;
	font-weight: 700;
	color: #3a3a4e;
}

.media-desc {
	font-size: 20rpx;
	color: #b0b0bc;
}
</style>
