const mysql = require("mysql2");
const credentials = require("./credentials")

// Connect to database
const db = mysql.createConnection({
  host: "localhost",
  user: credentials.user,
  password: credentials.password,
  database: "employees",
});

module.exports = db;
