require('dotenv').config()

const config = {
  "development": {
    "username": process.env.DBUser,
    "password": process.env.DBPassword,
    "database": process.env.DB,
    "host": process.env.DBHost,
    "dialect": "mysql"
  },
  "test": {
    "username": process.env.DBUser,
    "password": process.env.DBPassword,
    "database": process.env.DB,
    "host": process.env.DBHost,
    "dialect": "mysql"
  },
  "production": {
    "use_env_variable": "JAWSDB_URL"
  }
}

module.exports = config