import { OAuth2Client } from 'google-auth-library'
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

class GoogleAuthService {
	public static async authenticate(credential: string): Promise<any> {
		try {
			const ticket = await client.verifyIdToken({
				idToken: credential,
				audience: process.env.GOOGLE_CLIENT_ID,
			})
			return ticket.getPayload()
		} catch (error) {
			throw error
		}
	}
}

export default GoogleAuthService
