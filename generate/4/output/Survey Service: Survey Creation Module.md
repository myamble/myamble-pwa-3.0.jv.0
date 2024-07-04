```typescript
// surveyService.ts
import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { Survey, Question } from './models';
import { authenticateToken, checkPermission } from './middleware/auth';
import { logger } from './utils/logger';

const router = express.Router();

// Middleware
router.use(express.json());
router.use(authenticateToken);

// Create a new survey
router.post(
  '/',
  [
    body('title').trim().isLength({ min: 1, max: 255 }).escape(),
    body('description').optional().trim().isLength({ max: 1000 }).escape(),
    body('questions').isArray({ min: 1 }),
    body('questions.*.text').trim().isLength({ min: 1, max: 1000 }).escape(),
    body('questions.*.type').isIn(['multiple_choice', 'text', 'rating', 'date']),
    body('questions.*.options').optional().isArray(),
    body('questions.*.required').optional().isBoolean(),
    body('logic').optional().isObject(),
  ],
  checkPermission('CREATE_SURVEY'),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, questions, logic } = req.body;
      const survey = await Survey.create({
        title,
        description,
        creatorId: req.user.id,
        questions: JSON.stringify(questions),
        logic: logic ? JSON.stringify(logic) : null,
      });

      const surveyQuestions = await Promise.all(
        questions.map((question, index) =>
          Question.create({
            surveyId: survey.id,
            type: question.type,
            text: question.text,
            options: question.options ? JSON.stringify(question.options) : null,
            required: question.required || false,
            orderIndex: index,
          })
        )
      );

      logger.info('Survey created', { surveyId: survey.id, userId: req.user.id });
      res.status(201).json({ id: survey.id, questions: surveyQuestions });
    } catch (error) {
      logger.error('Failed to create survey', { error: error.message, userId: req.user.id });
      res.status(500).json({ error: 'Failed to create survey' });
    }
  }
);

// Get a survey by ID
router.get(
  '/:id',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const survey = await Survey.findByPk(id, {
        include: [
          {
            model: Question,
            attributes: ['id', 'type', 'text', 'options', 'required', 'orderIndex'],
          },
        ],
      });

      if (!survey) {
        return res.status(404).json({ error: 'Survey not found' });
      }

      res.json({
        id: survey.id,
        title: survey.title,
        description: survey.description,
        creatorId: survey.creatorId,
        questions: survey.Questions.map((question) => ({
          id: question.id,
          type: question.type,
          text: question.text,
          options: question.options ? JSON.parse(question.options) : null,
          required: question.required,
          orderIndex: question.orderIndex,
        })),
        logic: survey.logic ? JSON.parse(survey.logic) : null,
      });
    } catch (error) {
      logger.error('Failed to fetch survey', { error: error.message, userId: req.user.id });
      res.status(500).json({ error: 'Failed to fetch survey' });
    }
  }
);

// Update a survey
router.put(
  '/:id',
  [
    body('title').optional().trim().isLength({ min: 1, max: 255 }).escape(),
    body('description').optional().trim().isLength({ max: 1000 }).escape(),
    body('questions').optional().isArray({ min: 1 }),
    body('questions.*.text').optional().trim().isLength({ min: 1, max: 1000 }).escape(),
    body('questions.*.type').optional().isIn(['multiple_choice', 'text', 'rating', 'date']),
    body('questions.*.options').optional().isArray(),
    body('questions.*.required').optional().isBoolean(),
    body('logic').optional().isObject(),
  ],
  checkPermission('UPDATE_SURVEY'),
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { title, description, questions, logic } = req.body;

      const survey = await Survey.findByPk(id);
      if (!survey) {
        return res.status(404).json({ error: 'Survey not found' });
      }

      if (title) survey.title = title;
      if (description) survey.description = description;
      if (questions) {
        survey.questions = JSON.stringify(questions);

        // Update or create questions
        await Promise.all(
          questions.map(async (question, index) => {
            const existingQuestion = await Question.findOne({
              where: { surveyId: survey.id, orderIndex: index },
            });

            if (existingQuestion) {
              existingQuestion.type = question.type;
              existingQuestion.text = question.text;
              existingQuestion.options = question.options ? JSON.stringify(question.options) : null;
              existingQuestion.required = question.required || false;
              await existingQuestion.save();
            } else {
              await Question.create({
                surveyId: survey.id,
                type: question.type,
                text: question.text,
                options: question.options ? JSON.stringify(question.options) : null,
                required: question.required || false,
                orderIndex: index,
              });
            }
          })
        );
      }
      if (logic) survey.logic = JSON.stringify(logic);

      await survey.save();

      logger.info('Survey updated', { surveyId: survey.id, userId: req.user.id });
      res.json({ message: 'Survey updated successfully' });
    } catch (error) {
      logger.error('Failed to update survey', { error: error.message, userId: req.user.id });
      res.status(500).json({ error: 'Failed to update survey' });
    }
  }
);

// Delete a survey
router.delete(
  '/:id',
  checkPermission('DELETE_SURVEY'),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const survey = await Survey.findByPk(id);

      if (!survey) {
        return res.status(404).json({ error: 'Survey not found' });
      }

      await survey.destroy();

      logger.info('Survey deleted', { surveyId: survey.id, userId: req.user.id });
      res.json({ message: 'Survey deleted successfully' });
    } catch (error) {
      logger.error('Failed to delete survey', { error: error.message, userId: req.user.id });
      res.status(500).json({ error: 'Failed to delete survey' });
    }
  }
);

export default router;
```

**Prompt:**

Develop functionality for creating new surveys, including question creation and logic setup. This module should handle the following requirements:

1. **Survey Creation**: Allow authenticated users with the appropriate permissions to create new surveys. Each survey should have a title, description, and a set of questions.

2. **Question Types**: Support the following question types:
   - Multiple Choice
   - Text Input
   - Rating Scale
   - Date/Time

3. **Question Options**: For multiple-choice questions, allow the user to specify the available options.

4. **Required Questions**: Allow marking questions as required or optional.

5. **Question Order**: Maintain the order of questions within a survey.

6. **Branching Logic**: Implement a mechanism to define branching logic and conditional rules for displaying or skipping questions based on previous responses.

7. **Input Validation**: Validate and sanitize user input for survey and question data to prevent security vulnerabilities and ensure data integrity.

8. **Error Handling**: Implement proper error handling and logging mechanisms for any failures during survey creation or data persistence.

9. **Documentation**: Document the API endpoints, request/response schemas, and potential error scenarios using a standard like OpenAPI (Swagger).

**Dependencies:**

- PostgreSQL Database Schema: Surveys and Questions
- API Design: Survey Management Endpoints

**Best Practices:**

- Use TypeScript for type safety and better developer experience.
- Follow RESTful API design principles.
- Implement role-based access control (RBAC) for survey creation and management.
- Validate and sanitize user input to prevent security vulnerabilities.
- Implement proper error handling and logging mechanisms.
- Write clean, maintainable, and well-documented code.
- Consider performance and scalability aspects, especially for handling large JSON data.

**Potential Challenges and Considerations:**

- Handling large JSON data efficiently for question options and branching logic.
- Ensuring data consistency between the `surveys` and `questions` tables.
- Implementing efficient querying and filtering mechanisms for surveys and questions.
- Handling survey versioning and revisions.
- Securing sensitive survey data and implementing access controls.
- Optimizing database performance as the number of surveys and responses grows.

**Error Handling and Logging:**

Implement error handling and logging using a library like Winston. Log relevant information such as error messages, request details, and user information for easier debugging and monitoring.

**Documentation:**

Document the API endpoints, request/response schemas, and potential error scenarios using OpenAPI (Swagger) specification. This will make it easier for developers to understand and consume the API.

Please provide a detailed implementation plan, including code snippets where necessary, for the Survey Creation Module adhering to the specified requirements, dependencies, best practices, and considerations.