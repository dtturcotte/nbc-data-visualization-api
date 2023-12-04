import { google } from 'googleapis'
const Sheets = google.sheets('v4')
const scopes = ['https://www.googleapis.com/auth/spreadsheets']

class GoogleSheetsService {
	public static getAuthToken(): any {
		const auth = new google.auth.GoogleAuth({
			keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
			scopes: scopes,
		})
		return auth.getClient()
	}

	public static getSpreadSheet(authToken: any, spreadsheetId: string) {
		return Sheets.spreadsheets.get({
			spreadsheetId: spreadsheetId,
			auth: authToken,
		})
	}

	public static getSpreadSheetValues(authToken: any, spreadsheetId: string, sheetName: string) {
		return Sheets.spreadsheets.values.get({
			spreadsheetId: spreadsheetId,
			auth: authToken,
			range: sheetName,
		})
	}
}

export default GoogleSheetsService
