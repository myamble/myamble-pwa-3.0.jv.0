Sure, here's a detailed prompt for developing a comprehensive unit test suite for the User Service modules:

```typescript
// user.service.spec.ts

import request from 'supertest';
import app from '../app';
import { User } from '../models';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('User Service', () => {
  let testUser: User;
  let adminUser: User;

  beforeAll(async () => {
    // Create test users
    testUser = await User.create({
      email: 'test@example.com',
      passwordHash: await bcrypt.hash('password123', 10),
      role: 'participant',
    });

    adminUser = await User.create({
      email: 'admin@example.com',
      passwordHash: await bcrypt.hash('adminpassword', 10),
      role: 'admin',
    });
  });

  afterAll(async () => {
    // Clean up test users
    await User.destroy({ where: {} });
  });

  describe('Registration', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: 'newuser@example.com',
          password: 'newpassword123',
          role: 'social_worker',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('userId');

      // Clean up the new user
      const newUser = await User.findByPk(response.body.userId);
      await newUser?.destroy();
    });

    it('should return 400 for invalid request body', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: 'invalidemail',
          password: 'short',
          role: 'invalid',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should return 409 for existing email', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: 'test@example.com',
          password: 'newpassword123',
          role: 'participant',
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error', 'Email already in use');
    });
  });

  describe('Authentication', () => {
    it('should authenticate a user and return a JWT token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');

      // Verify the JWT token
      const decoded = jwt.verify(response.body.token, process.env.JWT_SECRET!);
      expect(decoded).toHaveProperty('userId', testUser.id);
      expect(decoded).toHaveProperty('role', testUser.role);
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });
  });

  describe('Profile Management', () => {
    let token: string;

    beforeAll(async () => {
      // Generate a JWT token for the test user
      token = jwt.sign({ userId: testUser.id, role: testUser.role }, process.env.JWT_SECRET!, {
        expiresIn: '1h',
      });
    });

    it('should get user profile', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send();

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('email', testUser.email);
      expect(response.body).toHaveProperty('role', testUser.role);
    });

    it('should update user profile', async () => {
      const newEmail = 'updated@example.com';
      const newPassword = 'newpassword123';

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: newEmail,
          password: newPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Profile updated successfully');

      // Verify the updated user
      const updatedUser = await User.findByPk(testUser.id);
      expect(updatedUser?.email).toBe(newEmail);
      expect(await bcrypt.compare(newPassword, updatedUser!.passwordHash)).toBe(true);
    });

    it('should return 401 for unauthorized access', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .send();

      expect(response.status).toBe(401);
    });
  });

  describe('Role Management', () => {
    let adminToken: string;

    beforeAll(async () => {
      // Generate a JWT token for the admin user
      adminToken = jwt.sign({ userId: adminUser.id, role: adminUser.role }, process.env.JWT_SECRET!, {
        expiresIn: '1h',
      });
    });

    it('should create a new role', async () => {
      const response = await request(app)
        .post('/api/roles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Role',
          description: 'This is a test role',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('roleId');

      // Clean up the new role
      const newRole = await Role.findByPk(response.body.roleId);
      await newRole?.destroy();
    });

    it('should return 401 for unauthorized access', async () => {
      const response = await request(app)
        .post('/api/roles')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Role',
          description: 'This is a test role',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Unauthorized');
    });
  });
});
```

**Prompt Requirements Addressed:**

1. **Registration**: Tests the `registerUser` function by checking successful registration, invalid request body, and existing email scenarios.
2. **Authentication**: Tests the `loginUser` function by verifying successful authentication with a valid JWT token and invalid credentials scenarios.
3. **Profile Management**: Tests the `getUserProfile` and `updateUserProfile` functions by verifying successful profile retrieval and update, as well as unauthorized access scenarios.
4. **Role Management**: Tests the `createRole` function by verifying successful role creation for an admin user and unauthorized access scenarios.

**Dependencies:**

- `supertest`: A library for testing HTTP servers.
- `app`: The Express.js application instance.
- `User` model: The Sequelize model representing the `users` table in the database.
- `bcrypt`: A library for hashing and verifying passwords.
- `jsonwebtoken`: A library for generating and verifying JSON Web Tokens.

**Best Practices and Considerations:**

1. **Test Setup and Teardown**: Use `beforeAll` and `afterAll` hooks to set up and tear down test data, such as creating and deleting test users.
2. **Test Isolation**: Ensure that each test case is isolated and does not depend on the state of other test cases.
3. **Test Coverage**: Aim for comprehensive test coverage by testing various scenarios, including successful cases, error cases, and edge cases.
4. **Mocking and Stubbing**: Consider mocking or stubbing external dependencies, such as database connections or third-party services, to improve test reliability and performance.
5. **Descriptive Test Names**: Use descriptive test names that clearly explain the scenario being tested.
6. **Async/Await**: Use `async/await` syntax when dealing with asynchronous operations, such as database queries or API requests.

**Error Handling and Logging:**

Ensure that the User Service modules have proper error handling and logging mechanisms in place. In the test suite, you can assert that the appropriate error responses are returned for different scenarios, such as invalid request bodies, unauthorized access, or database errors.

**Documentation:**

Document the test suite, including the purpose of each test case, the scenarios being tested, and any assumptions or prerequisites. Additionally, document any setup or teardown procedures required for running the tests.

By following this prompt, you can develop a comprehensive unit test suite for the User Service modules, covering registration, authentication, profile management, and role management functionalities. The test suite ensures that the User Service behaves as expected and helps catch regressions early in the development process.