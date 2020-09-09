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
const userExercisesRouter = require('./user_exercises/user-exercises-router')
const exercisesTemplatesRouter = require('./exercises_templates/exercises-templates-router')
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
//load in the authentication router, for login
app.use('/api/auth', authRouter)
//load in user specific exercises router
app.use('/api/user-exercises', userExercisesRouter)
//load in templated exercises router
app.use('/api/exercises-templates', exercisesTemplatesRouter)
//load in the workouts router
app.use('/api/workouts', workoutsRouter)
//??? 
app.use(errorHandler)

module.exports = app

//go through router.js and service.js files