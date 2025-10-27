import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import userRouter from './routes/user.routes.js'
import memberRouter from './routes/member.routes.js'
import aporteRouter from './routes/aporte.routes.js'
import colegioRouter from './routes/colegio.routes.js'

dotenv.config()

const app = express()

// Simple request logger to debug incoming requests (including OPTIONS preflight)
app.use((req, res, next) => {
    console.log('[backend] Incoming request:', req.method, req.originalUrl)
    next()
})

app.use (cors({
    origin: 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true}))
app.use(express.static('public'))

// Extra explicit CORS headers for preflight and safety
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000')
    res.header('Access-Control-Allow-Credentials', 'true')
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    // short-circuit preflight
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204)
    }
    next()
})

app.use('/api/users', userRouter)
app.use('/api/members', memberRouter)
app.use('/api/aportes', aporteRouter)
app.use('/api/colegio', colegioRouter)


export default app