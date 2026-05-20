<template>
	<view class="card">
		<view class="title">版本号</view>
		<view class="version-card">
			<view class="version-item">
				<view class="query-result">
					<view class="query-result-label">杰理版本</view>
					<view class="query-result-value version-text">{{ btVersion }}</view>
				</view>
				<button type="primary" :disabled="isSending" @click="$emit('queryBt')">
					查询
				</button>
			</view>
			<view class="version-item">
				<view class="query-result">
					<view class="query-result-label">富瀚版本</view>
					<view class="query-result-value version-text">{{ linuxVersion }}</view>
				</view>
				<button type="primary" :disabled="isSending" @click="$emit('queryLinux')">
					查询
				</button>
			</view>
			<view class="version-item">
				<view class="query-result">
					<view class="query-result-label">国新版本</view>
					<view class="query-result-value version-text">{{ gx8002Version }}</view>
				</view>
				<button type="primary" :disabled="isSending" @click="$emit('queryGx8002')">
					查询
				</button>
			</view>
		</view>
	</view>
</template>

<script setup>
defineProps({
	btVersion: {
		type: String,
		default: '未查询'
	},
	linuxVersion: {
		type: String,
		default: '未查询'
	},
	gx8002Version: {
		type: String,
		default: '未查询'
	},
	isSending: {
		type: Boolean,
		default: false
	}
})

defineEmits(['queryBt', 'queryLinux', 'queryGx8002'])
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

.version-text {
	font-size: 24rpx;
	line-height: 1.4;
	word-break: break-all;
	white-space: normal;
}

.version-card {
	display: flex;
	flex-direction: column;
	gap: 20rpx;

	.version-item {
		display: flex;
		flex-direction: row;

		.query-result {
			display: flex;
			width: 80%;
		}

		button {
			width: 20%;
			flex-shrink: 0;
		}
	}
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
