# Kafka Avro Producer/Consumer with Schema Registry

This project demonstrates how to produce and consume Avro-serialized messages using Confluent Kafka and Schema Registry.

## Prerequisites

- Node.js (v14 or higher)
- A Confluent Cloud account
- Access to a Confluent Kafka cluster

## Setup

1. Go to the temreinal under this repos root folder.

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the project root with the following variables:
   ```
   KAFKA_BOOTSTRAP_SERVERS=<your-bootstrap-servers>
   KAFKA_CLIENT_ID=<your-client-id>
   KAFKA_SASL_USERNAME=<your-api-key>
   KAFKA_SASL_PASSWORD=<your-api-secret>
   KAFKA_TOPIC=<your-topic-name>
   SCHEMA_REGISTRY_URL=<your-schema-registry-url>
   SCHEMA_REGISTRY_API_KEY=<your-schema-registry-api-key>
   SCHEMA_REGISTRY_API_SECRET=<your-schema-registry-api-secret>
   ```

## Confluent Cloud Setup

### Create a Kafka Topic

1. Log in to your Confluent Cloud account
2. Navigate to your Kafka cluster
3. Go to the "Topics" section and click "Create Topic"
4. Set the topic name (make sure it matches the `KAFKA_TOPIC` in your `.env` file)
5. Set the number of partitions to 3
6. Set any additional configurations you need
7. Click "Create"

### Register Avro Schema

1. In Confluent Cloud, navigate to "Schema Registry"
2. Select your environment and cluster
3. Click "Create schema"
4. Select the topic you created earlier
5. Choose "AVRO" as the schema type
6. Paste the following schema:
   ```json
   {
     "doc": "Sample schema to help you get started.",
     "fields": [
       {
         "doc": "The int type is a 32-bit signed integer.",
         "name": "my_field1",
         "type": "int"
       },
       {
         "doc": "The double type is a double precision (64-bit) IEEE 754 floating-point number.",
         "name": "my_field2",
         "type": "double"
       },
       {
         "doc": "The string is a unicode character sequence.",
         "name": "my_field3",
         "type": "string"
       }
     ],
     "name": "sampleRecord",
     "namespace": "com.mycorp.mynamespace",
     "type": "record"
   }
   ```
7. Click "Create"

## Running the Application

### Produce Messages

Run the producer to send Avro-serialized messages to the Kafka topic:

```
node producer.js
```

This will:
1. Connect to your Kafka cluster
2. Register the Avro schema with Schema Registry (if not already registered)
3. Produce 5 sample messages to your Kafka topic
4. Disconnect from Kafka

### Consume Messages

Run the consumer to read and decode the Avro-serialized messages:

```
node consumer.js
```

This will:
1. Connect to your Kafka cluster
2. Subscribe to your Kafka topic
3. Read messages from the topic
4. Decode the Avro-serialized messages using Schema Registry
5. Print the decoded messages to the console

## Project Structure

- `producer.js`: Produces Avro-serialized messages to Kafka using Schema Registry
- `consumer.js`: Consumes and decodes messages from Kafka using Schema Registry
- `package.json`: Project dependencies and scripts

## Notes

- This implementation uses only the Schema Registry client to handle Avro serialization
- The Schema Registry ensures schema compatibility and evolution over time
- All messages are properly encoded with the Schema Registry wire format (magic byte + schema ID + Avro data)