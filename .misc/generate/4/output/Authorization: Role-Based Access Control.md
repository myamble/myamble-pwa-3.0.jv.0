```typescript
// roles.controller.ts

import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Role from '../models/Role';
import Permission from '../models/Permission';
import RolePermission from '../models/RolePermission';

/**
 * Role-Based Access Control (RBAC) Controller
 *
 * This controller handles the management of roles and permissions in the application.
 * It provides endpoints for creating, reading, updating, and deleting roles, as well
 * as assigning permissions to roles.
 *
 * Only users with the 'admin' role are authorized to perform these operations.
 */

/**
 * Create a new role
 *
 * @route POST /api/roles
 * @access Private (Admin only)
 * @req.body {name, description}
 * @res {roleId}
 * @res.status 201 - Created
 * @res.status 400 - Bad Request (validation errors)
 * @res.status 401 - Unauthorized (not an admin)
 * @res.status 500 - Internal Server Error
 */
export const createRole = async (req: Request, res: Response) => {
  // Validate request body
  await body('name').notEmpty().run(req);
  await body('description').notEmpty().run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Check if user is an admin
  if (req.user.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { name, description } = req.body;

    // Check if role already exists
    const existingRole = await Role.findOne({ where: { name } });
    if (existingRole) {
      return res.status(400).json({ error: 'Role already exists' });
    }

    // Create new role
    const role = await Role.create({ name, description });

    res.status(201).json({ roleId: role.id });
  } catch (error) {
    console.error('Failed to create role:', error);
    res.status(500).json({ error: 'Failed to create role' });
  }
};

// ... other CRUD operations for roles and permissions
```

**Prompt Requirements Addressed:**

1. **Create Role**: The `createRole` function allows administrators to create a new role by providing a name and description. It checks if the user is an admin and if the role already exists before creating it.

**Dependencies:**

- `express`: The Express.js framework for building the API.
- `express-validator`: A middleware for validating request bodies.
- `Role` model: The Sequelize model representing the `roles` table in the database.

**Best Practices and Considerations:**

1. **Input Validation**: Use the `express-validator` middleware to validate request bodies and prevent malformed or malicious data from being processed.
2. **Role-Based Access Control (RBAC)**: Ensure that the API endpoint is properly secured and only accessible to authorized users with the 'admin' role.
3. **Data Integrity**: Implement a check to ensure that roles are not duplicated in the database.
4. **Error Handling**: Implement proper error handling and logging mechanisms to track and debug issues related to role creation.

**Error Handling and Logging:**

The `createRole` function includes error handling and logging mechanisms. If an error occurs during role creation, it logs the error message and returns an appropriate HTTP status code (500 for internal server errors) with an error message to the client.

**Documentation:**

```
/**
 * Create a new role
 *
 * @route POST /api/roles
 * @access Private (Admin only)
 * @req.body {name, description}
 * @res {roleId}
 * @res.status 201 - Created
 * @res.status 400 - Bad Request (validation errors)
 * @res.status 401 - Unauthorized (not an admin)
 * @res.status 500 - Internal Server Error
 */
```

This endpoint allows administrators to create a new role by sending a POST request to `/api/roles` with a request body containing the `name` and `description` of the role. If the request is successful, it returns the `roleId` of the newly created role with a 201 status code. If there are validation errors in the request body, it returns a 400 status code with the validation errors. If the user is not an admin, it returns a 401 Unauthorized status code. If an internal server error occurs, it returns a 500 status code with an error message.