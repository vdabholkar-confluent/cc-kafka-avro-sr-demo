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

// Define the Avro schema
const sampleSchema = {
  "type": "record",
  "namespace": "com.mycorp.mynamespace",
  "name": "sampleRecord",
  "doc": "Sample schema to help you get started.",
  "fields": [
    {
      "name": "my_field1",
      "type": "int",
      "doc": "The int type is a 32-bit signed integer."
    },
    {
      "name": "my_field2",
      "type": "double",
      "doc": "The double type is a double precision (64-bit) IEEE 754 floating-point number."
    },
    {
      "name": "my_field3",
      "type": "string",
      "doc": "The string is a unicode character sequence."
    }
  ]
};

// Sample data to produce
const sampleData = [
  { my_field1: 11111, my_field2: 3.14159, my_field3: 'Hello, World!' },
  { my_field1: 100, my_field2: 2.71828, my_field3: 'Sample text' },
  { my_field1: 255, my_field2: 1.61803, my_field3: 'Avro rocks!' },
  { my_field1: 500, my_field2: 1.41421, my_field3: 'Kafka streaming' },
  { my_field1: 999, my_field2: 2.50000, my_field3: 'Confluent Cloud' }
];

async function runProducer() {
  // Create producer
  const producer = kafka.producer();
  
  try {
    // Connect producer
    console.log('Connecting producer...');
    await producer.connect();
    console.log('Producer connected');
    
    // Register schema
    console.log('Registering schema...');
    const { id } = await registry.register({
      type: 'AVRO',
      schema: JSON.stringify(sampleSchema)
    });
    console.log(`Schema registered with id: ${id}`);
    
    // Produce messages
    console.log(`Producing messages to topic: ${process.env.KAFKA_TOPIC}`);
    
    for (let i = 0; i < sampleData.length; i++) {
      const record = sampleData[i];
      const key = `record-${i}`;
      
      // Encode with Schema Registry
      const encodedValue = await registry.encode(id, record);
      
      // Send to Kafka
      await producer.send({
        topic: process.env.KAFKA_TOPIC,
        messages: [{ 
          key, 
          value: encodedValue
        }]
      });
      
      console.log(`Message sent: ${key} => ${JSON.stringify(record)}`);
    }
    
    console.log('All messages sent successfully');
  } catch (error) {
    console.error('Error in producer:', error);
  } finally {
    // Disconnect producer
    await producer.disconnect();
    console.log('Producer disconnected');
  }
}

// Run the producer
runProducer().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});