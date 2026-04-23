const SPP_UUID = '00001101-0000-1000-8000-00805F9B34FB'

let socket = null
let outputStream = null
let inputStream = null
let connectedDeviceId = ''
let connectedDeviceName = ''
let receiveTimer = null
let onReceiveCallback = null

const setOnSppReceive = (callback) => {
	onReceiveCallback = callback
}

const stopReceiveTimer = () => {
	if (receiveTimer) {
		clearInterval(receiveTimer)
		receiveTimer = null
	}
}

const startReceiveTimer = () => {
	stopReceiveTimer()
	receiveTimer = setInterval(() => {
		if (!isConnected() || !inputStream) {
			return
		}
		try {
			const available = plus.android.invoke(inputStream, 'available')
			if (available > 0) {
				const bytes = []
				for (let i = 0; i < available; i++) {
					const b = plus.android.invoke(inputStream, 'read')
					if (b !== -1) {
						bytes.push(b)
					}
				}
				if (bytes.length > 0 && typeof onReceiveCallback === 'function') {
					onReceiveCallback(bytes)
				}
			}
		} catch (error) {
			// ignore read error
		}
	}, 100)
}

const assertAndroidEnv = () => {
	if (typeof plus === 'undefined' || !plus.android) {
		throw new Error('当前环境不支持SPP，请在Android App端运行')
	}
}

const getAdapter = () => {
	assertAndroidEnv()
	const BluetoothAdapter = plus.android.importClass('android.bluetooth.BluetoothAdapter')
	const adapter = BluetoothAdapter.getDefaultAdapter()
	if (!adapter) {
		throw new Error('设备不支持蓝牙')
	}
	if (!plus.android.invoke(adapter, 'isEnabled')) {
		throw new Error('蓝牙未开启')
	}
	return adapter
}

const closeQuietly = (target) => {
	if (!target) {
		return
	}
	try {
		plus.android.invoke(target, 'close')
	} catch (error) {
		// ignore close error
	}
}

const isConnected = () => {
	if (!socket) {
		return false
	}
	try {
		return !!plus.android.invoke(socket, 'isConnected')
	} catch (error) {
		return false
	}
}

const disconnectSpp = () => {
	stopReceiveTimer()
	closeQuietly(inputStream)
	closeQuietly(outputStream)
	closeQuietly(socket)
	inputStream = null
	outputStream = null
	socket = null
	connectedDeviceId = ''
	connectedDeviceName = ''
}

const connectSocketInternal = (adapter, remoteDevice, uuid) => {
	let targetSocket = null
	try {
		targetSocket = plus.android.invoke(remoteDevice, 'createRfcommSocketToServiceRecord', uuid)
		plus.android.invoke(adapter, 'cancelDiscovery')
		plus.android.invoke(targetSocket, 'connect')
		return targetSocket
	} catch (secureError) {
		closeQuietly(targetSocket)
		targetSocket = plus.android.invoke(remoteDevice, 'createInsecureRfcommSocketToServiceRecord', uuid)
		plus.android.invoke(adapter, 'cancelDiscovery')
		plus.android.invoke(targetSocket, 'connect')
		return targetSocket
	}
}

const connectSpp = (deviceId) => {
	if (!deviceId) {
		throw new Error('缺少 deviceId，无法建立SPP连接')
	}

	if (isConnected() && connectedDeviceId === deviceId && outputStream) {
		return
	}

	disconnectSpp()

	const adapter = getAdapter()
	const UUID = plus.android.importClass('java.util.UUID')
	const remoteDevice = plus.android.invoke(adapter, 'getRemoteDevice', deviceId)
	const uuid = UUID.fromString(SPP_UUID)
	const connectedSocket = connectSocketInternal(adapter, remoteDevice, uuid)
	const stream = plus.android.invoke(connectedSocket, 'getOutputStream')
	const inStream = plus.android.invoke(connectedSocket, 'getInputStream')

	if (!connectedSocket || !stream || !inStream || !plus.android.invoke(connectedSocket, 'isConnected')) {
		closeQuietly(inStream)
		closeQuietly(stream)
		closeQuietly(connectedSocket)
		throw new Error('SPP连接未建立成功')
	}

	socket = connectedSocket
	outputStream = stream
	inputStream = inStream
	connectedDeviceId = deviceId
	connectedDeviceName = plus.android.invoke(remoteDevice, 'getName') || ''

	startReceiveTimer()
}

const getSppState = () => ({
	connected: isConnected(),
	deviceId: connectedDeviceId,
	deviceName: connectedDeviceName
})

const normalizeHexToken = (token) => {
	if (!token) {
		return ''
	}
	return token.trim().replace(/^0x/i, '')
}

const parseHexCommand = (command) => {
	if (!command || typeof command !== 'string') {
		throw new Error('命令为空，无法发送')
	}

	const tokens = command
		.trim()
		.split(/\s+/)
		.filter(Boolean)

	if (!tokens.length) {
		throw new Error('命令格式错误，无法发送')
	}

	return tokens.map((token) => {
		const normalized = normalizeHexToken(token)
		if (!/^[0-9a-fA-F]{1,2}$/.test(normalized)) {
			throw new Error(`命令字节格式错误: ${token}`)
		}
		return parseInt(normalized, 16)
	})
}

const sendSppBytes = (bytes) => {
	if (!isConnected() || !outputStream) {
		throw new Error('SPP未连接，无法发送命令')
	}

	const packetStream = plus.android.newObject('java.io.ByteArrayOutputStream')
	for (let i = 0; i < bytes.length; i += 1) {
		plus.android.invoke(packetStream, 'write', Number(bytes[i]))
	}
	const payload = plus.android.invoke(packetStream, 'toByteArray')
	plus.android.invoke(outputStream, 'write', payload, 0, bytes.length)
	closeQuietly(packetStream)
	plus.android.invoke(outputStream, 'flush')
}

const sendSppHexCommand = (command) => {
	const bytes = parseHexCommand(command)
	sendSppBytes(bytes)
}

const calculateCrc16Modbus = (bytes) => {
	let crc = 0xFFFF
	for (let i = 0; i < bytes.length; i += 1) {
		crc ^= Number(bytes[i]) & 0xFF
		for (let bit = 0; bit < 8; bit += 1) {
			if ((crc & 0x0001) !== 0) {
				crc = (crc >> 1) ^ 0xA001
			} else {
				crc >>= 1
			}
		}
	}
	return crc & 0xFFFF
}

const buildSppHexCommandWithCrc = (payloadCommand) => {
	const payload = parseHexCommand(payloadCommand)
	const crc = calculateCrc16Modbus(payload)
	const low = crc & 0xFF
	const high = (crc >> 8) & 0xFF
	const packet = payload.concat([low, high])
	return packet
		.map((value) => value.toString(16).toUpperCase().padStart(2, '0'))
		.join(' ')
}

export {connectSpp, getSppState, disconnectSpp, sendSppHexCommand, buildSppHexCommandWithCrc, setOnSppReceive}