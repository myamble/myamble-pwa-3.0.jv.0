Sure, here's a detailed prompt for developing the authentication module in the User Service:

```typescript
// auth.controller.ts

import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import sendResetPasswordEmail from '../utils/sendResetPasswordEmail';

/**
 * Register a new user
 *
 * @route POST /api/auth/register
 * @access Public
 * @req.body {email, password, role}
 * @res {userId}
 * @res.status 201 - Created
 * @res.status 400 - Bad Request (validation errors)
 * @res.status 409 - Conflict (email already in use)
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
      return res.status(409).json({ error: 'Email already in use' });
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
 * @route POST /api/auth/login
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
 * Initiate password reset process
 *
 * @route POST /api/auth/reset-password
 * @access Public
 * @req.body {email}
 * @res {message}
 * @res.status 200 - OK
 * @res.status 400 - Bad Request (validation errors)
 * @res.status 404 - Not Found (user not found)
 * @res.status 500 - Internal Server Error
 */
export const initiatePasswordReset = async (req: Request, res: Response) => {
  // Validate request body
  await body('email').isEmail().run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generate reset token and expiration
    const resetToken = generateResetToken();
    const resetExpiration = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token and expiration to user record
    user.resetToken = resetToken;
    user.resetExpiration = resetExpiration;
    await user.save();

    // Send reset password email
    await sendResetPasswordEmail(user.email, resetToken);

    res.json({ message: 'Password reset instructions sent to your email' });
  } catch (error) {
    console.error('Failed to initiate password reset:', error);
    res.status(500).json({ error: 'Failed to initiate password reset' });
  }
};

/**
 * Reset user password
 *
 * @route PUT /api/auth/reset-password
 * @access Public
 * @req.body {token, newPassword}
 * @res {message}
 * @res.status 200 - OK
 * @res.status 400 - Bad Request (validation errors)
 * @res.status 401 - Unauthorized (invalid or expired token)
 * @res.status 500 - Internal Server Error
 */
export const resetPassword = async (req: Request, res: Response) => {
  // Validate request body
  await body('token').notEmpty().run(req);
  await body('newPassword').isLength({ min: 8 }).run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { token, newPassword } = req.body;

    // Find user by reset token
    const user = await User.findOne({ where: { resetToken: token } });
    if (!user || user.resetExpiration < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset token/expiration
    user.passwordHash = hashedPassword;
    user.resetToken = null;
    user.resetExpiration = null;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Failed to reset password:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};
```

**Prompt Requirements Addressed:**

1. **User Registration**: The `registerUser` function handles user registration by validating the request body, checking for existing users, hashing the password, and creating a new user in the database.
2. **User Authentication**: The `loginUser` function authenticates users by verifying their email and password, and generates a JSON Web Token (JWT) upon successful authentication.
3. **Password Reset Initiation**: The `initiatePasswordReset` function initiates the password reset process by generating a reset token and expiration, saving them to the user record, and sending a reset password email to the user.
4. **Password Reset**: The `resetPassword` function allows users to reset their password by validating the reset token and expiration, hashing the new password, and updating the user record.

**Dependencies:**

- `express`: The Express.js framework for building the API.
- `express-validator`: A middleware for validating request bodies.
- `bcrypt`: A library for hashing and verifying passwords.
- `jsonwebtoken`: A library for generating and verifying JSON Web Tokens.
- `User` model: The Sequelize model representing the `users` table in the database.
- `sendResetPasswordEmail` utility function: A function to send the reset password email to the user's email address.

**Best Practices and Considerations:**

1. **Input Validation**: Use the `express-validator` middleware to validate request bodies and prevent malformed or malicious data from being processed.
2. **Password Hashing**: Use the `bcrypt` library to securely hash user passwords before storing them in the database.
3. **JWT Authentication**: Implement JSON Web Token (JWT) authentication for stateless user sessions and authorization.
4. **Password Reset Security**: Implement secure password reset mechanisms, including generating and validating reset tokens, setting expiration times, and sending reset instructions via email.
5. **Error Handling**: Implement proper error handling and logging mechanisms to track and debug issues related to user authentication and password reset.
6. **Scalability**: If the application is expected to handle a large number of users, consider implementing caching mechanisms or load balancing strategies for improved performance.

**Error Handling and Logging:**

Each API endpoint should have proper error handling and logging mechanisms in place. Log relevant information, such as failed registration attempts, invalid credentials, and errors during password reset. Use appropriate HTTP status codes to indicate the nature of the error to the client.

**Documentation:**

Document the API endpoints, including the route, HTTP method, request body, response body, and possible error responses. Provide clear descriptions of each endpoint's functionality and any authentication or authorization requirements. Document the password reset flow and the email sending process.