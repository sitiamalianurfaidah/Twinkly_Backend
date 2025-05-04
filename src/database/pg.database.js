require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
    connectionString: process.env.PG_CONNECTION_STRING,
    ssl: {
        rejectUnauthorized: false,
    },
    });

    // Test koneksi ringan, tidak force connect
    pool.query("SELECT 1")
    .then(() => console.log("Connected to the database"))
    .catch((err) => console.error("Database connection failed", err));

    const query = async (text, params) => {
    try {
        const res = await pool.query(text, params);
        return res;
    } catch (error) {
        console.error("Error executing query", error);
    }
    };

    module.exports = {
    query,
    pool,
};
