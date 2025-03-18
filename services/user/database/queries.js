const CREATE_USERS_TABLE = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        phone VARCHAR(20) UNIQUE,
        role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'valet', 'admin')),
        profile_picture TEXT,
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

const CREATE_USER_TRANSACTIONS = `
    CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed')) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
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

module.exports = { CREATE_USERS_TABLE, CREATE_VEHICLES_TABLE, CREATE_USER_TRANSACTIONS, CREATE_USER, FIND_USER_BY_EMAIL, UPDATE_ROLE };