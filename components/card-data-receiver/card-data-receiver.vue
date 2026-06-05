<template>
	<view class="card">
		<view class="card-header">
			<view class="header-left">
				<text class="card-icon">📥</text>
				<text class="title">接收数据</text>
			</view>
			<view class="data-count" v-if="receivedData">
				<text>{{ receivedData.length }} 字符</text>
			</view>
		</view>

		<scroll-view scroll-y class="receive-box">
			<text class="receive-text" v-if="receivedData">{{ receivedData }}</text>
			<view class="receive-placeholder" v-else>
				<text class="placeholder-icon">📡</text>
				<text class="placeholder-text">等待接收数据...</text>
			</view>
		</scroll-view>

		<button class="clear-btn" :disabled="!receivedData" @click="$emit('clear')">
			<text class="btn-icon">🗑️</text>
			<text>清空数据</text>
		</button>
	</view>
</template>

<script setup>
defineProps({
	receivedData: {
		type: String,
		default: ''
	}
})

defineEmits(['clear'])
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
	justify-content: space-between;
	margin-bottom: 18rpx;
}

.header-left {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.card-icon {
	font-size: 32rpx;
}

.title {
	font-size: 32rpx;
	font-weight: 700;
	color: #1a1a2e;
}

.data-count {
	font-size: 22rpx;
	color: #8e8e9a;
	background: #f5f6fa;
	padding: 6rpx 14rpx;
	border-radius: 12rpx;
}

.receive-box {
	height: 300rpx;
	// background: #1a1a2e;
	background: #f8f9fd;
	border-radius: 16rpx;
	padding: 20rpx;
	box-sizing: border-box;
	margin-bottom: 18rpx;
	border: 1rpx solid #2a2a3e;
}

.receive-text {
	font-size: 24rpx;
	// color: #34c759;
	word-wrap: break-word;
	white-space: pre-wrap;
	line-height: 1.7;
}

.receive-placeholder {
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
}

.placeholder-icon {
	font-size: 48rpx;
}

.placeholder-text {
	font-size: 24rpx;
	color: #5a5a6e;
}

.clear-btn {
	width: 100%;
	height: 72rpx;
	line-height: 72rpx;
	border-radius: 16rpx;
	font-size: 26rpx;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	background: #fff0f0;
	color: #ff5252;
	border: 1rpx solid #ffe0e0;
	transition: all 0.2s ease;

	&::after {
		border: none;
	}

	&:active {
		background: #ffe0e0;
		transform: scale(0.98);
	}

	&[disabled] {
		background: #f5f6fa;
		color: #c8cce0;
		border-color: transparent;
	}

	.btn-icon {
		font-size: 24rpx;
	}
}
</style>