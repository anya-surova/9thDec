const path = require("path");

require("dotenv").config({
  path: path.join(__dirname, ".env")
});

const { Pool } = require("pg");

const pool = new Pool({
  connectionTimeoutMillis: 5000
});

pool.on("error", (error) => {
  console.error("Unexpected database connection error:", error.message);
});

module.exports = pool;