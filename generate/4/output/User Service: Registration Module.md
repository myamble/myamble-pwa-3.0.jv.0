Sure, here's a detailed prompt for implementing the user registration module in the User Service:

```typescript
// user.controller.ts

import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import sendVerificationEmail from '../utils/sendVerificationEmail';

/**
 * Register a new user
 *
 * @route POST /api/users/register
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

    // Generate verification token and send verification email
    const verificationToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: '1d',
    });
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({ userId: user.id });
  } catch (error) {
    console.error('Failed to register user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

/**
 * Verify user email
 *
 * @route GET /api/users/verify/:token
 * @access Public
 * @param token - Verification token
 * @res.status 200 - OK (email verified)
 * @res.status 400 - Bad Request (invalid or expired token)
 * @res.status 500 - Internal Server Error
 */
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    // Verify token and extract user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    const userId = (decoded as { userId: string }).userId;

    // Update user's email verification status
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    user.emailVerified = true;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Failed to verify email:', error);
    res.status(500).json({ error: 'Failed to verify email' });
  }
};
```

**Prompt Requirements Addressed:**

1. **User Registration**: The `registerUser` function handles user registration by validating the request body, checking for existing users, hashing the password, and creating a new user in the database.
2. **Email Verification**: After successful registration, a verification token is generated and sent to the user's email address using the `sendVerificationEmail` utility function.
3. **Email Verification Route**: The `verifyEmail` function handles the email verification process by verifying the token, finding the associated user, and updating the user's email verification status.

**Dependencies:**

- `express`: The Express.js framework for building the API.
- `express-validator`: A middleware for validating request bodies.
- `bcrypt`: A library for hashing and verifying passwords.
- `jsonwebtoken`: A library for generating and verifying JSON Web Tokens.
- `User` model: The Sequelize model representing the `users` table in the database.
- `sendVerificationEmail` utility function: A function to send the verification email with the token to the user's email address.

**Best Practices and Considerations:**

1. **Input Validation**: Use the `express-validator` middleware to validate request bodies and prevent malformed or malicious data from being processed.
2. **Password Hashing**: Use the `bcrypt` library to securely hash user passwords before storing them in the database.
3. **Email Verification**: Implement email verification to ensure the validity of user email addresses and prevent abuse.
4. **Token Expiration**: Set an appropriate expiration time for the verification token to prevent stale tokens from being used.
5. **Error Handling**: Implement proper error handling and logging mechanisms to track and debug issues related to user registration and email verification.
6. **Scalability**: If the application is expected to handle a large number of users, consider implementing caching mechanisms or load balancing strategies for improved performance.

**Error Handling and Logging:**

Each API endpoint should have proper error handling and logging mechanisms in place. Log relevant information, such as failed registration attempts, invalid or expired verification tokens, and errors during email verification. Use appropriate HTTP status codes to indicate the nature of the error to the client.

**Documentation:**

Document the API endpoints, including the route, HTTP method, request body, response body, and possible error responses. Provide clear descriptions of each endpoint's functionality and any authentication or authorization requirements. Additionally, document the email verification process, including the expected user experience and any potential issues or troubleshooting steps.