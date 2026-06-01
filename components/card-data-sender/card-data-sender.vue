<template>
		<view class="card">
			<view class="card-header">
				<text class="card-icon">📤</text>
				<text class="title">发送数据</text>
			</view>

			<view class="send-card">
				<view class="input-wrapper">
					<input
						class="send-input"
						type="text"
						:value="modelValue"
						@input="$emit('update:modelValue', $event.detail.value)"
						placeholder="例如 AA 02 03 07 00 00 D0 54"
					/>
				</view>
				<button class="send-btn" :disabled="isSending" @click="handleSend">
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

	.send-card {
		display: flex;
		gap: 14rpx;
		align-items: center;
	}

	.input-wrapper {
		flex: 1;
	}

	.send-input {
		width: 100%;
		height: 76rpx;
		padding: 0 24rpx;
		border: 2rpx solid #e5e7ef;
		border-radius: 18rpx;
		background: #f8f9fd;
		font-size: 26rpx;
		color: #1a1a2e;
		font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
		box-sizing: border-box;
		transition: all 0.2s ease;

		&:focus {
			border-color: #4f6ef6;
			background: #fff;
			box-shadow: 0 0 0 6rpx rgba(79, 110, 246, 0.06);
		}
	}

	.send-btn {
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