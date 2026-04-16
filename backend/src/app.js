const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const authRoutes = require('./routes/authRoutes')
const taskRoutes = require('./routes/taskRoutes')
const errorMiddleware = require('./middleware/errorMiddleware')
const env = require('./config/env')

const app = express()
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(helmet())
app.use(
  cors({
    origin: env.clientOrigin,
  }),
)
app.use(morgan('dev'))
app.use(express.json())
app.use(apiLimiter)

app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to TaskFlow Pro API' })
})

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'TaskFlow Pro API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)

app.use(errorMiddleware)

module.exports = app
