require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const errorHandler = require('./middleware/error-handler')
const todoRouter = require('./todo/todo-router')
const usersRouter = require('./users/users-router')
const authRouter = require('./auth/auth-router')
const exercisesRouter = require('./exercises/exercises-router')
const workoutsRouter = require('./workouts/workouts-router')

const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption, {
  skip: () => NODE_ENV === 'test',
}))
app.use(cors())
app.use(helmet())

app.use(express.static('public'))

app.use('/v1/todos', todoRouter)
//load in registration router (post a user to register)
app.use('/api/users', usersRouter)
//load in the authentication router
app.use('/api/auth', authRouter)
//load in the exercises router
app.use('/api/exercises', exercisesRouter)
//load in the workouts router
app.use('/api/workouts', workoutsRouter)
//??? 
app.use(errorHandler)

module.exports = app

//go through router.js and service.js files