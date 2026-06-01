<template>
	<view class="card">
		<view class="card-header">
			<text class="card-icon">🎵</text>
			<text class="title">音效设置</text>
		</view>

		<view class="eq-grid">
			<view
				class="eq-btn"
				:class="{ active: selectedEq === 0 }"
				@click="$emit('setEq', 0)"
			>
				<view class="eq-btn-inner">
					<text class="eq-icon">🎹</text>
					<text class="eq-label">标准</text>
					<text class="eq-desc">均衡音效</text>
				</view>
				<view class="eq-check" v-if="selectedEq === 0">✓</view>
			</view>
			<view
				class="eq-btn"
				:class="{ active: selectedEq === 1 }"
				@click="$emit('setEq', 1)"
			>
				<view class="eq-btn-inner">
					<text class="eq-icon">🔊</text>
					<text class="eq-label">澎湃</text>
					<text class="eq-desc">强劲低音</text>
				</view>
				<view class="eq-check" v-if="selectedEq === 1">✓</view>
			</view>
			<view
				class="eq-btn"
				:class="{ active: selectedEq === 2 }"
				@click="$emit('setEq', 2)"
			>
				<view class="eq-btn-inner">
					<text class="eq-icon">🌙</text>
					<text class="eq-label">静谧</text>
					<text class="eq-desc">柔和入眠</text>
				</view>
				<view class="eq-check" v-if="selectedEq === 2">✓</view>
			</view>
		</view>
	</view>
</template>

<script setup>
defineProps({
	selectedEq: {
		type: Number,
		default: null
	},
	isSending: {
		type: Boolean,
		default: false
	}
})

defineEmits(['setEq'])
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

.eq-grid {
	display: flex;
	gap: 14rpx;
}

.eq-btn {
	flex: 1;
	position: relative;
	padding: 24rpx 16rpx;
	border-radius: 18rpx;
	background: #f8f9fd;
	border: 2rpx solid transparent;
	transition: all 0.25s ease;
	overflow: hidden;

	&.active {
		background: linear-gradient(135deg, #eef3ff 0%, #e8edff 100%);
		border-color: #4f6ef6;
		box-shadow: 0 4rpx 16rpx rgba(79, 110, 246, 0.12);
		transform: translateY(-2rpx);
	}

	&:active {
		transform: scale(0.96);
	}
}

.eq-btn-inner {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
}

.eq-icon {
	font-size: 40rpx;
	margin-bottom: 4rpx;
}

.eq-label {
	font-size: 28rpx;
	font-weight: 700;
	color: #3a3a4e;

	.active & {
		color: #4f6ef6;
	}
}

.eq-desc {
	font-size: 20rpx;
	color: #b0b0bc;
}

.eq-check {
	position: absolute;
	top: 10rpx;
	right: 14rpx;
	width: 36rpx;
	height: 36rpx;
	border-radius: 50%;
	background: #4f6ef6;
	color: #fff;
	font-size: 20rpx;
	font-weight: 700;
	display: flex;
	align-items: center;
	justify-content: center;
}
</style>