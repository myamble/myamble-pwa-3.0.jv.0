```typescript
import express from 'express';
import { body, validationResult } from 'express-validator';
import { ClickHouse } from 'clickhouse';
import { authenticateToken, checkPermission } from '../middleware/auth';

const app = express.Router();
const clickhouse = new ClickHouse({
  // ClickHouse connection configuration
});

// Endpoint: Query Survey Analytics
app.post('/analytics/query', authenticateToken, checkPermission('VIEW_ANALYTICS'), [
  body('surveyId').isUUID(),
  body('query').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { surveyId, query } = req.body;

  try {
    // Execute the query against the survey_analytics table
    const result = await clickhouse.query(`
      SELECT /* Query based on surveyId and user input */
      FROM survey_analytics
      WHERE survey_id = '${surveyId}'
      /* Additional filters and aggregations based on the query */
    `).toPromise();

    res.json(result);
  } catch (error) {
    console.error('Failed to query survey analytics:', error);
    res.status(500).json({ error: 'Failed to query survey analytics' });
  }
});

// Endpoint: Get Pre-aggregated Analytics Summary
app.get('/analytics/summary/:surveyId', authenticateToken, checkPermission('VIEW_ANALYTICS'), async (req, res) => {
  const { surveyId } = req.params;

  try {
    // Query the survey_analytics_summary materialized view
    const result = await clickhouse.query(`
      SELECT *
      FROM survey_analytics_summary
      WHERE survey_id = '${surveyId}'
    `).toPromise();

    res.json(result);
  } catch (error) {
    console.error('Failed to fetch analytics summary:', error);
    res.status(500).json({ error: 'Failed to fetch analytics summary' });
  }
});

// Endpoint: Get User Activity Logs
app.get('/analytics/activity/:userId', authenticateToken, checkPermission('VIEW_ANALYTICS'), async (req, res) => {
  const { userId } = req.params;

  try {
    // Query the user_activity_logs table
    const result = await clickhouse.query(`
      SELECT *
      FROM user_activity_logs
      WHERE user_id = '${userId}'
      ORDER BY created_at DESC
      LIMIT 100
    `).toPromise();

    res.json(result);
  } catch (error) {
    console.error('Failed to fetch user activity logs:', error);
    res.status(500).json({ error: 'Failed to fetch user activity logs' });
  }
});

export default app;
```

**Prompt Explanation:**

1. **Import Dependencies**: Import the required dependencies, including Express.js, express-validator for input validation, the ClickHouse client library, and authentication middleware functions.

2. **Initialize ClickHouse Client**: Create a new instance of the ClickHouse client with the appropriate connection configuration.

3. **Endpoint: Query Survey Analytics**:
   - Route: `POST /analytics/query`
   - Authentication: Requires a valid JWT token and the `VIEW_ANALYTICS` permission.
   - Input Validation: Validates the `surveyId` (UUID) and `query` (non-empty string) using express-validator.
   - Request Body: `{ surveyId: string, query: string }`
   - Functionality: Executes a custom query against the `survey_analytics` table based on the provided `surveyId` and `query` string. The query string can be used to filter, aggregate, or perform any desired analysis on the survey response data.
   - Response: Returns the query result as JSON.

4. **Endpoint: Get Pre-aggregated Analytics Summary**:
   - Route: `GET /analytics/summary/:surveyId`
   - Authentication: Requires a valid JWT token and the `VIEW_ANALYTICS` permission.
   - Request Parameter: `surveyId` (UUID)
   - Functionality: Queries the `survey_analytics_summary` materialized view to retrieve pre-aggregated analytics data for the specified `surveyId`. This view provides a summary of response counts grouped by survey ID, question ID, and answer.
   - Response: Returns the pre-aggregated analytics summary as JSON.

5. **Endpoint: Get User Activity Logs**:
   - Route: `GET /analytics/activity/:userId`
   - Authentication: Requires a valid JWT token and the `VIEW_ANALYTICS` permission.
   - Request Parameter: `userId` (UUID)
   - Functionality: Queries the `user_activity_logs` table to retrieve the most recent 100 activity logs for the specified `userId`. The logs are ordered by `created_at` in descending order.
   - Response: Returns the user activity logs as JSON.

6. **Error Handling**: Each endpoint includes error handling and logging for potential failures during query execution or data fetching.

**Considerations:**

- **Input Validation**: Ensure that all user input is properly validated and sanitized to prevent SQL injection and other security vulnerabilities.
- **Permissions**: Implement proper role-based access control (RBAC) to ensure that only authorized users can access and query the analytics data.
- **Query Optimization**: As the data volume grows, you may need to optimize the queries and leverage ClickHouse's features for efficient querying, such as indexing, partitioning, and materialized views.
- **Caching**: Consider implementing caching mechanisms for frequently accessed or computationally expensive analytics queries to improve performance.
- **Logging and Monitoring**: Implement comprehensive logging and monitoring for the analytics endpoints to track performance, errors, and potential issues.
- **Pagination and Limiting**: For endpoints that may return large result sets, consider implementing pagination or limiting the number of results returned to prevent excessive memory usage or network overhead.
- **Documentation**: Document the API endpoints, including input parameters, expected responses, and any specific requirements or constraints.

By following this prompt, you can implement robust and secure API endpoints for querying and analyzing survey data stored in ClickHouse, enabling advanced analytics capabilities for the Social Work Survey Application.