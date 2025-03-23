const CREATE_USERS_TABLE = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        phone VARCHAR(20) UNIQUE,
        role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'valet', 'admin')),
        profile_picture TEXT,
        reset_token TEXT,
        reset_token_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

const CREATE_VEHICLES_TABLE = `
    CREATE TABLE IF NOT EXISTS vehicles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        licence_plate VARCHAR(20) UNIQUE NOT NULL,
        make VARCHAR(50),
        model VARCHAR(50),
        colour VARCHAR(30),
        type VARCHAR(20) NOT NULL DEFAULT 'Sedan' CHECK (type IN ('SUV', 'Sedan', 'Bike', 'EV')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

const CREATE_USER = `
    INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING *
`;

const FIND_USER_BY_EMAIL = `
    SELECT * FROM users WHERE email = $1
`;

const UPDATE_ROLE = `
    UPDATE users SET role = 'admin' WHERE id = $1 RETURNING *
`;

const UPDATE_ROLE_TO_USER = `
    UPDATE users SET role = 'user' WHERE id = $1 RETURNING *
`;

const FIND_USER_BY_ID = `
    SELECT id, name, email, phone, role, profile_picture FROM users WHERE id = $1
`;

const UPDATE_USER_DETAILS = `
    UPDATE users
    SET
       name = COALESCE($1, name),
       phone = COALESCE($2, phone),
       updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING id, name, email, phone, role
`;

const UPDATE_USER_PASSWORD = `
    UPDATE users SET password = $1 WHERE id = $2
`;

const GET_ALL_USERS = `
    SELECT id, name, email, phone, role, profile_picture FROM users
`;

const DELETE_USER_BY_ID = `DELETE FROM users WHERE id = $1`;

const INSERT_VEHICLE_QUERY = `
    INSERT INTO vehicles (user_id, licence_plate, make, model, colour, type)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
`;

const GET_USER_VEHICLES_QUERY = `
    SELECT * FROM vehicles WHERE user_id = $1
`;

const GET_USER_VEHICLE_QUERY = `
    SELECT * FROM vehicles WHERE user_id = $1 AND id = $2
`;

const UPDATE_VEHICLE_QUERY = `
    UPDATE vehicles 
    SET licence_plate = $1, make = $2, model = $3, colour = $4, updated_at = CURRENT_TIMESTAMP
    WHERE id = $5 AND user_id = $6
    RETURNING *
`;

const DELETE_VEHICLE_QUERY = `
    DELETE FROM vehicles 
    WHERE id = $1 AND user_id = $2
`;

module.exports = { DELETE_VEHICLE_QUERY, UPDATE_VEHICLE_QUERY, GET_USER_VEHICLE_QUERY, GET_USER_VEHICLES_QUERY, INSERT_VEHICLE_QUERY, DELETE_USER_BY_ID, GET_ALL_USERS, UPDATE_ROLE_TO_USER, UPDATE_USER_PASSWORD, UPDATE_USER_DETAILS, FIND_USER_BY_ID, CREATE_USERS_TABLE, CREATE_VEHICLES_TABLE, CREATE_USER, FIND_USER_BY_EMAIL, UPDATE_ROLE };