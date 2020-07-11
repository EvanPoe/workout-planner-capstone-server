const path = require('path')
const express = require('express')
const xss = require('xss')
const ExercisesService = require('./exercises-service')
const workoutsRouter = require('../workouts/workouts-router')

const exercisesRouter = express.Router()
const jsonParser = express.json()

const serializeExercises = exercises => ({
  id: exercises.id,
  workout_id: exercises.workouts_id,
  name: xss(exercises.name),
  image: xss(exercises.image),
  description: xss(exercises.description),
  sets: xss(exercises.sets),
  rest: xss(exercises.rest),
  is_upper: exercises.is_upper,
  is_lower: exercises.is_lower,
  is_beginner: exercises.is_beginner,
  is_intermediate: exercises.is_intermediate,
  is_advanced: exercises.is_advanced
})

exercisesRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    ExercisesService.getExercisess(knexInstance)
      .then(exercisess => {
        res.json(exercisess.map(serializeExercises))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { title, completed = false } = req.body
    const newExercises = { title }

    for (const [key, value] of Object.entries(newExercises))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })

    newExercises.completed = completed;  

    ExercisesService.insertExercises(
      req.app.get('db'),
      newExercises
    )
      .then(exercises => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${exercises.id}`))
          .json(serializeExercises(exercises))
      })
      .catch(next)
  })

exercisesRouter
  .route('/:exercises_id')
  .all((req, res, next) => {
    if(isNaN(parseInt(req.params.exercises_id))) {
      return res.status(404).json({
        error: { message: `Invalid id` }
      })
    }
    ExercisesService.getExercisesById(
      req.app.get('db'),
      req.params.exercises_id
    )
      .then(exercises => {
        if (!exercises) {
          return res.status(404).json({
            error: { message: `Exercises doesn't exist` }
          })
        }
        res.exercises = exercises
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeExercises(res.exercises))
  })
  .delete((req, res, next) => {
    ExercisesService.deleteExercises(
      req.app.get('db'),
      req.params.exercises_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { title, completed } = req.body
    const exercisesToUpdate = { title, completed }

    const numberOfValues = Object.values(exercisesToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must content either 'title' or 'completed'`
        }
      })

    ExercisesService.updateExercises(
      req.app.get('db'),
      req.params.exercises_id,
      exercisesToUpdate
    )
      .then(updatedExercises => {
        res.status(200).json(serializeExercises(updatedExercises[0]))
      })
      .catch(next)
  })

module.exports = exercisesRouter