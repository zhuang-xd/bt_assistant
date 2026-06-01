<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/* 全局样式 */
	page {
		background: #f0f2f8;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		color: #1a1a2e;
	}

	/* 全局按钮美化 */
	button {
		border: none;
		outline: none;
		transition: all 0.2s ease;
	}

	button::after {
		border: none;
	}

	button[type="primary"] {
		background: linear-gradient(135deg, #4f6ef6 0%, #6b85ff 100%);
		color: #fff;
	}

	button[type="primary"]:active {
		background: linear-gradient(135deg, #3a54d4 0%, #5a72e8 100%);
		transform: scale(0.97);
		opacity: 0.9;
	}

	button[type="primary"][disabled] {
		background: #c8cce0;
		color: #fff;
		opacity: 0.6;
	}

	button[type="warn"] {
		background: linear-gradient(135deg, #ff6b6b 0%, #ff8e8e 100%);
		color: #fff;
	}

	button[type="warn"]:active {
		background: linear-gradient(135deg, #e55a5a 0%, #f07a7a 100%);
		transform: scale(0.97);
		opacity: 0.9;
	}

	/* 滚动条美化 */
	::-webkit-scrollbar {
		width: 4px;
	}

	::-webkit-scrollbar-track {
		background: transparent;
	}

	::-webkit-scrollbar-thumb {
		background: #c8cce0;
		border-radius: 2px;
	}

	/* 输入框全局美化 */
	input {
		outline: none;
		border: 1px solid #e5e7ef;
		border-radius: 12px;
		background: #f8f9fd;
		color: #1a1a2e;
		font-size: 14px;
		transition: border-color 0.2s ease;
	}

	input:focus {
		border-color: #4f6ef6;
		background: #fff;
	}
</style>