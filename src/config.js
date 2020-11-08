module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_URL: process.env.DB_URL || 'postgres://bvjlvgwdedtytz:9b8fe9e143ca0c5520af1b090e09ea54755695c1e8bf18b82e72e11a854a5126@ec2-75-101-232-85.compute-1.amazonaws.com:5432/d2t0fvmbq83863',
  JWT_SECRET: process.env.JWT_SECRET || 'dog'
} //what is the rule in which we convert the password into its encrypted form
//encrypt JW token with 'dog' -- encryption key
