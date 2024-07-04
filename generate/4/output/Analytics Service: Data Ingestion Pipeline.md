```typescript
import { ClickHouse } from 'clickhouse';
import { Kafka, logLevel } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';

const clickhouse = new ClickHouse({
  // ClickHouse connection configuration
});

const kafka = new Kafka({
  clientId: 'analytics-data-ingestion',
  brokers: ['kafka-broker:9092'],
  logLevel: logLevel.WARN,
});

const consumer = kafka.consumer({ groupId: 'analytics-data-ingestion-group' });

async function initDataIngestionPipeline() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'survey-responses', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const surveyResponse = JSON.parse(message.value.toString());

      const values = surveyResponse.answers.map((answer) => {
        const timestamp = new Date();
        return [
          surveyResponse.surveyId,
          surveyResponse.participantId,
          answer.questionId,
          answer.value,
          timestamp,
        ];
      });

      try {
        await clickhouse.insert('survey_analytics', values).toPromise();
        console.log(`Ingested survey response ${surveyResponse.id} into analytics database`);
      } catch (error) {
        console.error(`Failed to ingest survey response ${surveyResponse.id}:`, error);
      }
    },
  });
}

initDataIngestionPipeline().catch(console.error);
```

**Prompt Explanation:**

1. **Import Dependencies**: Import the required dependencies, including the ClickHouse client library, Kafka client library, and UUID library.

2. **Initialize ClickHouse Client**: Create a new instance of the ClickHouse client with the appropriate connection configuration.

3. **Initialize Kafka Consumer**: Create a new Kafka consumer instance with the appropriate broker configuration and group ID. The consumer will listen for messages on the `survey-responses` topic.

4. **Data Ingestion Pipeline Function**: Define an `initDataIngestionPipeline` function to set up and run the data ingestion pipeline.

5. **Connect to Kafka**: Connect the Kafka consumer to the broker and subscribe to the `survey-responses` topic. Set `fromBeginning: true` to consume all messages from the beginning of the topic.

6. **Consume Messages**: Use the `consumer.run` method to start consuming messages from the `survey-responses` topic. For each message received, the `eachMessage` callback function is executed.

7. **Parse Survey Response**: Inside the `eachMessage` callback, parse the message value as a JSON object representing the survey response.

8. **Prepare Data for Insertion**: Map the `answers` array from the survey response to an array of values to be inserted into the `survey_analytics` table. Each value includes the `surveyId`, `participantId`, `questionId`, `answer`, and a `timestamp`.

9. **Insert Data into ClickHouse**: Use the `clickhouse.insert` method to insert the prepared values into the `survey_analytics` table. The `toPromise` method is used to handle the asynchronous operation.

10. **Error Handling**: Implement error handling and logging for any failures during data ingestion.

11. **Start the Pipeline**: Call the `initDataIngestionPipeline` function, which will start the data ingestion pipeline and handle any uncaught exceptions.

**Considerations:**

- **Kafka Configuration**: Ensure that the Kafka broker configuration is correct and that the `survey-responses` topic exists and is properly configured.

- **Data Validation**: Consider implementing additional data validation and sanitization to ensure the integrity of the survey response data before ingesting it into ClickHouse.

- **Batching and Bulk Inserts**: To improve performance, you can batch multiple survey responses and perform bulk inserts into ClickHouse instead of inserting one response at a time.

- **Error Handling and Retries**: Implement more robust error handling and retry mechanisms to handle transient failures or network issues during data ingestion.

- **Monitoring and Logging**: Implement comprehensive monitoring and logging for the data ingestion pipeline to track its performance, errors, and potential issues.

- **Scalability and Parallelism**: As the volume of survey responses grows, you may need to scale the data ingestion pipeline by adding more Kafka consumer instances or leveraging ClickHouse's distributed processing capabilities.

- **Data Consistency**: Ensure that the data ingestion pipeline maintains data consistency and handles scenarios such as duplicate survey responses or out-of-order message delivery.

- **Security**: Implement appropriate security measures, such as encryption and access controls, to protect the sensitive survey response data during transit and storage.

By following this prompt, you can set up a robust data ingestion pipeline that efficiently ingests survey response data from a Kafka topic into the ClickHouse analytics database, enabling real-time analytics and reporting capabilities for the Social Work Survey Application.