const mysql = require("mysql2");
require("dotenv").config();
const fs = require('fs');

// Create the connection to the database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    ca: process.env.DB_CA_CERT.replace(/\\n/g, '\n')  // Read directly from the env variable
  }
});

db.connect((err) => {
  if (err) {
    console.log("Error connecting to the database:", err);
  } else {
    console.log("Connected to the database!");
  }
});

module.exports = db;
