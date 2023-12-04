import AWS from 'aws-sdk'
import kcl from 'aws-kcl'
import util from 'util'
import { createClient } from 'redis'
import logger from '../../../../utilities/logger'

const credentials = new AWS.SharedIniFileCredentials({ profile: 'eb-cli' })
AWS.config.credentials = credentials

const redisPublisher = createClient()

const log = logger('recordProcessor').getLogger()

/*
	Using: https://github.com/awslabs/amazon-kinesis-client-nodejs
	
	Called as a separate Node.js process in console via ./dist folder's js file
		../../../../../node_modules/aws-kcl/bin/kcl-bootstrap --java /usr/bin/java -e -p ./sample.properties
*/
const recordProcessor = (() => {
	let shardId = null

	const initialize = (initializeInput, completeCallback) => {
		shardId = initializeInput.shardId

		// Initialization logic
		completeCallback()
	}

	const processRecords = (processRecordsInput, completeCallback) => {
		// Processing logic
		if (!processRecordsInput || !processRecordsInput.records) {
			// Must call completeCallback to proceed further
			completeCallback()
			return
		}

		const records = processRecordsInput.records
		let record, sequenceNumber, partitionKey, data
		let allRecords = []
		for (var i = 0; i < records.length; ++i) {
			record = records[i]
			sequenceNumber = record.sequenceNumber
			partitionKey = record.partitionKey
			// Note that "data" is a base64-encoded string. Buffer can be used to decode the base64 data into binary, then into a string
			try {
				data = Buffer.from(record.data, 'base64').toString()
				log.info(util.format('ShardID: %s, Record: %s, SeqenceNumber: %s, PartitionKey:%s', shardId, data, sequenceNumber, partitionKey))
				allRecords.push(JSON.parse(data))
			} catch (error) {
				log.info(util.format('Error processing record. ShardID: %s, SeqenceNumber: %s, PartitionKey:%s, Error: %s', shardId, sequenceNumber, partitionKey, error.message))
			}
		}
		if (!sequenceNumber) {
			// Must call completeCallback to proceed further
			completeCallback()
			return
		}
		// If checkpointing, only call completeCallback once checkpoint operation is complete.
		processRecordsInput.checkpointer.checkpoint(sequenceNumber, async function (err, checkpointedSequenceNumber) {
			log.info(util.format('Checkpoint successful. ShardID: %s, SeqenceNumber: %s, Records: %s', shardId, sequenceNumber, JSON.stringify(allRecords)))

			// Publish new record to listeners.js (must stringify records, as Redis works with strings (JSON) or binary data)
			redisPublisher.publish('kinesisRecordsChannel', JSON.stringify(allRecords))

			// In this example, regardless of error, we mark processRecords complete to proceed further with more records.
			completeCallback()
		})
	}

	const leaseLost = (leaseLostInput, completeCallback) => {
		log.info(util.format('Lease was lost for ShardId: %s', shardId))
		completeCallback()
	}

	const shardEnded = (shardEndedInput, completeCallback) => {
		log.info(util.format('ShardId: %s has ended. Will checkpoint now.', shardId))
		shardEndedInput.checkpointer.checkpoint(function (err) {
			completeCallback()
		})
	}

	const shutdownRequested = (shutdownRequestedInput, completeCallback) => {
		shutdownRequestedInput.checkpointer.checkpoint(function (err) {
			completeCallback()
		})
	}

	const shutdown = (shutdownInput, completeCallback) => {
		// Shutdown logic
		completeCallback()
	}

	return {
		initialize,
		processRecords,
		leaseLost,
		shardEnded,
		shutdownRequested,
		shutdown,
	}
})()

async function start() {
	try {
		log.info(util.format('Redis Connecting'))
		await redisPublisher.connect()
		log.info(util.format('Redis Connected'))
		kcl(recordProcessor).run()
	} catch (error) {
		log.info(util.format('Redis Error: %s', error))
	}
}

start()
