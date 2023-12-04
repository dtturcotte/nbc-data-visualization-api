import express, { Request, Response } from 'express'
import knex from '../services/knexService'
import awsKCLProducer from '../services/api/awsKCL/producer/awsKCLProducer'
import Helpers from '../utilities/helpers'

const router = express.Router()

/*
	Google Sheets
*/
router.get('/polls/google_sheets', async (req: Request, res: Response) => {
	try {
		const googleSheetData = await Helpers.getGoogleSheetData(process.env.GOOGLE_SHEETS_ID, process.env.GOOGLE_SHEETS_TABNAME)
		const compressedData = Helpers.compressData(googleSheetData)
		res.setHeader('Access-Control-Expose-Headers', 'Content-Encoding')
		res.setHeader('Content-Encoding', 'gzip')
		res.status(200).send(Buffer.from(compressedData))
	} catch (error) {
		console.log('Error: ', error)
		res.status(500).json({ error: 'Internal server error' })
	}
})

/*
	Kinesis
*/
router.post('/polls/kinesis', (req: Request, res: Response) => {
	awsKCLProducer.putRecordInKinesis(req.body[0])
	res.status(201).send('OK')
})

/*
	Database
*/
router.get('/polls/db', async (req: Request, res: Response) => {
	try {
		const polls = await knex('polls').select('*')
		res.status(200).json(polls)
	} catch (error) {
		console.log('Error: ', error)
		res.status(500).json({ error: 'Internal server error' })
	}
})

router.post('/polls/db', async (req: Request, res: Response) => {
	try {
		const upsertPoll = await knex('polls').insert(req.body[0]).onConflict('id').merge().returning('*')
		res.status(201).json(upsertPoll)
	} catch (error) {
		console.log('Error: ', error)
		res.status(500).json({ error: 'Internal server error' })
	}
})

export default router
