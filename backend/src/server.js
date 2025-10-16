import dotenv from 'dotenv'
import app from './app.js'
import connectPostgre from './config/db.js'

dotenv.config()

const PORT = process.env.PORT || 4000

const start = async () => {
    await connectPostgre()
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`)
    })
}

start()