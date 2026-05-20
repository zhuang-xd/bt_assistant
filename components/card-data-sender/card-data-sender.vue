<template>
	<view class="card">
		<view class="title">发送数据</view>
		<view class="send-card">
			<input 
				class="send-input" 
				type="text" 
				:value="modelValue"
				@input="$emit('update:modelValue', $event.detail.value)"
				placeholder="例如 AA 02 03 07 00 00 D0 54" />
			<button type="primary" :disabled="isSending" @click="handleSend">
				发送
			</button>
		</view>
	</view>
</template>

<script setup>
defineProps({
	modelValue: {
		type: String,
		default: 'AA 02 03 07 00 00 D0 54'
	},
	isSending: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['send', 'update:modelValue'])

const handleSend = () => {
	emit('send')
}
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

.send-card {
	display: flex;
	gap: 20rpx;
	align-items: center;

	.send-input {
		flex: 1;
		height: 88rpx;
		padding: 0 24rpx;
		border: 1rpx solid #dbe5fb;
		border-radius: 16rpx;
		background: #f8fbff;
		font-size: 28rpx;
		color: #1f2f4d;
	}

	button {
		width: 20%;
		flex-shrink: 0;
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
