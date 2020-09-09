const ExercisesTemplatesService = {
  //get all exercises_templates from database
  getExercisesTemplates(db) {
    return db
      .from('exercises_templates')
      .select( '*' )
  },
  //select exercises_templates id and title where id matches the id passed
  getExercisesTemplatesByExerciseId(db, exercisesTemplates_id) {
    return db
      .from('exercises_templates')
      .select("*")
      .where('exercises_templates.id', exercisesTemplates_id)
      .first()
  },
  getExercisesTemplatesByWorkoutId(db, workout_id) {
    return db
      .from('exercises_templates')
      .select("*")
      .where('exercises_templates.workout_id', workout_id)
  },
  //insert new exercises_templates into databse (exercises_templates table)
  insertExercisesTemplates(db, newExercisesTemplates) {
    return db
      .insert(newExercisesTemplates)
      .into('exercises_templates')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  //delete exercises_templates from exercises_templates database where id matches
  deleteExercisesTemplates(db, exercisesTemplates_id) {
    return db('exercises_templates')
      .where({'id': exercisesTemplates_id})
      .delete()
  },
  updateExercisesTemplates(db, exercisesTemplates_id, newExercisesTemplates) {
    //???
    return db('exercises_templates')
      .where({id: exercisesTemplates_id})
      .update(newExercisesTemplates, returning=true)
      .returning('*')
  }

}

module.exports = ExercisesTemplatesService