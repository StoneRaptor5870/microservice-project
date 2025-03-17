const { Pool } = require("pg");

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: 5432,
});

async function initializeDB(retries = 5, delay = 3000) {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Attempting to initialize database (attempt ${i + 1}/${retries})...`);
            
            await pool.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password VARCHAR(100) NOT NULL
                );
            `);
            
            console.log("✅ Database initialized successfully");
            return true;
        } catch (error) {
            console.error(`❌ Database initialization failed (attempt ${i + 1}/${retries}):`, error);
            
            if (i < retries - 1) {
                console.log(`Waiting ${delay}ms before retrying...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.error("❌ All database initialization attempts failed");
                throw error;
            }
        }
    }
    return false;
}

async function createUser(name, email, password) {
    try {
        const insertResult = await pool.query(
            "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *",
            [name, email, password]
        );
        
        return insertResult.rows[0];
    } catch (error) {
        if (error.code === '23505') { // Unique violation error code
            const selectResult = await pool.query(
                "SELECT * FROM users WHERE email = $1",
                [email]
            );
            return selectResult.rows[0];
        }
        throw error;
    }
}

async function findUser(email) {
    try {
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error("Error finding user by email:", error);
        throw error;
    }
}

module.exports = { pool, initializeDB, createUser, findUser };