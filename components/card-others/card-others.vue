<template>
	<view class="card">
		<view class="card-header">
			<text class="card-icon">⚙️</text>
			<text class="title">其他配置</text>
		</view>

		<view class="item-list">
			<!-- 佩戴检测 -->
			<view class="item-row">
				<view class="item-info">
					<view class="item-left">
						<text class="item-icon">🎧</text>
						<text class="item-label">佩戴检测</text>
					</view>
					<view class="item-right">
						<text class="item-status" :class="{ on: wearingStatus, off: !wearingStatus }">
							{{ wearingStatus ? '已开启' : '已关闭' }}
						</text>
						<view class="switch-track" :class="{ active: wearingStatus }" @click="toggleWearing">
							<view class="switch-thumb" :class="{ active: wearingStatus }"></view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
	isSending: {
		type: Boolean,
		default: false
	},
	wearingStatus: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['handleWearingStatus'])

const toggleWearing = () => {
	if (props.isSending) return
	emit('handleWearingStatus', !props.wearingStatus)
}
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

.item-list {
	display: flex;
	flex-direction: column;
	gap: 14rpx;
}

.item-row {
	display: flex;
	align-items: center;
}

.item-info {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 24rpx;
	border-radius: 14rpx;
	background: #f8f9fd;
	border: 1rpx solid #f0f1f5;
}

.item-left {
	display: flex;
	align-items: center;
	gap: 10rpx;
}

.item-icon {
	font-size: 28rpx;
}

.item-label {
	font-size: 26rpx;
	color: #6b6b7e;
	white-space: nowrap;
}

.item-right {
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.item-status {
	font-size: 24rpx;
	font-weight: 600;
	white-space: nowrap;

	&.on {
		color: #4f6ef6;
	}

	&.off {
		color: #a0a4b8;
	}
}

.switch-track {
	width: 80rpx;
	height: 44rpx;
	border-radius: 22rpx;
	background: #d5d9eb;
	position: relative;
	transition: background 0.3s ease;

	&.active {
		background: linear-gradient(135deg, #4f6ef6 0%, #6b85ff 100%);
	}
}

.switch-thumb {
	width: 36rpx;
	height: 36rpx;
	border-radius: 18rpx;
	background: #ffffff;
	position: absolute;
	top: 4rpx;
	left: 4rpx;
	transition: left 0.3s ease;
	box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.15);

	&.active {
		left: 40rpx;
	}
}
</style>