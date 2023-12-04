import WebSocket from 'ws'
import pako from 'pako'
import GoogleSheetsService from '../services/api/googleSheetsService'

class Helpers {
	public static getRandomNumberBetween(min: number, max: number): number {
		return Math.floor(Math.random() * (max - min + 1) + min)
	}

	/*
		Compress data using pako's gzip
	*/
	public static compressData(data: any): any {
		if (!data) {
			return data
		}

		try {
			const result = pako.gzip(JSON.stringify(data))
			return result
		} catch (error) {
			console.error('Compression error:', error)
			throw error
		}
	}

	/*
		Convert value to number type if it's a number
	*/
	public static parseValue(value: string): any {
		if (!value || value === '') {
			return null
		}

		const number = Number(value)
		return isNaN(number) ? value : number
	}

	/*
		Convert Google Sheets rows to JSON
	*/
	public static googleSheetsToJSON(sheetValues: any[][]): any[] {
		if (sheetValues.length === 0) {
			return []
		}

		// Pull header row (first row) out
		const [headers, ...rows] = sheetValues

		return rows.map((row) => {
			return row.reduce((accumulator, cell, index) => {
				accumulator[headers[index]] = this.parseValue(cell)
				return accumulator
			}, {})
		})
	}

	/*
		Get Gooogle Sheet data
	*/
	public static async getGoogleSheetData(spreadsheetId: string, sheetName: string): Promise<any> {
		const authToken = await GoogleSheetsService.getAuthToken()
		const sheet = await GoogleSheetsService.getSpreadSheetValues(authToken, spreadsheetId, sheetName)
		const json = this.googleSheetsToJSON(sheet.data.values)

		return json
	}

	/*
		Send Websocket payload when client is in ready state
	*/
	public static sendWebSocketMessage(wss: WebSocket.Server, dataType: any, description: any, compressedData: any): void {
		wss.clients.forEach((client: any) => {
			if (client.readyState === WebSocket.OPEN) {
				const response = {
					dataType,
					description,
					data: compressedData,
				}

				client.send(JSON.stringify(response))
			}
		})
	}

	/*
		Randomly adjust value by a certain percentage
	*/
	public static randomlyAdjustValue(value: number): number {
		const randomPercentage = this.getRandomNumberBetween(20, 30)
		const add = Math.random() >= 0.5
		const change = value * (randomPercentage / 100)
		return add ? value + change : value - change
	}
}

export default Helpers
