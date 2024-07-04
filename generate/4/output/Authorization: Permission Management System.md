```typescript
// permissions.controller.ts

import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Permission from '../models/Permission';
import Role from '../models/Role';
import RolePermission from '../models/RolePermission';

/**
 * Permission Management Controller
 *
 * This controller handles the management of permissions and their assignment to roles.
 * It provides endpoints for creating, reading, updating, and deleting permissions, as well
 * as assigning and removing permissions from roles.
 *
 * Only users with the 'admin' role are authorized to perform these operations.
 */

/**
 * Create a new permission
 *
 * @route POST /api/permissions
 * @access Private (Admin only)
 * @req.body {name, description}
 * @res {permissionId}
 * @res.status 201 - Created
 * @res.status 400 - Bad Request (validation errors)
 * @res.status 401 - Unauthorized (not an admin)
 * @res.status 500 - Internal Server Error
 */
export const createPermission = async (req: Request, res: Response) => {
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

    // Check if permission already exists
    const existingPermission = await Permission.findOne({ where: { name } });
    if (existingPermission) {
      return res.status(400).json({ error: 'Permission already exists' });
    }

    // Create new permission
    const permission = await Permission.create({ name, description });

    res.status(201).json({ permissionId: permission.id });
  } catch (error) {
    console.error('Failed to create permission:', error);
    res.status(500).json({ error: 'Failed to create permission' });
  }
};

/**
 * Assign a permission to a role
 *
 * @route POST /api/roles/:roleId/permissions
 * @access Private (Admin only)
 * @req.params {roleId}
 * @req.body {permissionId}
 * @res.status 200 - OK
 * @res.status 400 - Bad Request (validation errors)
 * @res.status 401 - Unauthorized (not an admin)
 * @res.status 404 - Not Found (role or permission not found)
 * @res.status 500 - Internal Server Error
 */
export const assignPermissionToRole = async (req: Request, res: Response) => {
  // Validate request body
  await body('permissionId').notEmpty().isUUID().run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Check if user is an admin
  if (req.user.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { roleId } = req.params;
    const { permissionId } = req.body;

    // Check if role and permission exist
    const role = await Role.findByPk(roleId);
    const permission = await Permission.findByPk(permissionId);

    if (!role || !permission) {
      return res.status(404).json({ error: 'Role or permission not found' });
    }

    // Check if the permission is already assigned to the role
    const existingAssignment = await RolePermission.findOne({
      where: { roleId, permissionId },
    });

    if (existingAssignment) {
      return res.status(400).json({ error: 'Permission already assigned to role' });
    }

    // Assign permission to role
    await RolePermission.create({ roleId, permissionId });

    res.status(200).json({ message: 'Permission assigned to role' });
  } catch (error) {
    console.error('Failed to assign permission to role:', error);
    res.status(500).json({ error: 'Failed to assign permission to role' });
  }
};

// ... other CRUD operations for permissions and role-permission assignments
```

**Prompt Requirements Addressed:**

1. **Create Permission**: The `createPermission` function allows administrators to create a new permission by providing a name and description. It checks if the user is an admin and if the permission already exists before creating it.
2. **Assign Permission to Role**: The `assignPermissionToRole` function allows administrators to assign an existing permission to an existing role. It checks if the user is an admin, if the role and permission exist, and if the permission is already assigned to the role before making the assignment.

**Dependencies:**

- `express`: The Express.js framework for building the API.
- `express-validator`: A middleware for validating request bodies and parameters.
- `Permission` model: The Sequelize model representing the `permissions` table in the database.
- `Role` model: The Sequelize model representing the `roles` table in the database.
- `RolePermission` model: The Sequelize model representing the `role_permissions` table in the database, which maps roles to permissions.

**Best Practices and Considerations:**

1. **Input Validation**: Use the `express-validator` middleware to validate request bodies and parameters, and prevent malformed or malicious data from being processed.
2. **Role-Based Access Control (RBAC)**: Ensure that the API endpoints are properly secured and only accessible to authorized users with the 'admin' role.
3. **Data Integrity**: Implement checks to ensure that permissions and role-permission assignments are not duplicated in the database.
4. **Error Handling**: Implement proper error handling and logging mechanisms to track and debug issues related to permission management and role-permission assignments.

**Error Handling and Logging:**

Both the `createPermission` and `assignPermissionToRole` functions include error handling and logging mechanisms. If an error occurs during the respective operations, it logs the error message and returns an appropriate HTTP status code (500 for internal server errors) with an error message to the client.

**Documentation:**

```
/**
 * Create a new permission
 *
 * @route POST /api/permissions
 * @access Private (Admin only)
 * @req.body {name, description}
 * @res {permissionId}
 * @res.status 201 - Created
 * @res.status 400 - Bad Request (validation errors)
 * @res.status 401 - Unauthorized (not an admin)
 * @res.status 500 - Internal Server Error
 */

/**
 * Assign a permission to a role
 *
 * @route POST /api/roles/:roleId/permissions
 * @access Private (Admin only)
 * @req.params {roleId}
 * @req.body {permissionId}
 * @res.status 200 - OK
 * @res.status 400 - Bad Request (validation errors)
 * @res.status 401 - Unauthorized (not an admin)
 * @res.status 404 - Not Found (role or permission not found)
 * @res.status 500 - Internal Server Error
 */
```

The `createPermission` endpoint allows administrators to create a new permission by sending a POST request to `/api/permissions` with a request body containing the `name` and `description` of the permission. If the request is successful, it returns the `permissionId` of the newly created permission with a 201 status code. If there are validation errors in the request body, it returns a 400 status code with the validation errors. If the user is not an admin, it returns a 401 Unauthorized status code. If an internal server error occurs, it returns a 500 status code with an error message.

The `assignPermissionToRole` endpoint allows administrators to assign an existing permission to an existing role by sending a POST request to `/api/roles/:roleId/permissions` with a request body containing the `permissionId`. If the request is successful, it returns a 200 status code with a success message. If there are validation errors in the request body or parameters, it returns a 400 status code with the validation errors. If the user is not an admin, it returns a 401 Unauthorized status code. If the role or permission is not found, it returns a 404 Not Found status code. If an internal server error occurs, it returns a 500 status code with an error message.