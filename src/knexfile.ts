import dotenv from 'dotenv'
import path from 'path'

// Point dotenv to root/.env, rather than root/src/.env
const envDirectory = path.join(__dirname, '../.env')
dotenv.config({ path: envDirectory })

// Point to root/migrations directory, rather than root/src/migrations
const migrationsDirectory = '../migrations'

const knexConfig = {
	test: {
		client: 'pg',
		version: '7.2',
		connection: {
			host: process.env.TEST_PG_HOST,
			port: process.env.TEST_PG_PORT,
			user: process.env.TEST_PG_USER,
			password: process.env.TEST_PG_PASSWORD,
			database: process.env.TEST_PG_DB,
			charset: 'utf8',
		},
		pool: {
			min: 0,
			max: 10,
		},
		migrations: {
			tableName: 'knex_migrations',
			directory: migrationsDirectory,
		},
		debug: false,
	},

	development: {
		client: 'pg',
		version: '7.2',
		connection: {
			host: process.env.PG_HOST,
			port: process.env.PG_PORT,
			user: process.env.PG_USER,
			password: process.env.PG_PASSWORD,
			database: process.env.PG_DB,
			charset: 'utf8',
		},
		pool: {
			min: 0,
			max: 10,
		},
		migrations: {
			tableName: 'knex_migrations',
			directory: migrationsDirectory,
		},
		debug: false,
	},

	staging: {
		client: 'pg',
		version: '7.2',
		connection: {
			host: process.env.PG_HOST,
			port: process.env.PG_PORT,
			user: process.env.PG_USER,
			password: process.env.PG_PASSWORD,
			database: process.env.PG_DB,
			charset: 'utf8',
		},
		pool: {
			min: 0,
			max: 10,
		},
		migrations: {
			tableName: 'knex_migrations',
			directory: migrationsDirectory,
		},
	},

	production: {
		client: 'pg',
		version: '7.2',
		connection: {
			host: process.env.PG_HOST,
			port: process.env.PG_PORT,
			user: process.env.PG_USER,
			password: process.env.PG_PASSWORD,
			database: process.env.PG_DB,
			charset: 'utf8',
		},
		pool: {
			min: 0,
			max: 10,
		},
		migrations: {
			tableName: 'knex_migrations',
			directory: migrationsDirectory,
		},
	},
}

export default knexConfig
