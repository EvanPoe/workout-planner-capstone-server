const UsersService = {
  getUserss(db) {
    return db
      .from('users')
      .select(
        'users.id',
        'users.title',
        'users.completed',
      )
  },
  getUsersById(db, users_id) {
    return db
      .from('users')
      .select(
        'users.id',
        'users.title',
        'users.completed',
      )
      .where('users.id', users_id)
      .first()
  },
  insertUsers(db, newUsers) {
    return db
      .insert(newUsers)
      .into('users')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  deleteUsers(db, users_id) {
    return db('users')
      .where({'id': users_id})
      .delete()
  },
  updateUsers(db, users_id, newUsers) {
    return db('users')
      .where({id: users_id})
      .update(newUsers, returning=true)
      .returning('*')
  }

}

module.exports = UsersService