const ExercisesService = {
  //get all exercises from database
  getExercisess(db) {
    return db
      .from('exercises')
      .select( '*' )
  },
  //select exercises id and title where id matches the id passed
  getExercisesById(db, exercises_id) {
    return db
      .from('exercises')
      .select("*")
      .where('exercises.id', exercises_id)
      .first()
  },
  //insert new exercises into databse (exercises table)
  insertExercises(db, newExercises) {
    return db
      .insert(newExercises)
      .into('exercises')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  //delete exercises from exercises database where id matches
  deleteExercises(db, exercises_id) {
    return db('exercises')
      .where({'id': exercises_id})
      .delete()
  },
  updateExercises(db, exercises_id, newExercises) {
    //???
    return db('exercises')
      .where({id: exercises_id})
      .update(newExercises, returning=true)
      .returning('*')
  }

}

module.exports = ExercisesService