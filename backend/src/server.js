import dotenv from 'dotenv'
import app from './app.js'
import connectPostgre from './config/db.js'

dotenv.config()

const PORT = process.env.PORT || 4000
const NODE_ENV = process.env.NODE_ENV || 'development'

// ✅ Validar JWT_SECRET antes de iniciar el servidor
if (NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    console.error('❌ Error: JWT_SECRET no está definido. El servidor no puede iniciarse en producción sin esta variable.')
    process.exit(1) // Detiene el proceso con error
}

const start = async () => {
    await connectPostgre()
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on port ${PORT}`)
    })
}

start()
