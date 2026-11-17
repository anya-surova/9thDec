const path = require("path");

require("dotenv").config({
    path: path.join(__dirname, ".env")
});

const { Pool } = require("pg");

const config = {
    connectionTimeoutMillis: 15000,
    max: 5
};

// Use the hosted database when DATABASE_URL is configured.
// Otherwise, keep using your existing local PG settings.
if (process.env.DATABASE_URL) {
    config.connectionString = process.env.DATABASE_URL;
}

const pool = new Pool(config);

pool.on("error", (error) => {
    console.error("Unexpected database connection error:", error.message);
});

module.exports = pool;