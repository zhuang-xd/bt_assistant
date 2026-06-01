<template>
	<view class="card device-card">
		<view class="card-header">
			<view class="card-title-row">
				<text class="card-icon">📟</text>
				<text class="title">设备信息</text>
			</view>
			<view class="status-badge" :class="{ connected: statusText === '已连接' }">
				<view class="badge-dot"></view>
				<text>{{ statusText }}</text>
			</view>
		</view>

		<view class="device-grid">
			<view class="device-item">
				<view class="item-icon">📛</view>
				<view class="item-content">
					<text class="label">蓝牙名称</text>
					<text class="value">{{ deviceName }}</text>
				</view>
			</view>
			<view class="device-item">
				<view class="item-icon">🪪</view>
				<view class="item-content">
					<text class="label">蓝牙地址</text>
					<text class="value mono">{{ deviceId || '未获取到deviceId' }}</text>
				</view>
			</view>
			<view class="device-item">
				<view class="item-icon">🔗</view>
				<view class="item-content">
					<text class="label">连接状态</text>
					<text class="value">{{ statusText }}</text>
				</view>
			</view>
			<view class="device-item">
				<view class="item-icon">🔋</view>
				<view class="item-content">
					<text class="label">电量</text>
					<text class="value battery">{{ batteryLevel }}</text>
				</view>
			</view>
		</view>

		<button class="guide-btn" :disabled="isSending" @click="$emit('openGuide')">
			<text class="btn-icon">📖</text>
			<text>新手引导</text>
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
	border-radius: 24rpx;
	padding: 28rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.04);
	margin-bottom: 20rpx;
}

.card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 20rpx;
}

.card-title-row {
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

.status-badge {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 8rpx 16rpx;
	border-radius: 20rpx;
	background: #f5f6fa;
	font-size: 22rpx;
	color: #8e8e9a;
	font-weight: 500;

	&.connected {
		background: #e8f5e9;
		color: #34c759;
	}
}

.badge-dot {
	width: 10rpx;
	height: 10rpx;
	border-radius: 50%;
	background: #d1d1d6;

	.connected & {
		background: #34c759;
	}
}

.device-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 14rpx;
	margin-bottom: 20rpx;
}

.device-item {
	display: flex;
	align-items: flex-start;
	gap: 12rpx;
	padding: 18rpx;
	border-radius: 14rpx;
	background: #f8f9fd;
	border: 1rpx solid #f0f1f5;
	min-height: 100rpx;
	box-sizing: border-box;
}

.item-icon {
	font-size: 28rpx;
	flex-shrink: 0;
	margin-top: 2rpx;
}

.item-content {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 6rpx;
}

.label {
	font-size: 22rpx;
	color: #8e8e9a;
}

.value {
	font-size: 26rpx;
	color: #1a1a2e;
	font-weight: 600;
	word-break: break-all;

	&.mono {
		font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
		font-size: 22rpx;
		font-weight: 500;
	}

	&.battery {
		color: #4f6ef6;
	}
}

.guide-btn {
	width: 100%;
	height: 76rpx;
	line-height: 76rpx;
	border-radius: 16rpx;
	font-size: 26rpx;
	font-weight: 600;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	background: linear-gradient(135deg, #4f6ef6 0%, #6b85ff 100%);
	color: #fff;
	border: none;
	box-shadow: 0 4rpx 14rpx rgba(79, 110, 246, 0.2);
	transition: all 0.2s ease;

	&::after {
		border: none;
	}

	&:active {
		transform: scale(0.97);
	}

	&[disabled] {
		background: #d5d9eb;
		color: #a0a4b8;
		box-shadow: none;
	}

	.btn-icon {
		font-size: 24rpx;
	}
}
</style>