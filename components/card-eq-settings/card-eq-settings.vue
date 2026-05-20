<template>
	<view class="card">
		<view class="title">音效设置</view>
		<view class="general-card">
			<button 
				class="media-btn btn eq-btn" 
				:class="{ active: selectedEq === 0 }" 
				type="primary"
				:disabled="isSending" 
				@click="$emit('setEq', 0)">
				标准
			</button>
			<button 
				class="media-btn btn eq-btn" 
				:class="{ active: selectedEq === 1 }" 
				type="primary"
				:disabled="isSending" 
				@click="$emit('setEq', 1)">
				澎湃
			</button>
			<button 
				class="media-btn btn eq-btn" 
				:class="{ active: selectedEq === 2 }" 
				type="primary"
				:disabled="isSending" 
				@click="$emit('setEq', 2)">
				静谧
			</button>
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

.general-card {
	display: flex;
	gap: 16rpx;
}

.media-btn {
	width: 100%;
	flex: 1;
}

.eq-btn {
	opacity: 0.3;
	transition: all 0.18s ease;

	&.active {
		opacity: 1;
		transform: translateY(-1rpx);
		box-shadow: 0 8rpx 18rpx rgba(31, 78, 216, 0.18);
	}
}

.btn {
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
