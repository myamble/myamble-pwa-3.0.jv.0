Sure, here's a detailed prompt for designing RESTful API endpoints for user registration, authentication, and profile management:

```typescript
// user.controller.ts

import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';

/**
 * Register a new user
 *
 * @route POST /api/users/register
 * @access Public
 * @req.body {email, password, role}
 * @res {userId}
 * @res.status 201 - Created
 * @res.status 400 - Bad Request (validation errors)
 * @res.status 500 - Internal Server Error
 */
export const registerUser = async (req: Request, res: Response) => {
  // Validate request body
  await body('email').isEmail().run(req);
  await body('password').isLength({ min: 8 }).run(req);
  await body('role').isIn(['admin', 'social_worker', 'participant']).run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({ email, passwordHash: hashedPassword, role });

    res.status(201).json({ userId: user.id });
  } catch (error) {
    console.error('Failed to register user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

/**
 * Authenticate user and generate JWT token
 *
 * @route POST /api/users/login
 * @access Public
 * @req.body {email, password}
 * @res {token}
 * @res.status 200 - OK
 * @res.status 401 - Unauthorized (invalid credentials)
 * @res.status 500 - Internal Server Error
 */
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET!, {
      expiresIn: '1h',
    });

    res.json({ token });
  } catch (error) {
    console.error('Failed to login user:', error);
    res.status(500).json({ error: 'Failed to login user' });
  }
};

/**
 * Get user profile
 *
 * @route GET /api/users/profile
 * @access Private
 * @req.user {userId, role}
 * @res {email, role}
 * @res.status 200 - OK
 * @res.status 401 - Unauthorized (invalid token)
 * @res.status 500 - Internal Server Error
 */
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: ['email', 'role'],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

/**
 * Update user profile
 *
 * @route PUT /api/users/profile
 * @access Private
 * @req.user {userId, role}
 * @req.body {email, password}
 * @res {message}
 * @res.status 200 - OK
 * @res.status 400 - Bad Request (validation errors)
 * @res.status 401 - Unauthorized (invalid token)
 * @res.status 500 - Internal Server Error
 */
export const updateUserProfile = async (req: Request, res: Response) => {
  // Validate request body
  await body('email').isEmail().run(req);
  await body('password').isLength({ min: 8 }).optional().run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Find user by ID
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update email
    user.email = email;

    // Update password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.passwordHash = hashedPassword;
    }

    await user.save();

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Failed to update user profile:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
};
```

**Prompt Requirements Addressed:**

1. **User Registration**: The `registerUser` function handles user registration by validating the request body, checking for existing users, hashing the password, and creating a new user in the database.
2. **User Authentication**: The `loginUser` function authenticates users by verifying their email and password, and generates a JSON Web Token (JWT) upon successful authentication.
3. **Get User Profile**: The `getUserProfile` function retrieves the user's profile information (email and role) based on the authenticated user's ID from the JWT.
4. **Update User Profile**: The `updateUserProfile` function allows authenticated users to update their email and password.

**Dependencies:**

- `express`: The Express.js framework for building the API.
- `express-validator`: A middleware for validating request bodies.
- `bcrypt`: A library for hashing and verifying passwords.
- `jsonwebtoken`: A library for generating and verifying JSON Web Tokens.
- `User` model: The Sequelize model representing the `users` table in the database.

**Best Practices and Considerations:**

1. **Input Validation**: Use the `express-validator` middleware to validate request bodies and prevent malformed or malicious data from being processed.
2. **Password Hashing**: Use the `bcrypt` library to securely hash user passwords before storing them in the database.
3. **JWT Authentication**: Implement JSON Web Token (JWT) authentication for stateless user sessions and authorization.
4. **Error Handling**: Implement proper error handling and logging mechanisms to track and debug issues related to user management and authentication.
5. **Role-Based Access Control (RBAC)**: Ensure that the API endpoints are properly secured and only accessible to authorized users based on their roles.
6. **Scalability**: If the application is expected to handle a large number of users, consider implementing caching mechanisms or load balancing strategies for improved performance.

**Error Handling and Logging:**

Each API endpoint should have proper error handling and logging mechanisms in place. Log relevant information, such as failed registration attempts, invalid credentials, and errors during profile updates. Use appropriate HTTP status codes to indicate the nature of the error to the client.

**Documentation:**

Document the API endpoints, including the route, HTTP method, request body, response body, and possible error responses. Provide clear descriptions of each endpoint's functionality and any authentication or authorization requirements.