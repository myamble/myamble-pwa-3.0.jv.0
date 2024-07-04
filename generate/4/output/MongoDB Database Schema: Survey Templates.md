```typescript
import mongoose from 'mongoose';

const surveyTemplateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  questions: [{
    type: {
      type: String,
      required: true,
      enum: ['multiple_choice', 'text', 'rating', 'date']
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    options: [{
      type: String,
      trim: true,
      maxlength: 255
    }],
    required: {
      type: Boolean,
      default: false
    }
  }],
  logic: [{
    type: {
      type: String,
      required: true,
      enum: ['show_if', 'skip_if']
    },
    condition: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    target: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const SurveyTemplate = mongoose.model('SurveyTemplate', surveyTemplateSchema);

export default SurveyTemplate;
```

**Explanation:**

1. The `surveyTemplateSchema` defines the structure of a survey template document in MongoDB.
2. The `title` field is a required string with a maximum length of 255 characters.
3. The `description` field is an optional string with a maximum length of 1000 characters.
4. The `questions` field is an array of question objects, each containing:
   - `type`: The type of question (multiple choice, text, rating, or date), which is a required string from a predefined set of values.
   - `text`: The question text, which is a required string with a maximum length of 1000 characters.
   - `options`: An array of option strings (for multiple-choice questions) with a maximum length of 255 characters each.
   - `required`: A boolean indicating whether the question is required or optional, defaulting to `false`.
5. The `logic` field is an array of logic objects, each containing:
   - `type`: The type of logic (show or skip), which is a required string from a predefined set of values.
   - `condition`: The condition for the logic, which is a required mixed type (can be an object or a simple value).
   - `target`: The target of the logic (e.g., question IDs), which is a required mixed type.
6. The `createdBy` field is a reference to the `User` model, indicating the user who created the template.
7. The `createdAt` and `updatedAt` fields store the creation and last update timestamps, respectively.

**Considerations:**

1. **Validation**: The schema includes validation rules for field types, required fields, and maximum lengths to ensure data integrity.
2. **Indexing**: Consider adding indexes on frequently queried fields (e.g., `createdBy`) for better performance.
3. **Normalization**: The schema follows a denormalized approach by embedding question and logic details within the survey template document. This design choice trades off some data duplication for improved query performance and simplicity.
4. **Security**: Ensure proper access control and authorization mechanisms when creating, updating, or retrieving survey templates based on the user's role and permissions.
5. **Versioning**: Consider implementing a versioning system for survey templates to track changes and allow for rollbacks if needed.
6. **Internationalization**: If the application needs to support multiple languages, consider adding fields for localized question text and options.

**Dependencies:**

This schema assumes the existence of a `User` model for referencing the user who created the survey template. Additionally, it may depend on the implementation of access control and authorization mechanisms in the application.