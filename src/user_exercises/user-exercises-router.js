const path = require('path')
const express = require('express')
const xss = require('xss')
const UserExercisesService = require('./user-exercises-service')
const workoutsRouter = require('../workouts/workouts-router') //??? not being used?

const exercisesRouter = express.Router()
const jsonParser = express.json()

const serializeExercises = exercises => ({
  id: exercises.id,
  workout_id: exercises.workout_id,
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
  //get all exercises from database
  .get((req, res, next) => {
    console.log('hey hello')
    const knexInstance = req.app.get('db')
    UserExercisesService.getExercises(knexInstance)
      .then(exercises => {
        console.log(exercises)
        res.json(exercises.map(serializeExercises))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    console.log("req.body = ", req.body)
    const { workout_id, name, image, description, sets, rest, is_upper, is_lower, is_beginner, is_intermediate, is_advanced } = req.body
    const newExercises = { workout_id, name, image, description, sets, rest, is_upper, is_lower, is_beginner, is_intermediate, is_advanced }

    for (const [key, value] of Object.entries(newExercises))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })


    UserExercisesService.insertExercises(
      req.app.get('db'),
      newExercises
    )
      .then(exercises => {
        console.log("exercises from the service: ", exercises)
        res
          .status(201)
          .json(serializeExercises(exercises))
      })
      .catch(next)
  })

  //get exercises by id
exercisesRouter
  .route('/:exercises_id')
  .all((req, res, next) => {
    if(isNaN(parseInt(req.params.exercises_id))) {
      return res.status(404).json({
        error: { message: `Invalid id` }
      })
    }
    UserExercisesService.getExercisesByExerciseId(
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
    UserExercisesService.deleteExercises(
      req.app.get('db'),
      req.params.exercises_id
    )
      .then(numRowsAffected => { //??? never used?
        res.status(204).end()
      })
      .catch(next)
  })
  //???
  .patch(jsonParser, (req, res, next) => {
    const { workout_id, name, image, description, sets, rest, is_upper, is_lower, is_beginner, is_intermediate, is_advanced } = req.body
    const exercisesToUpdate = { workout_id, name, image, description, sets, rest, is_upper, is_lower, is_beginner, is_intermediate, is_advanced }
    //places the values of exercisesToUpdate object into an array, 
    //filters into array filled with any booleans, gets length, returns error if 0
    const numberOfValues = Object.values(exercisesToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'workout_id', 'name', 'image', 'description', 'sets', 'rest', 'is_upper', 'is_lower', 'is_beginner', 'is_intermediate', or 'is_advanced'`
        }
      })
      //then...??? how exactly?
    UserExercisesService.updateExercises(
      req.app.get('db'),
      req.params.exercises_id,
      exercisesToUpdate
    )
      .then(updatedExercises => {
        res.status(200).json(serializeExercises(updatedExercises[0]))
      })
      .catch(next)
  })
  
exercisesRouter
.route('/workout/:workout_id')
.all((req, res, next) => {
  //if not a number, parse into a number.... then???
  if(isNaN(parseInt(req.params.workout_id))) {
    return res.status(404).json({
      error: { message: `Invalid id` }
    })
  }
  UserExercisesService.getExercisesByWorkoutId(
    req.app.get('db'),
    req.params.workout_id
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
.get((req, res, next) => { //req and next not being used??
  res.json(res.exercises)
})



module.exports = exercisesRouter