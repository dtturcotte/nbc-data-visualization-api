import { Client } from 'pg'
import { createClient } from 'redis'
import Helpers from '../utilities/helpers'
import WebSocket from 'ws'

class Listeners {
	/*
		Set up Redis connection and pub/sub, then listen (helps share data between multiple processes)
	*/
	public static async listenForRedisMessages(wss: WebSocket.Server): Promise<void> {
		const redisSubscriber = createClient()
		console.log('REDIS (Kinesis) subscriber connecting...')
		await redisSubscriber.connect()
		console.log('REDIS (Kinesis) subscriber connected')
		await redisSubscriber.subscribe('kinesisRecordsChannel', (message) => {
			console.log('REDIS (Kinesis) message: received')
			const payload = JSON.parse(message)
			const compressedData = Helpers.compressData(payload)
			console.log('REDIS (Kinesis) message: sending via WebSocket')
			Helpers.sendWebSocketMessage(wss, 'compressed', 'polls', compressedData)
		})
	}

	/*
		Set up a DB connection to PostgreSQL, then listen
	*/
	public static listenForDatabaseChanges(wss: WebSocket.Server) {
		const dbClient = new Client({
			connectionString: process.env.DATABASE_URL,
		})

		dbClient.connect((err: any) => {
			if (err) {
				console.error('Connection error', err.stack)
			} else {
				console.log('Connected to database')
			}
		})

		// Listen for changes on the "data_changes" channel
		dbClient.query('LISTEN data_changes')

		dbClient.on('notification', function (message: any) {
			console.log('DB message: received')
			try {
				let payload = JSON.parse(message.payload)
				if (!Array.isArray(payload)) {
					payload = [payload]
				}
				console.log('DB message: sending via WebSocket')
				const compressedData = Helpers.compressData(payload)
				Helpers.sendWebSocketMessage(wss, 'compressed', 'polls', compressedData)
			} catch (e) {
				console.error('Error parsing JSON:', e)
			}
		})

		dbClient.on('error', (error: any) => console.error('Database client error', error))
		wss.on('error', (error: any) => console.error('WebSocket error', error))
	}
}

export default Listeners
