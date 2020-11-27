const path = require("path");
const express = require("express");
const xss = require("xss");
const WorkoutsService = require("./workouts-service");
const UserExercisesService = require("../user_exercises/user-exercises-service");
const ExercisesTemplatesService = require("../exercises_templates/exercises-templates-service");

const workoutsRouter = express.Router();
const jsonParser = express.json();

const serializeWorkouts = (workouts) => ({
  id: workouts.id,
  user_id: workouts.user_id,
  type: xss(workouts.type),
  difficulty: xss(workouts.difficulty),
});

//get all workouts
workoutsRouter
  .route("/")
  .get((req, res, next) => {
    const knexInstance = req.app.get("db");
    WorkoutsService.getWorkoutss(knexInstance)
      .then((workoutss) => {
        res.json(workoutss.map(serializeWorkouts));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { user_id, type, difficulty } = req.body;
    const newWorkouts = { user_id, type, difficulty };
    const knexInstance = req.app.get("db");

    for (const [key, value] of Object.entries(newWorkouts))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });

    WorkoutsService.insertWorkouts(req.app.get("db"), newWorkouts)
      .then((workouts) => {
        //console.log(workouts.id);
        //get all exercises from the templates
        ExercisesTemplatesService.getExercisesTemplates(knexInstance)
          .then((allExercises) => {
            //   console.log("all exercises", allExercises)
            let templateOutputExercises = [];
            for (let i = 0; i < allExercises.length; i++) {
              //gives one exercise at a time
              //console.log("one exercise", allExercises[i]);
              //filter all exercises to match the workout selected
              if (type.toLowerCase() == "upper" && allExercises[i].is_upper == 1) {
                //console.log("is upper body", allExercises[i].is_upper);
                if (
                  difficulty.toLowerCase() == "beginner" &&
                  allExercises[i].is_beginner == 1
                ) {
                  //console.log("is Beginner", allExercises[i].is_beginner);
                  templateOutputExercises.push(allExercises[i]);
                } else if (
                  difficulty.toLowerCase() == "intermediate" &&
                  allExercises[i].is_intermediate == 1
                ) {
                  // console.log("is Intermediate", allExercises[i].is_intermediate);
                  templateOutputExercises.push(allExercises[i]);
                } else if (
                  difficulty.toLowerCase() == "advanced" &&
                  allExercises[i].is_advanced == 1
                ) {
                  //console.log("is Advanced", allExercises[i].is_advanced);
                  templateOutputExercises.push(allExercises[i]);
                }
              } else if (
                type.toLowerCase() == "lower" &&
                allExercises[i].is_lower == 1
              ) {
                //console.log("is lower body", allExercises[i].is_lower);
                if (
                  difficulty.toLowerCase() == "beginner" &&
                  allExercises[i].is_beginner == 1
                ) {
                  //console.log("is Beginner", allExercises[i].is_beginner);
                  templateOutputExercises.push(allExercises[i]);
                } else if (
                  difficulty.toLowerCase() == "intermediate" &&
                  allExercises[i].is_intermediate == 1
                ) {
                  // console.log("is Intermediate", allExercises[i].is_intermediate);
                  templateOutputExercises.push(allExercises[i]);
                } else if (
                  difficulty.toLowerCase() == "advanced" &&
                  allExercises[i].is_advanced == 1
                ) {
                  //console.log("is Advanced", allExercises[i].is_advanced);
                  templateOutputExercises.push(allExercises[i]);
                }
              }
            }
            // console.log("All the exercises in the template", templateOutputExercises);
            //map all the template exercises
            for (let j = 0; j < templateOutputExercises.length; j++) {
              //add the workoutID to each one of them
              let oneExercisePayload = {
                // id: templateOutputExercises[j].id,
                workout_id: workouts.id,
                name: templateOutputExercises[j].name,
                image: templateOutputExercises[j].image,
                description: templateOutputExercises[j].description,
                sets: templateOutputExercises[j].sets,
                rest: templateOutputExercises[j].rest,
                is_upper: templateOutputExercises[j].is_upper,
                is_lower: templateOutputExercises[j].is_lower,
                is_beginner: templateOutputExercises[j].is_beginner,
                is_intermediate: templateOutputExercises[j].is_intermediate,
                is_advanced: templateOutputExercises[j].is_advanced,
              };
              // console.log("one exercise payload", oneExercisePayload);
              //save the filtered exercises into the database TO DO
              UserExercisesService.insertExercises(
                req.app.get("db"),
                oneExercisePayload
              )
                .then((exercises) => {
                  console.log("new user exercises inserted = ", exercises);
                  //res.status(201).json(serializeExercises(exercises));
                })
                .catch(next);
            }

            //res.json(exercises.map(serializeExercises))
          })
          .catch(next);

        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${workouts.id}`))
          .json(serializeWorkouts(workouts));
      })
      .catch(next);
  });

//get workouts by user id
workoutsRouter
  .route("/users/:user_id")
  .all((req, res, next) => {
    if (isNaN(parseInt(req.params.user_id))) {
      return res.status(404).json({
        error: { message: `Invalid id` },
      });
    }
    WorkoutsService.getWorkoutsByUserId(req.app.get("db"), req.params.user_id)
      .then((workouts) => {
        if (!workouts) {
          return res.status(404).json({
            error: { message: `Workouts doesn't exist` },
          });
        }
        res.workouts = workouts;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    //first map it, then serialize
    res.json(res.workouts.map(serializeWorkouts));
  });















//get workouts by user id, type, and difficulty
workoutsRouter
  .route("/users/:user_id/:difficulty_name/:type_name")
  .all((req, res, next) => {
    //check for valid user id
    console.log("user id, difficulty, type !!!!!!!!!!!!!!!!", req.params.user_id, req.params.difficulty_name, req.params.type_name)
    if (isNaN(parseInt(req.params.user_id))) {
      return res.status(404).json({
        error: { message: `Invalid id` },
      });
    }
    //check for valid difficulty
    if (!req.params.difficulty_name) {
      return res.status(404).json({
        error: { message: `Invalid difficulty` },
      });
    }
    //check for valid type
    if (!req.params.type_name) {
      return res.status(404).json({
        error: { message: `Invalid type` },
      });
    }
    WorkoutsService.getWorkoutsByUserIdTypeDifficulty(req.app.get("db"), req.params.user_id, req.params.difficulty_name, req.params.type_name)
      .then((workouts) => {
        //if there are no workouts, return an empty array
        if (!workouts) {
          res.workouts = [];
        }
        //if there are workouts, return them
        else {
          res.workouts = workouts;
        }
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(res.workouts);
  });


































//get workouts by workout id
workoutsRouter
  .route("/:workouts_id")
  .all((req, res, next) => {
    if (isNaN(parseInt(req.params.workouts_id))) {
      return res.status(404).json({
        error: { message: `Invalid id` },
      });
    }
    WorkoutsService.getWorkoutsById(req.app.get("db"), req.params.workouts_id)
      .then((workouts) => {
        if (!workouts) {
          return res.status(404).json({
            error: { message: `Workouts doesn't exist` },
          });
        }
        res.workouts = workouts;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    //vaules never used
    res.json(serializeWorkouts(res.workouts));
  })
  .delete((req, res, next) => {
    WorkoutsService.deleteWorkouts(req.app.get("db"), req.params.workouts_id)
      .then((numRowsAffected) => {
        //vaule never used
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { user_id, type, difficulty } = req.body;
    const workoutsToUpdate = { user_id, type, difficulty };

    const numberOfValues = Object.values(workoutsToUpdate).filter(Boolean)
      .length;
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'user_id', 'type', or 'difficulty'`,
        },
      });

    WorkoutsService.updateWorkouts(
      req.app.get("db"),
      req.params.workouts_id,
      workoutsToUpdate
    )
      .then((updatedWorkouts) => {
        res.status(200).json(serializeWorkouts(updatedWorkouts[0]));
      })
      .catch(next);
  });

module.exports = workoutsRouter;
