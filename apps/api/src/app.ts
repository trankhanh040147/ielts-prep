import express from 'express'
import { healthRoute } from './routes/healthRoute'
import { feedbackRoute } from './routes/feedbackRoute'

export const app = express()
app.use(express.json())
app.use(healthRoute)
app.use(feedbackRoute)
