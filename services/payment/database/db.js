const { Pool } = require("pg");
const { CREATE_USER_TRANSACTIONS } = require("./queries");

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: 5432,
});

async function createUserTransactionsTable() {
    try {
        await pool.query(CREATE_USER_TRANSACTIONS);
        console.log("✅ User transactions table created successfully");
    } catch (error) {
        console.error("❌ Error creating User transactions table:", error);
        throw error;
    }
}

async function initializeDB(retries = 5, delay = 3000) {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Attempting to initialize database (attempt ${i + 1}/${retries})...`);
            
            await createUserTransactionsTable();
            
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

module.exports = { pool, initializeDB };