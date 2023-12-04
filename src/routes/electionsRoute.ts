import express, { Request, Response } from 'express'
import fs from 'fs/promises'
import path from 'path'

import nyt2020ElectionData from '../static/nyt_2020_election.json'
import Helpers from '../utilities/helpers'
import Polling from '../services/polling'

const router = express.Router()

router.get('/elections/nyt2020_json', async (req: Request, res: Response) => {
	try {
		const compressedData = await Helpers.compressData(nyt2020ElectionData)
		// Sending header "gzip"
		res.setHeader('Access-Control-Expose-Headers', 'Content-Encoding')
		res.setHeader('Content-Encoding', 'gzip')
		res.status(200).send(Buffer.from(compressedData))
	} catch (error) {
		console.log('Error: ', error)
		res.status(500).json({ error: 'Internal server error' })
	}
})

router.get('/elections/nyc_districts_geojson', async (req: Request, res: Response) => {
	try {
		const dataPath = path.join(__dirname, '../static/nyc_districts.geojson')
		let nycDistrictsData = await fs.readFile(dataPath, 'utf8')
		nycDistrictsData = JSON.parse(nycDistrictsData)
		const compressedData = await Helpers.compressData(nycDistrictsData)
		// Sending header "gzip"
		res.setHeader('Access-Control-Expose-Headers', 'Content-Encoding')
		res.setHeader('Content-Encoding', 'gzip')
		res.setHeader('Content-Type', 'geo+json')
		res.status(200).send(Buffer.from(compressedData))
	} catch (error) {
		console.log('Error: ', error)
		res.status(500).json({ error: 'Internal server error' })
	}
})

router.get('/elections/start_emit_election_race', (req: Request, res: Response) => {
	Polling.startEmitElectionRace()
	res.status(200).send('OK')
})

router.get('/elections/stop_emit_election_race', (req: Request, res: Response) => {
	Polling.stopEmitElectionRace()
	res.status(200).send('OK')
})

export default router
