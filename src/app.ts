/*
	app.ts

	Core express app setup
	- Middleware
	- Routes
	- Etc
*/
import express from 'express'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import cors from 'cors'

import electionsRoutes from './routes/electionsRoute'
import pollsRoutes from './routes/pollsRoute'

const app = express()

app.use(express.static('static'))

// Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(morgan('dev'))

// CORS configuration
const allowedOrigins = ['http://localhost:3001']
app.use(
	cors({
		credentials: true,
		origin: function (origin, callback) {
			if (!origin) return callback(null, true)
			if (allowedOrigins.indexOf(origin) === -1) {
				const errorMessage = 'The CORS policy for this site does not allow access from the specified Origin.'
				return callback(new Error(errorMessage), false)
			}
			return callback(null, true)
		},
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
	})
)

// Routes
app.use('/api', electionsRoutes)
app.use('/api', pollsRoutes)

export default app
