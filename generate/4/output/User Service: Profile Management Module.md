Sure, here's a detailed prompt for the User Service: Profile Management Module:

```typescript
// user.controller.ts

import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import User from '../models/User';

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

1. **Get User Profile**: The `getUserProfile` function retrieves the user's profile information (email and role) based on the authenticated user's ID from the JWT.
2. **Update User Profile**: The `updateUserProfile` function allows authenticated users to update their email and password.

**Dependencies:**

- `express`: The Express.js framework for building the API.
- `express-validator`: A middleware for validating request bodies.
- `bcrypt`: A library for hashing and verifying passwords.
- `User` model: The Sequelize model representing the `users` table in the database.

**Best Practices and Considerations:**

1. **Input Validation**: Use the `express-validator` middleware to validate request bodies and prevent malformed or malicious data from being processed.
2. **Password Hashing**: Use the `bcrypt` library to securely hash user passwords before storing them in the database.
3. **Error Handling**: Implement proper error handling and logging mechanisms to track and debug issues related to user profile management.
4. **Role-Based Access Control (RBAC)**: Ensure that the API endpoints are properly secured and only accessible to authorized users based on their roles.
5. **Scalability**: If the application is expected to handle a large number of users, consider implementing caching mechanisms or load balancing strategies for improved performance.

**Error Handling and Logging:**

Each API endpoint should have proper error handling and logging mechanisms in place. Log relevant information, such as errors during profile retrieval or updates. Use appropriate HTTP status codes to indicate the nature of the error to the client.

**Documentation:**

Document the API endpoints, including the route, HTTP method, request body, response body, and possible error responses. Provide clear descriptions of each endpoint's functionality and any authentication or authorization requirements.

**Example Usage:**

```typescript
// Get user profile
const token = 'valid_jwt_token';
const headers = { Authorization: `Bearer ${token}` };

axios.get('/api/users/profile', { headers })
  .then(response => {
    const { email, role } = response.data;
    console.log(`User email: ${email}, Role: ${role}`);
  })
  .catch(error => {
    console.error('Failed to fetch user profile:', error.response.data);
  });

// Update user profile
const updatedProfile = {
  email: 'newemail@example.com',
  password: 'newpassword123'
};

axios.put('/api/users/profile', updatedProfile, { headers })
  .then(response => {
    console.log(response.data.message);
  })
  .catch(error => {
    console.error('Failed to update user profile:', error.response.data);
  });
```

This prompt covers the implementation of the `getUserProfile` and `updateUserProfile` functions in the User Service, which handle retrieving and updating user profile information, respectively. It includes details on input validation, error handling, logging, and documentation. The prompt also provides an example of how these functions can be used in the client-side code.