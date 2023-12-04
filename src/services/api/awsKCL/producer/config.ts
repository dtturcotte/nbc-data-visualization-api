const config = {
	kinesis: {
		region: 'us-east-1',
	},

	producer: {
		partitionKeyStem: `partition-key`,
		stream: 'nbc-data-visualization-stream-typescript',
		shards: 2,
		waitBetweenDescribeCallsInSeconds: 5,
	},
}

export default config
