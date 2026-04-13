import express from 'express'
import { healthRoute } from './routes/healthRoute'

export const app = express()
app.use(express.json())
app.use(healthRoute)
