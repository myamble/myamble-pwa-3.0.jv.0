Sure, here's a detailed prompt for implementing integration tests for the Analytics Service:

```typescript
// analyticsService.test.ts
import request from 'supertest';
import app from '../app';
import { Survey, Response } from '../models';
import { ClickHouse } from 'clickhouse';
import { Kafka } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';

describe('Analytics Service', () => {
  let token;
  let testUser;
  let testSurvey;
  let testResponses;
  let clickhouse;
  let kafka;

  beforeAll(async () => {
    // Set up test data
    testUser = await User.create({
      email: 'test@example.com',
      password: 'password123',
      role: 'social_worker',
    });
    const loginResponse = await request(app)
      .post('/api/users/login')
      .send({ email: 'test@example.com', password: 'password123' });
    token = loginResponse.body.token;

    testSurvey = await Survey.create({
      title: 'Test Survey',
      description: 'This is a test survey',
      questions: [
        { type: 'text', text: 'What is your name?' },
        { type: 'multiple_choice', text: 'Choose your favorite color', options: ['Red', 'Blue', 'Green'] },
      ],
      creatorId: testUser.id,
    });

    testResponses = [
      {
        surveyId: testSurvey.id,
        participantId: uuidv4(),
        answers: [
          { questionId: '1', value: 'John Doe' },
          { questionId: '2', value: 'Red' },
        ],
      },
      {
        surveyId: testSurvey.id,
        participantId: uuidv4(),
        answers: [
          { questionId: '1', value: 'Jane Smith' },
          { questionId: '2', value: 'Blue' },
        ],
      },
    ];

    // Set up ClickHouse and Kafka
    clickhouse = new ClickHouse({
      // ClickHouse connection configuration
    });
    kafka = new Kafka({
      clientId: 'analytics-test',
      brokers: ['kafka-broker:9092'],
    });
  });

  afterAll(async () => {
    // Clean up test data
    await Survey.destroy({ where: { id: testSurvey.id } });
    await User.destroy({ where: { id: testUser.id } });
  });

  describe('Data Ingestion', () => {
    it('should ingest survey responses into ClickHouse', async () => {
      const producer = kafka.producer();
      await producer.connect();

      // Publish test survey responses to Kafka
      for (const response of testResponses) {
        await producer.send({
          topic: 'survey-responses',
          messages: [{ value: JSON.stringify(response) }],
        });
      }

      await producer.disconnect();

      // Wait for data ingestion pipeline to process the messages
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // Check if survey responses were ingested into ClickHouse
      const result = await clickhouse.query(`
        SELECT count(*) as total_responses
        FROM survey_analytics
        WHERE survey_id = '${testSurvey.id}'
      `).toPromise();

      expect(result[0].total_responses).toBe(testResponses.length);
    });
  });

  describe('Analytics Endpoints', () => {
    it('should return basic survey statistics', async () => {
      const response = await request(app)
        .get(`/api/analytics/statistics/${testSurvey.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalResponses', testResponses.length);
      expect(response.body.responsesByQuestion).toHaveLength(testSurvey.questions.length);
    });

    it('should execute custom analytics queries', async () => {
      const response = await request(app)
        .post('/api/analytics/query')
        .set('Authorization', `Bearer ${token}`)
        .send({
          surveyId: testSurvey.id,
          query: 'Count responses by favorite color',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(testSurvey.questions[1].options.length);
    });
  });

  describe('Advanced Analytics', () => {
    it('should perform trend analysis', async () => {
      const response = await request(app)
        .post('/api/analytics/trends')
        .set('Authorization', `Bearer ${token}`)
        .send({
          surveyId: testSurvey.id,
          questionIds: [testSurvey.questions[1].id],
          timeRange: {
            start: '2023-01-01',
            end: '2023-12-31',
          },
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('trends');
    });

    it('should perform predictive modeling', async () => {
      const response = await request(app)
        .post('/api/analytics/predict')
        .set('Authorization', `Bearer ${token}`)
        .send({
          surveyId: testSurvey.id,
          targetVariable: 'favoriteColor',
          features: ['name'],
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('predictions');
    });
  });

  describe('Visualization Generation', () => {
    it('should generate data visualizations', async () => {
      const response = await request(app)
        .post('/api/analytics/visualizations')
        .set('Authorization', `Bearer ${token}`)
        .send({
          surveyId: testSurvey.id,
          query: 'Count responses by favorite color',
          visualizationType: 'pie',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('imageData');
    });
  });

  describe('Report Generation', () => {
    it('should generate survey reports', async () => {
      const response = await request(app)
        .post('/api/analytics/reports')
        .set('Authorization', `Bearer ${token}`)
        .send({
          surveyId: testSurvey.id,
          reportConfig: {
            sections: ['summary', 'charts'],
            chartTypes: ['pie', 'bar'],
          },
        });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('application/pdf');
    });
  });
});
```

**Prompt Explanation:**

1. **Import Dependencies**: Import the required dependencies, including `supertest` for making HTTP requests, the Express app, database models, ClickHouse client, Kafka client, and UUID library.

2. **Test Suite Setup**: Define a `describe` block for the Analytics Service integration tests.

3. **Before and After Hooks**: Implement `beforeAll` and `afterAll` hooks to set up and tear down test data, including creating a test user, test survey, and test survey responses. Also, initialize ClickHouse and Kafka clients for testing.

4. **Data Ingestion Tests**: Test the data ingestion pipeline by publishing test survey responses to the Kafka topic and verifying that the data is ingested into ClickHouse correctly.

5. **Analytics Endpoints Tests**:
   - Test the `/api/analytics/statistics/:surveyId` endpoint to ensure it returns the correct basic survey statistics.
   - Test the `/api/analytics/query` endpoint by executing a custom analytics query and verifying the response.

6. **Advanced Analytics Tests**:
   - Test the `/api/analytics/trends` endpoint by performing trend analysis on a specific question and time range.
   - Test the `/api/analytics/predict` endpoint by performing predictive modeling with a target variable and features.

7. **Visualization Generation Tests**: Test the `/api/analytics/visualizations` endpoint by generating a data visualization (e.g., pie chart) and verifying the response.

8. **Report Generation Tests**: Test the `/api/analytics/reports` endpoint by generating a survey report with a specific configuration and verifying the response headers.

9. **Test Execution**: Run the tests using the Jest testing framework.

**Considerations:**

- **Test Data Setup**: Ensure that the test data setup is consistent and reliable across all tests. Consider using database transactions or separate test databases to maintain data integrity.

- **Asynchronous Operations**: Account for asynchronous operations, such as data ingestion and processing, by introducing appropriate delays or polling mechanisms to ensure the tests are not flaky.

- **Test Isolation**: Implement proper test isolation to prevent test cases from interfering with each other. Clean up test data after each test or use separate test databases.

- **Mocking and Stubbing**: Consider mocking or stubbing external dependencies, such as Kafka or ClickHouse, to improve test performance and reliability.

- **Test Coverage**: Aim for comprehensive test coverage by testing various scenarios, edge cases, and error conditions.

- **Test Organization**: Organize tests into logical groups or describe blocks based on the functionality being tested (e.g., data ingestion, analytics endpoints, advanced analytics, visualization generation, report generation).

- **Test Parallelization**: Explore options for running tests in parallel to improve overall test execution time.

- **Continuous Integration (CI)**: Integrate the tests into your CI pipeline to ensure that they are run automatically on every code change.

By following this prompt, you can implement comprehensive integration tests for the Analytics Service, covering data ingestion, basic analytics queries, advanced analytics capabilities (trend analysis, predictive modeling), visualization generation, and report generation. These tests will help ensure the correctness and reliability of the Analytics Service and facilitate easier maintenance and refactoring in the future.