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

const CREATE_USER_TRANSACTIONS = `
    CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR',
        status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed')) NOT NULL,
        reservation_id TEXT,
        stripe_checkout_session_id TEXT,
        stripe_payment_id TEXT,
        slot_id TEXT,
        vehicle_id INTEGER,
        garage_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        error_details JSONB
    );
`;

const FIND_USER_BY_ID = `
    SELECT id, name, email, phone, role, profile_picture FROM users WHERE id = $1
`;

const INSERT_TRANSACTION_QUERY = `
    INSERT INTO transactions (
                user_id, 
                amount, 
                currency, 
                status, 
                reservation_id,
                stripe_checkout_session_id,
                slot_id,
                vehicle_id,
                garage_id
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id
`;

const UPDATE_TRANSACTION = `
                    UPDATE transactions 
                    SET 
                        status = 'completed', 
                        stripe_payment_id = $1,
                        completed_at = CURRENT_TIMESTAMP
                    WHERE stripe_checkout_session_id = $2
                    RETURNING *
                `;

const UPDATE_TRANSACTION_TO_FAILED = `
                    UPDATE transactions 
                    SET 
                        status = 'failed',
                        error_details = $1,
                        completed_at = CURRENT_TIMESTAMP 
                    WHERE stripe_checkout_session_id = $2
                `;

module.exports = { CREATE_USERS_TABLE, CREATE_USER_TRANSACTIONS, FIND_USER_BY_ID, INSERT_TRANSACTION_QUERY, UPDATE_TRANSACTION, UPDATE_TRANSACTION_TO_FAILED };