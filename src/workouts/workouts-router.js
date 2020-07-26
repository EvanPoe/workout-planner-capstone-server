const path = require('path')
const express = require('express')
const xss = require('xss')
const WorkoutsService = require('./workouts-service')

const workoutsRouter = express.Router()
const jsonParser = express.json()

const serializeWorkouts = workouts => ({
  id: workouts.id,
  user_id: workouts.user_id,
  type: xss(workouts.type),
  difficulty: xss(workouts.difficulty)
})

workoutsRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    WorkoutsService.getWorkoutss(knexInstance)
      .then(workoutss => {
        res.json(workoutss.map(serializeWorkouts))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { user_id, type, difficulty } = req.body
    const newWorkouts = { user_id, type, difficulty }

    for (const [key, value] of Object.entries(newWorkouts))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })

    WorkoutsService.insertWorkouts(
      req.app.get('db'),
      newWorkouts
    )
      .then(workouts => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${workouts.id}`))
          .json(serializeWorkouts(workouts))
      })
      .catch(next)
  })

workoutsRouter
  .route('/:workouts_id')
  .all((req, res, next) => {
    if(isNaN(parseInt(req.params.workouts_id))) {
      return res.status(404).json({
        error: { message: `Invalid id` }
      })
    }
    WorkoutsService.getWorkoutsById(
      req.app.get('db'),
      req.params.workouts_id
    )
      .then(workouts => {
        if (!workouts) {
          return res.status(404).json({
            error: { message: `Workouts doesn't exist` }
          })
        }
        res.workouts = workouts
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => { //vaules never used
    res.json(serializeWorkouts(res.workouts))
  })
  .delete((req, res, next) => {
    WorkoutsService.deleteWorkouts(
      req.app.get('db'),
      req.params.workouts_id
    )
      .then(numRowsAffected => {//vaule never used
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { user_id, type, difficulty } = req.body
    const workoutsToUpdate = { user_id, type, difficulty }

    const numberOfValues = Object.values(workoutsToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'user_id', 'type', or 'difficulty'`
        }
      })

    WorkoutsService.updateWorkouts(
      req.app.get('db'),
      req.params.workouts_id,
      workoutsToUpdate
    )
      .then(updatedWorkouts => {
        res.status(200).json(serializeWorkouts(updatedWorkouts[0]))
      })
      .catch(next)
  })

module.exports = workoutsRouter