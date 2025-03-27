const { Kafka, Partitioners } = require("kafkajs");
const { handleSlotRegistered } = require("./kafkaHandlers")

const kafka = new Kafka({
    clientId: "parking-service-client",
    brokers: [process.env.KAFKA_BROKER],
    createPartitioner: Partitioners.LegacyPartitioner
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: process.env.KAFKA_GROUP_PAYMENT});

async function connectKafka(retries = 5, delay = 5000) {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Attempting to connect to Kafka (attempt ${i + 1}/${retries})...`);
            
            await producer.connect();
            console.log("✅ Kafka producer connected");
            
            await consumer.connect();
            console.log("✅ Kafka consumer connected");
            
            return true;
        } catch (error) {
            console.error(`❌ Kafka connection failed (attempt ${i + 1}/${retries}):`, error);
            
            if (i < retries - 1) {
                console.log(`Waiting ${delay}ms before retrying...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                console.error("❌ All Kafka connection attempts failed");
                throw error;
            }
        }
    }
    return false;
}

async function publishMessage(topic, message) {
    try {
        await producer.send({
            topic,
            messages: [{ value: JSON.stringify(message) }],
        });
        console.log(`📩 Message published to ${topic}:`, message);
        return true;
    } catch (error) {
        console.error(`❌ Failed to publish message to ${topic}:`, error);
        return false;
    }
}

async function startKafkaListeners() {
    try {
        console.log("📡 Subscribing to Kafka topics...");

        // Subscribe to multiple topics before starting the consumer
        await consumer.subscribe({ topics: ["SLOT_RESERVED"], fromBeginning: true });

        console.log("✅ Subscribed to topics: SLOT_RESERVED");

        // Start the consumer
        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const parsedMessage = JSON.parse(message.value.toString());
                    console.log(`📩 Received message from ${topic}:`, parsedMessage);

                    if (topic === "SLOT_RESERVED") {
                        await handleSlotRegistered(parsedMessage);
                        console.log(`✅ Subscribed to topic: ${topic}`);
                    }
                } catch (error) {
                    console.error("❌ Error processing message:", error);
                }
            },
        });

    } catch (error) {
        console.error("❌ Error starting Kafka listeners:", error);
    }
}

module.exports = { kafka, producer, consumer, connectKafka, publishMessage, startKafkaListeners };