import config from './config'
import AWS from 'aws-sdk'
import util from 'util'
import logger from '../../../../utilities/logger'
import Helpers from '../../../../utilities/helpers'

AWS.config.update({ region: config.kinesis.region })
const kinesis = new AWS.Kinesis()
const credentials = new AWS.SharedIniFileCredentials({ profile: 'eb-cli' })
AWS.config.credentials = credentials

const log = logger('recordProducer').getLogger()

/*
	Using: https://github.com/awslabs/amazon-kinesis-client-nodejs
*/
const recordProducer = (() => {
	/*
		Wait for the Kinesis stream to become "active" state
	*/
	const waitForStreamToBecomeActive = () => {
		return new Promise<void>((resolve, reject) => {
			const attemptDescribeStream = (): void => {
				kinesis.describeStream({ StreamName: config.producer.stream }, function (err, data) {
					if (err) {
						reject(err)
						return
					}

					log.info(util.format('Current status of the stream is %s.', data.StreamDescription.StreamStatus))
					if (data.StreamDescription.StreamStatus === 'ACTIVE') {
						// Resolves the promise when the stream is active
						resolve()
					} else {
						setTimeout(attemptDescribeStream, 1000 * config.producer.waitBetweenDescribeCallsInSeconds)
					}
				})
			}

			// Initial call to start the process
			attemptDescribeStream()
		})
	}

	/*
		Create Kinesis stream if not created
	*/
	const createStreamIfNotCreated = () => {
		return new Promise<void>((resolve, reject) => {
			const params = {
				ShardCount: config.producer.shards,
				StreamName: config.producer.stream,
			}

			kinesis.createStream(params, async function (err, data) {
				if (err) {
					if (err.code !== 'ResourceInUseException') {
						return reject(err)
					} else {
						log.info(util.format('%s stream is already exists. Re-using it: ', config.producer.stream))
					}
				} else {
					log.info(util.format("%s stream doesn't exist. Created a new stream with that name: ", config.producer.stream))
				}

				// Poll to make sure stream is in ACTIVE state before start pushing data
				try {
					await waitForStreamToBecomeActive()
					resolve()
				} catch (error) {
					reject(error)
				}
			})
		})
	}

	/*
		Add record to Kinesis stream
	*/
	const putRecordInKinesis = async (data: any): Promise<void> => {
		try {
			// Create data stream if it doesn't exist
			await createStreamIfNotCreated()
		} catch (error) {
			throw error
		}

		// Once data stream is created, put record in Kinesis data stream
		const params = {
			Data: JSON.stringify(data),
			PartitionKey: `${config.producer.partitionKeyStem}-${Helpers.getRandomNumberBetween(1000, 1999)}`,
			StreamName: config.producer.stream,
		}

		kinesis.putRecord(params, (err, data) => {
			if (err) {
				console.error(err)
			} else {
				console.log('Put Record succeeded', data)
			}
		})
	}

	return {
		putRecordInKinesis,
	}
})()

export default recordProducer
