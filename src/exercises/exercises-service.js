const ExercisesService = {
  getExercisess(db) {
    return db
      .from('exercises')
      .select(
        'exercises.id',
        'exercises.title',
        'exercises.completed',
      )
  },
  getExercisesById(db, exercises_id) {
    return db
      .from('exercises')
      .select(
        'exercises.id',
        'exercises.title',
        'exercises.completed',
      )
      .where('exercises.id', exercises_id)
      .first()
  },
  insertExercises(db, newExercises) {
    return db
      .insert(newExercises)
      .into('exercises')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  deleteExercises(db, exercises_id) {
    return db('exercises')
      .where({'id': exercises_id})
      .delete()
  },
  updateExercises(db, exercises_id, newExercises) {
    return db('exercises')
      .where({id: exercises_id})
      .update(newExercises, returning=true)
      .returning('*')
  }

}

module.exports = ExercisesService