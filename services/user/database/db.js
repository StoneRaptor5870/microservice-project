const { Pool } = require("pg");
const { DELETE_VEHICLE_QUERY, UPDATE_VEHICLE_QUERY, GET_USER_VEHICLE_QUERY, GET_USER_VEHICLES_QUERY, INSERT_VEHICLE_QUERY, DELETE_USER_BY_ID, GET_ALL_USERS, UPDATE_ROLE_TO_USER, UPDATE_USER_PASSWORD, UPDATE_USER_DETAILS, CREATE_USERS_TABLE, FIND_USER_BY_ID, CREATE_VEHICLES_TABLE, CREATE_USER, FIND_USER_BY_EMAIL, UPDATE_ROLE } = require("./queries");

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

async function initializeDB(retries = 5, delay = 3000) {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Attempting to initialize database (attempt ${i + 1}/${retries})...`);
            
            await createUsersTable();
            await createVehicleTable();
            
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

async function profileInfo(id) {
    try {
        const result = await pool.query(FIND_USER_BY_ID, [id]);
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error("Error fetching the user details:", error);
        throw error;
    }
}

async function updateUserDetails(name, phone, id) {
    try {
        const result = await pool.query(UPDATE_USER_DETAILS, [name, phone, id]);
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error("Error updating the user details:", error);
        throw error;
    }
}

async function updatePassword(hashedPassword, userId) {
    try {
        const result = await pool.query(UPDATE_USER_PASSWORD, [hashedPassword, userId]);
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error("Error updating the user password:", error);
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

async function demotion(userId) {
    try {
        const result = await pool.query(UPDATE_ROLE_TO_USER, [userId]);

        if (result.rowCount === 0) {
            throw new Error("User not found or already an user");
        }

        return;
    } catch (error) {
        console.error("Error promoting the user:", error);
        throw error;
    }
}

async function fetchAllUsers() {
    try {
        const result = await pool.query(GET_ALL_USERS);
        return result.rows.length > 0 ? result.rows : null;
    } catch (error) {
        console.error("Error fetching all the users:", error);
        throw error;
    }
}

async function deleteUserById(id) {
    try {
        const result = await pool.query(DELETE_USER_BY_ID, [id]);
        return result.rowCount > 0 ? true : false;
    } catch (error) {
        console.error("Error deleting the users:", error);
        throw error;
    }
}

async function addUserVehicle(userId, licencePlate, make, model, colour, type) {
    try {
        const result = await pool.query(INSERT_VEHICLE_QUERY, [
            userId, licencePlate, make, model, colour, type
        ]);
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error("Error adding the vehicle details:", error);
        throw error;
    }
}

async function userVehicles(userId) {
    try {
        const result = await pool.query(GET_USER_VEHICLES_QUERY, [userId]);
        return result.rows.length > 0 ? result.rows : null;
    } catch (error) {
        console.error("Error getting the vehicle details:", error);
        throw error;
    }
}

async function userVehicle(userId, vehicleId) {
    try {
        const result = await pool.query(GET_USER_VEHICLE_QUERY, [userId, vehicleId]);
        return result.rows.length > 0 ? result.rows : null;
    } catch (error) {
        console.error("Error getting the vehicle details:", error);
        throw error;
    }
}

async function updateUserVehicle(licencePlate, make, model, colour, vehicleId, userId) {
    try {
        const result = await pool.query(UPDATE_VEHICLE_QUERY, [
            licencePlate, make, model, colour, vehicleId, userId
        ]);
        return result.rows.length > 0 ? result.rows[0] : null;
    } catch (error) {
        console.error("Error updating the vehicle details:", error);
        throw error;
    }
}

async function removeUserVehicle(vehicleId, userId) {
    try {
        const result = await pool.query(DELETE_VEHICLE_QUERY, [vehicleId, userId]);
        return result.rowCount > 0 ? true : false;
    } catch (error) {
        console.error("Error deleting the vehicle details:", error);
        throw error;
    }
}

module.exports = { pool, removeUserVehicle, updateUserVehicle, userVehicle, userVehicles, addUserVehicle, deleteUserById, fetchAllUsers, demotion, updatePassword, updateUserDetails, initializeDB, createUser, findUser, promotion, profileInfo };