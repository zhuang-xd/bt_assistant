<template>
	<view class="card">
		<view class="title">查询文件</view>
		<view class="query-card">
			<view class="query-result">
				<view class="query-result-label">文件数量</view>
				<view class="query-result-value">{{ filesCnt }}</view>
			</view>
			<button type="primary" :disabled="isSending" @click="$emit('format')">
				清空
			</button>
			<button type="primary" :disabled="isSending" @click="$emit('query')">
				查询
			</button>
		</view>
	</view>
</template>

<script setup>
defineProps({
	filesCnt: {
		type: [String, Number],
		default: 0
	},
	isSending: {
		type: Boolean,
		default: false
	}
})

defineEmits(['query', 'format'])
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

.query-card {
	display: flex;
	gap: 20rpx;
	margin-bottom: 5px;

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

.query-result-label {
	font-size: 26rpx;
	color: #6b7b9b;
	white-space: nowrap;
}

.query-result-value {
	font-size: 28rpx;
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
