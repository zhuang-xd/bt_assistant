const SPP_UUID = '00001101-0000-1000-8000-00805F9B34FB'

let socket = null
let outputStream = null
let connectedDeviceId = ''
let connectedDeviceName = ''

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
	closeQuietly(outputStream)
	closeQuietly(socket)
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

	if (!connectedSocket || !stream || !plus.android.invoke(connectedSocket, 'isConnected')) {
		closeQuietly(stream)
		closeQuietly(connectedSocket)
		throw new Error('SPP连接未建立成功')
	}

	socket = connectedSocket
	outputStream = stream
	connectedDeviceId = deviceId
	connectedDeviceName = plus.android.invoke(remoteDevice, 'getName') || ''
}

const getSppState = () => ({
	connected: isConnected(),
	deviceId: connectedDeviceId,
	deviceName: connectedDeviceName
})

export {connectSpp, getSppState, disconnectSpp}