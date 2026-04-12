import express from 'express';

import { feedbackRoute } from './routes/feedbackRoute';
import { healthRoute } from './routes/healthRoute';

export const app = express();

app.use(express.json());
app.use(healthRoute);
app.use(feedbackRoute);
