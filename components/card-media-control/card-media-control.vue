<template>
	<view class="card">
		<view class="media-card">
			<view class="title">媒体</view>
			<button type="primary" :disabled="isSending" @click="$emit('takePhoto')">
				拍照
			</button>
			<view class="general-card">
				<button type="primary" :disabled="isSending" @click="$emit('startRecording')">
					开始录像
				</button>
				<button class="media-btn btn" type="primary" :disabled="isSending" @click="$emit('stopRecording')">
					停止录像
				</button>
			</view>
			<view class="duration-control">
				<view class="duration-label">
					<text>录制时长</text>
					<text class="duration-value">{{ durationOptions[currentDuration] }}</text>
				</view>
				<slider 
					class="duration-slider"
					:value="currentDuration"
					:min="0"
					:max="4"
					:step="1"
					:disabled="isSending"
					@change="handleDurationChange"
				/>
				<view class="duration-marks">
					<view v-for="(label, index) in durationOptions" :key="index" class="mark">
						{{ label }}
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
	isSending: {
		type: Boolean,
		default: false
	}
})

const emit = defineEmits(['takePhoto', 'startRecording', 'stopRecording', 'setDuration'])

const durationOptions = ['15秒', '1分钟', '3分钟', '5分钟', '10分钟']
const currentDuration = ref(0)

const handleDurationChange = (event) => {
	currentDuration.value = event.detail.value
	emit('setDuration', currentDuration.value)
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

.media-card {
	display: flex;
	margin: 12rpx;
	flex-direction: column;
	gap: 16rpx;
}

.general-card {
	display: flex;
	gap: 16rpx;
}

.media-btn {
	width: 100%;
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

.duration-control {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
	margin-top: 20rpx;
	padding: 20rpx;
	background: #f5f7fb;
	border-radius: 16rpx;
}

.duration-label {
	display: flex;
	justify-content: space-between;
	align-items: center;
	font-size: 28rpx;
	color: #1f2f4d;
	font-weight: 500;
}

.duration-value {
	font-size: 32rpx;
	font-weight: 600;
	color: #5a7cfa;
}

.duration-slider {
	width: 80%;
	margin: 20rpx auto 0 auto;
}

.duration-marks {
	display: grid;
	grid-template-columns: repeat(5, 1fr);
	margin-top: 12rpx;
	width: 100%;
	margin-left: auto;
	margin-right: auto;
	gap: 0;
	padding: 0;
}

.mark {
	font-size: 22rpx;
	color: #999;
	text-align: center;
	flex: none;
}
</style>
