require('dotenv').config();
const { Kafka } = require('kafkajs');
const { SchemaRegistry } = require('@kafkajs/confluent-schema-registry');

// Create Kafka client
const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID,
  brokers: [process.env.KAFKA_BOOTSTRAP_SERVERS],
  ssl: true,
  sasl: {
    mechanism: 'PLAIN',
    username: process.env.KAFKA_SASL_USERNAME,
    password: process.env.KAFKA_SASL_PASSWORD
  }
});

// Create Schema Registry client
const registry = new SchemaRegistry({
  host: process.env.SCHEMA_REGISTRY_URL,
  auth: {
    username: process.env.SCHEMA_REGISTRY_API_KEY,
    password: process.env.SCHEMA_REGISTRY_API_SECRET
  }
});

async function runConsumer() {
  // Create consumer
  const consumer = kafka.consumer({ 
    groupId: 'nodejs-consumer-group' 
  });
  
  try {
    // Connect consumer
    console.log('Connecting consumer...');
    await consumer.connect();
    console.log('Consumer connected');
    
    // Subscribe to topic
    await consumer.subscribe({ 
      topic: process.env.KAFKA_TOPIC, 
      fromBeginning: true 
    });
    console.log(`Subscribed to topic: ${process.env.KAFKA_TOPIC}`);
    
    // Process messages
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          // Decode using Schema Registry
          const decodedValue = await registry.decode(message.value);
          
          console.log(`
            Received message from topic ${topic}, partition ${partition}:
            Key: ${message.key ? message.key.toString() : 'null'}
            Value: ${JSON.stringify(decodedValue)}
            Offset: ${message.offset}
          `);
        } catch (error) {
          console.error('Error processing message:', error);
        }
      }
    });
    
    // Handle graceful shutdown
    const handleShutdown = async () => {
      console.log('Shutting down consumer...');
      await consumer.disconnect();
      process.exit(0);
    };
    
    process.on('SIGINT', handleShutdown);
    process.on('SIGTERM', handleShutdown);
    
  } catch (error) {
    console.error('Error in consumer:', error);
    await consumer.disconnect();
    process.exit(1);
  }
}

// Run the consumer
runConsumer().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});