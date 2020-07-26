module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_URL: process.env.DB_URL || 'postgresql://postgres@localhost/workout-planner-capstone',
  JWT_SECRET: process.env.JWT_SECRET || 'dog'
} //what is the rule in which we convert the password into its encrypted form
//encrypt JW token with 'dog' -- encryption key
