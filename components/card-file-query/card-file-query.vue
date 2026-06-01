<template>
		<view class="card">
			<view class="card-header">
				<text class="card-icon">📁</text>
				<text class="title">查询文件</text>
			</view>

			<view class="query-card">
				<view class="query-result">
					<text class="query-result-label">文件数量</text>
					<text class="query-result-value">{{ filesCnt }}</text>
				</view>
				<view class="query-actions">
					<button class="action-btn danger" :disabled="isSending" @click="$emit('format')">
						清空
					</button>
					<button class="action-btn primary" :disabled="isSending" @click="$emit('query')">
						查询
					</button>
				</view>
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

	.query-card {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.query-result {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 24rpx;
		border-radius: 16rpx;
		background: linear-gradient(135deg, #f0f3ff 0%, #eef1fb 100%);
		border: 1rpx solid #e0e6fa;
	}

	.query-result-label {
		font-size: 26rpx;
		color: #6b6b7e;
	}

	.query-result-value {
		font-size: 34rpx;
		font-weight: 800;
		color: #4f6ef6;
	}

	.query-actions {
		display: flex;
		gap: 12rpx;
		flex-shrink: 0;
	}

	.action-btn {
		width: 100rpx;
		height: 76rpx;
		border-radius: 16rpx;
		font-size: 26rpx;
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		white-space: nowrap;
		transition: all 0.2s ease;

		&::after {
			border: none;
		}

		&:active {
			transform: scale(0.95);
		}

		&.primary {
			background: linear-gradient(135deg, #4f6ef6 0%, #6b85ff 100%);
			color: #fff;
			box-shadow: 0 4rpx 14rpx rgba(79, 110, 246, 0.2);
		}

		&.danger {
			background: #fff0f0;
			color: #ff5252;
			border: 1rpx solid #ffe0e0;

			&:active {
				background: #ffe0e0;
			}
		}

		&[disabled] {
			background: #d5d9eb !important;
			color: #a0a4b8 !important;
			box-shadow: none !important;
			border-color: transparent !important;
		}
	}
	</style>