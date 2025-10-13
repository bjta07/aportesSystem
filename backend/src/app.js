import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

import userRouter from './routes/user.routes.js'

dotenv.config()

const app = express()

app.use (cors({
    origin: 'http//localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true}))
app.use(express.static('public'))

app.use('/api/users', userRouter)


export default app