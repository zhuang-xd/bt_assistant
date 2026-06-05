<template>
		<view class="card">
			<view class="card-header">
				<text class="card-icon">📦</text>
				<text class="title">版本信息</text>
			</view>

			<view class="version-list">
				<view class="version-item">
					<view class="version-info">
						<text class="version-label">杰理版本</text>
						<text class="version-value">{{ btVersion }}</text>
					</view>
					<button class="query-btn" :disabled="isSending" @click="$emit('queryBt')">
						查询
					</button>
				</view>
				<view class="version-item">
					<view class="version-info">
						<text class="version-label">富瀚版本</text>
						<text class="version-value">{{ linuxVersion }}</text>
					</view>
					<button class="query-btn" :disabled="isSending" @click="$emit('queryLinux')">
						查询
					</button>
				</view>
				<view class="version-item">
					<view class="version-info">
						<text class="version-label">国新版本</text>
						<text class="version-value">{{ gx8002Version }}</text>
					</view>
					<button class="query-btn" :disabled="isSending" @click="$emit('queryGx8002')">
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

	.version-list {
		display: flex;
		flex-direction: column;
		gap: 14rpx;
	}

	.version-item {
		display: flex;
		align-items: center;
		gap: 14rpx;
	}

	.version-info {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 24rpx;
		border-radius: 14rpx;
		background: #f8f9fd;
		border: 1rpx solid #f0f1f5;
		min-width: 0;
	}

	.version-label {
		font-size: 26rpx;
		color: #6b6b7e;
		white-space: nowrap;
	}

	.version-value {
		font-size: 24rpx;
		font-weight: 600;
		color: #4f6ef6;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 280rpx;
		text-align: right;
	}

	.query-btn {
		width: 100rpx;
		height: 76rpx;
		border-radius: 14rpx;
		font-size: 26rpx;
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #4f6ef6 0%, #6b85ff 100%);
		color: #fff;
		border: none;
		flex-shrink: 0;
		white-space: nowrap;
		box-shadow: 0 4rpx 14rpx rgba(79, 110, 246, 0.2);
		transition: all 0.2s ease;

		&::after {
			border: none;
		}

		&:active {
			transform: scale(0.95);
		}

		&[disabled] {
			background: #d5d9eb;
			color: #a0a4b8;
			box-shadow: none;
		}
	}
	</style>