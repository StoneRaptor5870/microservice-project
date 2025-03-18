const { Pool } = require("pg");
const { CREATE_USERS_TABLE, CREATE_VEHICLES_TABLE, CREATE_USER_TRANSACTIONS, CREATE_USER, FIND_USER_BY_EMAIL, UPDATE_ROLE } = require("./queries");

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

async function createVehicleTable() {
    try {
        await pool.query(CREATE_VEHICLES_TABLE);
        console.log("✅ Vehicles table created successfully");
    } catch (error) {
        console.error("❌ Error creating vehicles table:", error);
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
            await createVehicleTable();
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

async function createUser(name, email, password, phone, role = "user") {
    try {
        const insertResult = await pool.query(
            CREATE_USER,
            [name, email, password, phone, role]
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
            FIND_USER_BY_EMAIL,
            [email]
        );
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error("Error finding user by email:", error);
        throw error;
    }
}

async function promotion(userId) {
    try {
        const result = await pool.query(UPDATE_ROLE, [userId]);

        if (result.rowCount === 0) {
            throw new Error("User not found or already an admin");
        }

        return;
    } catch (error) {
        console.error("Error promoting the user:", error);
        throw error;
    }
}

module.exports = { pool, initializeDB, createUser, findUser, promotion };