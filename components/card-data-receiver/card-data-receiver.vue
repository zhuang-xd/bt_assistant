<template>
	<view class="card">
		<view class="receive-header">
			<view class="title">接收数据</view>
		</view>
		<scroll-view scroll-y class="receive-box">
			<text class="receive-text">{{ receivedData }}</text>
		</scroll-view>
		<button class="clear-btn" size="mini" :disabled="!receivedData" @click="$emit('clear')">
			清空
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
	border-radius: 20rpx;
	padding: 28rpx;
	box-shadow: 0 8rpx 30rpx rgba(26, 44, 80, 0.08);
	margin-bottom: 10px;
}

.title {
	font-size: 34rpx;
	font-weight: 600;
	color: #1f2f4d;
	margin-bottom: 0;
}

.receive-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16rpx;
	margin-bottom: 18rpx;

	.title {
		margin-bottom: 0;
	}
}

.receive-box {
	height: 300rpx;
	background: #f8f9fa;
	border-radius: 12rpx;
	padding: 16rpx;
	box-sizing: border-box;
	margin-bottom: 16rpx;
}

.receive-text {
	font-size: 26rpx;
	color: #333;
	word-wrap: break-word;
	white-space: pre-wrap;
}

.clear-btn {
	width: 100%;
	height: 56rpx;
	line-height: 56rpx;
	padding: 0 20rpx;
	font-size: 24rpx;
	letter-spacing: 0;
	border-radius: 12rpx;
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
