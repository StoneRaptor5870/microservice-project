// Kafka message handlers
async function handleUserRegistered(message) {
    console.log(`New user registered: ${message.name} (ID: ${message.id})`);
    // business logic for new user
}

module.exports = { handleUserRegistered };