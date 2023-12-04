import knexfile from '../knexfile'
const environment = process.env.ENVIRONMENT

if (!environment || !knexfile[environment]) {
	throw new Error(`Invalid or missing environment configuration: ${environment}`)
}

console.log(`Using "${environment}" configuration to load knex.`)
const knex = require('knex')(knexfile[environment])

export default knex
