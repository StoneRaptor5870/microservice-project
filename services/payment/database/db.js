const { Pool } = require("pg");
const { CREATE_USERS_TABLE, CREATE_USER_TRANSACTIONS, FIND_USER_BY_ID, INSERT_TRANSACTION_QUERY, UPDATE_TRANSACTION, UPDATE_TRANSACTION_TO_FAILED } = require("./queries");

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_HOST,
    database: process.env.POSTGRES_DB,
    password: process.env.POSTGRES_PASSWORD,
    port: 5432,
});

async function createUsersTable() {
    try {
        await pool.query(CREATE_USERS_TABLE);
        console.log("✅ Users table created successfully");
    } catch (error) {
        console.error("❌ Error creating Users table:", error);
        throw error;
    }
}

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
            
            await createUsersTable();
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

async function profileInfo(id) {
    try {
        const result = await pool.query(FIND_USER_BY_ID, [id]);
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error("Error fetching the user details:", error);
        throw error;
    }
}

async function insertTransactionQuery(transactionValues) {
    try {
        const result = await pool.query(INSERT_TRANSACTION_QUERY, transactionValues);
        return result.rows.length > 0 ? result.rows[0].id : null;
    } catch (error) {
        console.error("Error inserting trsaction details:", error);
        throw error;
    }
}

async function updateTransaction(paymentIntent, checkoutSessionId) {
    try {
        const result = await pool.query(UPDATE_TRANSACTION, [paymentIntent, checkoutSessionId]);
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error("Error while updating the transaction details:", error);
        throw error;
    }
}

async function updateTransactionToFail(errorDetails, checkoutSessionId) {
    try {
        const result = await pool.query(UPDATE_TRANSACTION_TO_FAILED, [errorDetails, checkoutSessionId]);
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error("Error while updating the transaction details:", error);
        throw error;
    }
}

module.exports = { pool, initializeDB, profileInfo, insertTransactionQuery, updateTransaction, updateTransactionToFail };