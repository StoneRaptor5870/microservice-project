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

module.exports = { CREATE_USER_TRANSACTIONS };