const path = require('path')
const express = require('express')
const xss = require('xss')
const ExercisesTemplatesService = require('./exercises-templates-service')
const workoutsRouter = require('../workouts/workouts-router') //??? not being used?

const exercisesTemplatesRouter = express.Router()
const jsonParser = express.json()

const serializeExercisesTemplates = exercisesTemplates => ({
  id: exercisesTemplates.id,
  name: xss(exercisesTemplates.name),
  image: xss(exercisesTemplates.image),
  description: xss(exercisesTemplates.description),
  sets: xss(exercisesTemplates.sets),
  rest: xss(exercisesTemplates.rest),
  is_upper: exercisesTemplates.is_upper,
  is_lower: exercisesTemplates.is_lower,
  is_beginner: exercisesTemplates.is_beginner,
  is_intermediate: exercisesTemplates.is_intermediate,
  is_advanced: exercisesTemplates.is_advanced
})

exercisesTemplatesRouter
  .route('/')
  //get all exercises-templates from database
  .get((req, res, next) => {
    console.log('hey hello')
    const knexInstance = req.app.get('db')
    ExercisesTemplatesService.getExercisesTemplates(knexInstance)
      .then(exercisesTemplates => {
        res.json(exercisesTemplates.map(serializeExercisesTemplates))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    console.log("req.body = ", req.body)
    const { workout_id, name, image, description, sets, rest, is_upper, is_lower, is_beginner, is_intermediate, is_advanced } = req.body
    const newExercisesTemplates = { workout_id, name, image, description, sets, rest, is_upper, is_lower, is_beginner, is_intermediate, is_advanced }

    for (const [key, value] of Object.entries(newExercisesTemplates))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })


    ExercisesTemplatesService.insertExercisesTemplates(
      req.app.get('db'),
      newExercisesTemplates
    )
      .then(exercisesTemplates => {
        console.log("exercisesTemplates from the service: ", exercisesTemplates)
        res
          .status(201)
          .json(serializeExercisesTemplates(exercisesTemplates))
      })
      .catch(next)
  })

  //get exercises_templates by id
exercisesTemplatesRouter
  .route('/:exercises_templates_id')
  .all((req, res, next) => {
    if(isNaN(parseInt(req.params.exercises_templates_id))) {
      return res.status(404).json({
        error: { message: `Invalid id` }
      })
    }
    ExercisesTemplatesService.getExercisesTemplatesByExerciseId(
      req.app.get('db'),
      req.params.exercises_templates_id
    )
      .then(exercisesTemplates => {
        if (!exercisesTemplates) {
          return res.status(404).json({
            error: { message: `ExercisesTemplates doesn't exist` }
          })
        }
        res.exercisesTemplates = exercisesTemplates
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => { 
    res.json(serializeExercisesTemplates(res.exercisesTemplates))
  })
  .delete((req, res, next) => {
    ExercisesTemplatesService.deleteExercisesTemplates(
      req.app.get('db'),
      req.params.exercises_templates_id
    )
      .then(numRowsAffected => { //??? never used?
        res.status(204).end()
      })
      .catch(next)
  })
  //???
  .patch(jsonParser, (req, res, next) => {
    const { workout_id, name, image, description, sets, rest, is_upper, is_lower, is_beginner, is_intermediate, is_advanced } = req.body
    const exercisesTemplatesToUpdate = { workout_id, name, image, description, sets, rest, is_upper, is_lower, is_beginner, is_intermediate, is_advanced }
    //places the values of exercisesTemplatesToUpdate object into an array, 
    //filters into array filled with any booleans, gets length, returns error if 0
    const numberOfValues = Object.values(exercisesTemplatesToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'workout_id', 'name', 'image', 'description', 'sets', 'rest', 'is_upper', 'is_lower', 'is_beginner', 'is_intermediate', or 'is_advanced'`
        }
      })
      //then...??? how exactly?
    ExercisesTemplatesService.updateExercisesTemplates(
      req.app.get('db'),
      req.params.exercises_templates_id,
      exercisesTemplatesToUpdate
    )
      .then(updatedExercisesTemplates => {
        res.status(200).json(serializeExercisesTemplates(updatedExercisesTemplates[0]))
      })
      .catch(next)
  })
  
exercisesTemplatesRouter
.route('/workout/:workout_id')
.all((req, res, next) => {
  //if not a number, parse into a number.... then???
  if(isNaN(parseInt(req.params.workout_id))) {
    return res.status(404).json({
      error: { message: `Invalid id` }
    })
  }
  ExercisesTemplatesService.getExercisesTemplatesByWorkoutId(
    req.app.get('db'),
    req.params.workout_id
  )
    .then(exercisesTemplates => {
      if (!exercisesTemplates) {
        return res.status(404).json({
          error: { message: `ExercisesTemplates doesn't exist` }
        })
      }
      res.exercisesTemplates = exercisesTemplates
      next()
    })
    .catch(next)
})
.get((req, res, next) => { //req and next not being used??
  res.json(res.exercisesTemplates)
})



module.exports = exercisesTemplatesRouter