require('dotenv').config()
const app = require('./app')
const { PORT, DB_URL } = require('./config')
const knex = require('knex')

//tell knex how to connect to db, using the client (postgres) 
//and the url for the databse
const db = knex({ 
  client: 'pg',
  connection: DB_URL
})

app.set('db', db)

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`)
})








