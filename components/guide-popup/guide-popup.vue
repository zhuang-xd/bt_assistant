<template>
	<view v-if="modelValue" class="guide-mask" @click="handleClose">
		<view class="guide-panel" @click.stop>
			<view class="guide-header">
				<view>
					<view class="guide-title">新手引导</view>
					<view class="guide-subtitle">左右滑动查看每个操作说明</view>
				</view>
				<view class="guide-close" @click="handleClose">关闭</view>
			</view>
			<swiper class="guide-swiper" :current="currentStep - 1" indicator-dots indicator-color="rgba(31, 78, 216, 0.18)" indicator-active-color="#1f4ed8" @change="handleSwiperChange">
				<swiper-item v-for="(item, index) in guideItems" :key="index">
					<view class="guide-item">
						<view class="guide-step">{{ index + 1 }} / {{ guideItems.length }}</view>
						<view class="guide-text">{{ item }}</view>
					</view>
				</swiper-item>
			</swiper>
		</view>
	</view>
</template>

<script setup>
import {
	ref,
	watch
} from 'vue'
import {
	buildSppHexCommandWithCrc,
	sendSppHexCommand
} from '../../utils/spp'

const props = defineProps({
	modelValue: {
		type: Boolean,
		default: false
	},
	guideAck: {
		type: Object,
		default: null
	}
})

const emit = defineEmits(['update:modelValue'])

const guideItems = [
	'单击功能按键-拍照',
	'长按功能按键-录像',
	'单击功能按键-停止录像',
	'单击触控板-播放音乐',
	'前后滑动触控板-调节音量',
	'双击触控板-播放下一首',
	'三击触控板-播放上一首',
	'单击触控板-停止音乐',
	'长按触控板-唤起ai语音助手',
]

const currentStep = ref(1)

const buildGuideCommand = (step, result) => buildSppHexCommandWithCrc(`AA 02 03 81 00 02 ${step.toString(16).toUpperCase().padStart(2, '0')} ${result.toString(16).toUpperCase().padStart(2, '0')}`)

const sendGuideStep = (step, result = 0) => {
	const payloadStep = Number(step)
	const payloadResult = Number(result)
	if (!Number.isInteger(payloadStep) || payloadStep < 0 || payloadStep > guideItems.length) {
		return
	}
	if (!Number.isInteger(payloadResult) || payloadResult < 0 || payloadResult > 0xFF) {
		return
	}
	try {
		sendSppHexCommand(buildGuideCommand(payloadStep, payloadResult))
	} catch (error) {
		// ignore send errors when SPP is unavailable
	}
}

watch(
	() => props.modelValue,
	(isVisible) => {
		if (!isVisible) {
			return
		}
		currentStep.value = 1
		sendGuideStep(1, 0)
	},
	{
		immediate: true
	}
)

watch(
	() => props.guideAck,
	(ack) => {
		if (!props.modelValue || !ack) {
			return
		}

		const ackStep = Number(ack.step)
		const ackResult = Number(ack.result)
		if (ackStep !== currentStep.value || ackResult !== 1) {
			return
		}

		if (currentStep.value >= guideItems.length) {
			sendGuideStep(0, 0)
			emit('update:modelValue', false)
			return
		}

		currentStep.value += 1
		sendGuideStep(currentStep.value, 0)
	},
	{
		deep: false
	}
)

const handleSwiperChange = (event) => {
	const nextStep = (event?.detail?.current ?? 0) + 1
	currentStep.value = nextStep
	sendGuideStep(nextStep, 0)
}

const handleClose = () => {
	emit('update:modelValue', false)
}
</script>

<style lang="scss" scoped>
.guide-mask {
	position: fixed;
	inset: 0;
	z-index: 999;
	background: rgba(15, 23, 42, 0.55);
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 32rpx;
	box-sizing: border-box;
}

.guide-panel {
	width: 100%;
	max-width: 660rpx;
	background: linear-gradient(180deg, #ffffff 0%, #f6f9ff 100%);
	border-radius: 28rpx;
	padding: 28rpx;
	box-shadow: 0 24rpx 80rpx rgba(12, 20, 40, 0.28);
	box-sizing: border-box;
}

.guide-header {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 20rpx;
	margin-bottom: 22rpx;
}

.guide-title {
	font-size: 36rpx;
	font-weight: 700;
	color: #17315f;
	line-height: 1.2;
}

.guide-subtitle {
	margin-top: 8rpx;
	font-size: 24rpx;
	color: #6b7b9b;
}

.guide-close {
	flex-shrink: 0;
	padding: 12rpx 22rpx;
	border-radius: 999rpx;
	background: #e9f0ff;
	color: #1f4ed8;
	font-size: 24rpx;
	font-weight: 600;
}

.guide-swiper {
	height: 320rpx;
}

.guide-item {
	height: 100%;
	border-radius: 22rpx;
	background: linear-gradient(135deg, #1f4ed8 0%, #0f9cf3 100%);
	padding: 28rpx;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	color: #ffffff;
}

.guide-step {
	align-self: flex-start;
	padding: 8rpx 16rpx;
	border-radius: 999rpx;
	background: rgba(255, 255, 255, 0.18);
	font-size: 22rpx;
	letter-spacing: 1rpx;
}

.guide-text {
	font-size: 40rpx;
	font-weight: 700;
	line-height: 1.45;
	word-break: break-all;
	padding-top: 20rpx;
}
</style>
