```yaml
openapi: 3.0.0
info:
  title: Social Work Survey Application API
  version: 1.0.0
  description: API documentation for the Social Work Survey Application

servers:
  - url: https://api.example.com/v1

paths:
  /users/register:
    post:
      summary: Register a new user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RegisterUser'
      responses:
        '201':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '500':
          $ref: '#/components/responses/InternalServerError'

  /users/login:
    post:
      summary: Authenticate user and generate JWT token
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginUser'
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AuthResponse'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '500':
          $ref: '#/components/responses/InternalServerError'

  /users/profile:
    get:
      summary: Get user profile
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserProfile'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '404':
          $ref: '#/components/responses/NotFound'
        '500':
          $ref: '#/components/responses/InternalServerError'
    put:
      summary: Update user profile
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateUser'
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SuccessResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '404':
          $ref: '#/components/responses/NotFound'
        '500':
          $ref: '#/components/responses/InternalServerError'

  /surveys:
    post:
      summary: Create a new survey
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateSurvey'
      responses:
        '201':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SurveyResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'
        '500':
          $ref: '#/components/responses/InternalServerError'

  /surveys/{surveyId}:
    get:
      summary: Get a survey by ID
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: surveyId
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SurveyDetails'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '404':
          $ref: '#/components/responses/NotFound'
        '500':
          $ref: '#/components/responses/InternalServerError'
    put:
      summary: Update a survey
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: surveyId
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/UpdateSurvey'
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SuccessResponse'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'
        '404':
          $ref: '#/components/responses/NotFound'
        '500':
          $ref: '#/components/responses/InternalServerError'
    delete:
      summary: Delete a survey
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: surveyId
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SuccessResponse'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'
        '404':
          $ref: '#/components/responses/NotFound'
        '500':
          $ref: '#/components/responses/InternalServerError'

  /surveys/{surveyId}/responses:
    post:
      summary: Submit a survey response
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: surveyId
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/SurveyResponse'
      responses:
        '201':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ResponseSubmitted'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'
        '500':
          $ref: '#/components/responses/InternalServerError'
    get:
      summary: Get survey responses
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: surveyId
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/SurveyResponse'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'
        '500':
          $ref: '#/components/responses/InternalServerError'

  /analytics/query:
    post:
      summary: Query survey analytics
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AnalyticsQuery'
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AnalyticsResult'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'
        '500':
          $ref: '#/components/responses/InternalServerError'

  /analytics/summary/{surveyId}:
    get:
      summary: Get pre-aggregated analytics summary
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: surveyId
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AnalyticsSummary'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'
        '500':
          $ref: '#/components/responses/InternalServerError'

  /analytics/activity/{userId}:
    get:
      summary: Get user activity logs
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: userId
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/ActivityLog'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '403':
          $ref: '#/components/responses/Forbidden'
        '500':
          $ref: '#/components/responses/InternalServerError'

  /messages:
    post:
      summary: Send a new message
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/NewMessage'
      responses:
        '201':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Message'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '500':
          $ref: '#/components/responses/InternalServerError'

  /messages/{roomId}:
    get:
      summary: Get messages for a room
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: roomId
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Message'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '500':
          $ref: '#/components/responses/InternalServerError'

  /notifications:
    get:
      summary: Get unread notifications for the user
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Notification'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '500':
          $ref: '#/components/responses/InternalServerError'

  /notifications/{notificationId}/read:
    patch:
      summary: Mark a notification as read
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: notificationId
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Notification'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '404':
          $ref: '#/components/responses/NotFound'
        '500':
          $ref: '#/components/responses/InternalServerError'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    RegisterUser:
      type: object
      required:
        - email
        - password
        - role
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          minLength: 8
        role:
          type: string
          enum: [admin, social_worker, participant]

    LoginUser:
      type: object
      required:
        - email
        - password
      properties:
        email:
          type: string
          format: email
        password:
          type: string

    UserResponse:
      type: object
      properties:
        userId:
          type: string
          format: uuid

    AuthResponse:
      type: object
      properties:
        token:
          type: string

    UserProfile:
      type: object
      properties:
        email:
          type: string
          format: email
        role:
          type: string
          enum: [admin, social_worker, participant]

    UpdateUser:
      type: object
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          minLength: 8

    CreateSurvey:
      type: object
      required:
        - title
        - questions
      properties:
        title:
          type: string
        description:
          type: string
        questions:
          type: array
          items:
            $ref: '#/components/schemas/Question'
        logic:
          type: object

    Question:
      type: object
      required:
        - text
        - type
      properties:
        text:
          type: string
        type:
          type: string
          enum: [multiple_choice, text, rating, date]
        options:
          type: array
          items:
            type: string
        required:
          type: boolean

    SurveyResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        questions:
          type: array
          items:
            $ref: '#/components/schemas/QuestionResponse'

    QuestionResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        type:
          type: string
          enum: [multiple_choice, text, rating, date]
        text:
          type: string
        options:
          type: array
          items:
            type: string
        required:
          type: boolean
        orderIndex:
          type: integer

    SurveyDetails:
      type: object
      properties:
        id:
          type: string
          format: uuid
        title:
          type: string
        description:
          type: string
        creatorId:
          type: string
          format: uuid
        questions:
          type: array
          items:
            $ref: '#/components/schemas/QuestionResponse'
        logic:
          type: object

    UpdateSurvey:
      type: object
      properties:
        title:
          type: string
        description:
          type: string
        questions:
          type: array
          items:
            $ref: '#/components/schemas/Question'
        logic:
          type: object

    ResponseSubmitted:
      type: object
      properties:
        id:
          type: string
          format: uuid
        message:
          type: string

    AnalyticsQuery:
      type: object
      required:
        - surveyId
        - query
      properties:
        surveyId:
          type: string
          format: uuid
        query:
          type: string

    AnalyticsResult:
      type: object
      properties:
        data:
          type: array
          items:
            type: object
        visualization:
          type: string
          format: binary

    AnalyticsSummary:
      type: object
      properties:
        surveyId:
          type: string
          format: uuid
        responseCounts:
          type: object
        averageScores:
          type: object
        # ... other summary fields

    ActivityLog:
      type

[CUT OFF DUE TO LENGTH. PLEASE USE THE GENERATOR TO MAKE THIS SPEC]