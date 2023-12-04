/*
	server.ts

	Bootstrapping and starting the server
	- Import express app
	- Create & configure server (HTTP or Websocket)
	- Start server
*/
import app from './app'
import WebSocket from 'ws'
import dotenv from 'dotenv'

import Listeners from './services/listeners'
import Polling from './services/polling'

dotenv.config()

const PORT = process.env.PORT || 3010
const websocketPort = 3011

// Set up WebSocket server
const wss = new WebSocket.Server({ port: websocketPort })

wss.on('connection', function connection(ws, req) {
	const clientIp = req.socket.remoteAddress
	console.log(`Websocet Server: a new client connected from ${clientIp}`)

	ws.on('message', function incoming(message) {
		console.log(`Websocket Server: received message from ${clientIp}:`, message)
	})

	ws.on('error', function (error) {
		console.log(`Websocket Server: error from ${clientIp}:`, error)
	})

	ws.on('close', function (code, reason) {
		console.log(`WebSocket Server: client ${clientIp} disconnected, code ${code}, reason: ${reason}`)
	})

	ws.send(JSON.stringify({ message: 'WebSocket Server: connected!' }))

	console.log(`WebSocket Server: running on ws://localhost:${websocketPort}`)
})

wss.on('error', function (error) {
	console.error('WebSocket Server: server error:', error)
})

// Start listeners and polling
Listeners.listenForRedisMessages(wss)
Listeners.listenForDatabaseChanges(wss)
Polling.startPollingInterval(wss)

// Start the Express server
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})
