import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const connectionString = process.env.DATABASE_URL

export const db = new Pool({
    allowExitOnIdle: true,
    connectionString
})

export const connectPostgre = async () => {
    if (!connectionString) {
        console.warn('DATABASE_URL not set. Skipping PostgreSQL connection.')
        return
    }

    try {
        await db.query('SELECT NOW()')
        console.log('✅ PostgreSQL connected')
    } catch (error) {
        console.error ('❌ error connecting to PostgreSQL', error)
    }
}

process.on('SIGINT', async () => {
    console.log('Closing database connections')
    await db.end()
    process.exit(0)
})

export default connectPostgre