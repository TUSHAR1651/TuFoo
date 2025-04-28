const mysql = require("mysql2");
require("dotenv").config();
const fs = require('fs');

// Create the connection to the database
const db = mysql.createConnection({
  host: process.env.DB_HOST, // Make sure the environment variable matches your .env file
  port: process.env.DB_PORT, // Ensure this matches the port in your .env file (19315)
  user: process.env.DB_USER, // Your MySQL username
  password: process.env.DB_PASSWORD, // Your MySQL password
  database: process.env.DB_NAME, // The name of your database
  ssl: {
    ca: fs.readFileSync(process.env.DB_CA_CERT_PATH) // Path to your CA certificate file for SSL
  }
});

// Establish the connection
db.connect((err) => {
  if (err) {
    console.log("Error connecting to the database:", err);
  } else {
    console.log("Connected to the database!");
  }
});

module.exports = db;
