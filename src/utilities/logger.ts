/*
	Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
	SPDX-License-Identifier: Apache-2.0
*/

'use strict'

import log4js from 'log4js'

/*
	Log4js configuration
*/
const logger = (category: string) => {
	const logDir = category === 'recordProducer' ? 'producer' : 'consumer'
	const logPath = category === 'recordProducer' ? '.' : '../../../../..'
	const fileName = `${logPath}/logs/${logDir}/application.log`

	const config = {
		appenders: {
			default: {
				type: 'file',
				filename: fileName,
				pattern: '-yyyy-MM-dd',
				layout: {
					type: 'pattern',
					pattern: '%d (PID: %x{pid}) %p %c - %m',
					tokens: {
						pid: function () {
							return process.pid
						},
					},
				},
			},
		},
		categories: {
			default: { appenders: ['default'], level: 'info' },
		},
	}

	log4js.configure(config)

	return {
		getLogger: function (): any {
			return log4js.getLogger(category)
		},
	}
}

export default logger
