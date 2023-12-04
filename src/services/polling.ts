import nyt2020ElectionData from '../static/nyt_2020_election.json'
import Helpers from '../utilities/helpers'
import WebSocket from 'ws'

let previousData = {}
let isEmitElectionRace = false

class Polling {
	/*
		Get poll data from Google Sheet
		- If we wanted to do it this way...
		- Currently, we're using a Google Sheets App Script onEdit hook that pushes notifications to the server endpoints
	*/
	public static async pollGoogleSheetForChangesAndTransmit(wss: WebSocket.Server): Promise<void> {
		const newData = await Helpers.getGoogleSheetData(process.env.GOOGLE_SHEETS_ID, process.env.GOOGLE_SHEETS_TABNAME)

		// Data has not changed
		if (JSON.stringify(newData) === JSON.stringify(previousData)) {
			return
		}

		previousData = newData

		try {
			const compressedData = Helpers.compressData(newData)
			Helpers.sendWebSocketMessage(wss, 'compressed', 'googleSheets', compressedData)
		} catch (error) {
			console.error('Error compressing data:', error)
		}
	}

	/*
		Find a random election race
		- If previously visited, modify the race data's leader_margin_value
		- If not visited, send the race data as is
	*/
	public static async emitElectionRace(wss: WebSocket.Server): Promise<void> {
		const electionData: any = nyt2020ElectionData

		let electionRaces = electionData.data.races.filter((race: any) => !race.hasBeenAdded)
		if (!electionRaces.length) {
			electionRaces = electionData.data.races
		}

		let randomIndex = Helpers.getRandomNumberBetween(0, electionRaces.length - 1)
		let randomElectionRace = electionRaces[randomIndex]

		if (!randomElectionRace) {
			throw new Error(`No election race: randomIndex: ${randomIndex}, electionRaces.length: ${electionRaces.length}`)
		}

		if (randomElectionRace.hasBeenAdded) {
			const newVal = Helpers.randomlyAdjustValue(randomElectionRace.leader_margin_value)
			randomElectionRace.leader_margin_value = newVal
			if (randomElectionRace.leader_margin_value < 0) {
				randomElectionRace.leader_party_id = randomElectionRace.leader_party_id === 'republican' ? 'democrat' : 'republican'
				randomElectionRace.leader_margin_value = Math.abs(randomElectionRace.leader_margin_value)
			}
		}

		randomElectionRace.hasBeenAdded = true

		const compressedData = Helpers.compressData(randomElectionRace)
		Helpers.sendWebSocketMessage(wss, 'compressed', 'electionRace', compressedData)
	}

	public static stopEmitElectionRace(): void {
		isEmitElectionRace = false
	}

	public static startEmitElectionRace(): void {
		isEmitElectionRace = true
	}

	/*
		Emit election race data via websockets
	*/
	public static startPollingInterval(wss: WebSocket.Server): void {
		setInterval(() => {
			console.log('emit election race: ', isEmitElectionRace)
			if (isEmitElectionRace) {
				this.emitElectionRace(wss)
			}
		}, 3000)
	}
}

export default Polling
