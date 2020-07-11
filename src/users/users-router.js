const path = require('path')
const express = require('express')
const xss = require('xss')
const UsersService = require('./users-service')

const usersRouter = express.Router()
const jsonParser = express.json()

const serializeUsers = users => ({
  id: users.id,
  email: xss(users.email),
  password: xss(users.password)
})

usersRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    UsersService.getUserss(knexInstance)
      .then(userss => {
        res.json(userss.map(serializeUsers))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { title, completed = false } = req.body
    const newUsers = { title }

    for (const [key, value] of Object.entries(newUsers))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })

    newUsers.completed = completed;  

    UsersService.insertUsers(
      req.app.get('db'),
      newUsers
    )
      .then(users => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${users.id}`))
          .json(serializeUsers(users))
      })
      .catch(next)
  })

usersRouter
  .route('/:users_id')
  .all((req, res, next) => {
    if(isNaN(parseInt(req.params.users_id))) {
      return res.status(404).json({
        error: { message: `Invalid id` }
      })
    }
    UsersService.getUsersById(
      req.app.get('db'),
      req.params.users_id
    )
      .then(users => {
        if (!users) {
          return res.status(404).json({
            error: { message: `Users doesn't exist` }
          })
        }
        res.users = users
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializeUsers(res.users))
  })
  .delete((req, res, next) => {
    UsersService.deleteUsers(
      req.app.get('db'),
      req.params.users_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { title, completed } = req.body
    const usersToUpdate = { title, completed }

    const numberOfValues = Object.values(usersToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must content either 'title' or 'completed'`
        }
      })

    UsersService.updateUsers(
      req.app.get('db'),
      req.params.users_id,
      usersToUpdate
    )
      .then(updatedUsers => {
        res.status(200).json(serializeUsers(updatedUsers[0]))
      })
      .catch(next)
  })

module.exports = usersRouter