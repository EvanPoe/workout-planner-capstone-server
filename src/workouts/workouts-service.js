const WorkoutsService = {
  getWorkoutss(db) {
    return db
      .from('workouts')
      .select( '*' )
  },
  getWorkoutsById(db, workouts_id) {
    return db
      .from('workouts')
      .select(
        'workouts.id',
        'workouts.title',
        'workouts.completed',
      )
      .where('workouts.id', workouts_id)
      .first()
  },
  insertWorkouts(db, newWorkouts) {
    return db
      .insert(newWorkouts)
      .into('workouts')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  deleteWorkouts(db, workouts_id) {
    return db('workouts')
      .where({'id': workouts_id})
      .delete()
  },
  updateWorkouts(db, workouts_id, newWorkouts) {
    return db('workouts')
      .where({id: workouts_id})
      .update(newWorkouts, returning=true)
      .returning('*')
  }

}

module.exports = WorkoutsService