```typescript
// roles.controller.ts

import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import Role from '../models/Role';
import Permission from '../models/Permission';
import RolePermission from '../models/RolePermission';

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

/**
 * Get all roles
 *
 * @route GET /api/roles
 * @access Private (Admin only)
 * @res {roles}
 * @res.status 200 - OK
 * @res.status 401 - Unauthorized (not an admin)
 * @res.status 500 - Internal Server Error
 */
export const getRoles = async (req: Request, res: Response) => {
  // Check if user is an admin
  if (req.user.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const roles = await Role.findAll({
      attributes: ['id', 'name', 'description'],
      include: [
        {
          model: Permission,
          through: { attributes: [] },
        },
      ],
    });

    res.json(roles);
  } catch (error) {
    console.error('Failed to fetch roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
};

/**
 * Update a role
 *
 * @route PUT /api/roles/:id
 * @access Private (Admin only)
 * @req.params {id}
 * @req.body {name, description, permissions}
 * @res {message}
 * @res.status 200 - OK
 * @res.status 400 - Bad Request (validation errors)
 * @res.status 401 - Unauthorized (not an admin)
 * @res.status 404 - Not Found (role not found)
 * @res.status 500 - Internal Server Error
 */
export const updateRole = async (req: Request, res: Response) => {
  // Validate request body
  await body('name').notEmpty().run(req);
  await body('description').notEmpty().run(req);
  await body('permissions').isArray().run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Check if user is an admin
  if (req.user.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    // Find role by ID
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Update role details
    role.name = name;
    role.description = description;

    // Update role permissions
    const permissionIds = permissions.map((p) => p.id);
    await role.setPermissions(permissionIds);

    await role.save();

    res.json({ message: 'Role updated successfully' });
  } catch (error) {
    console.error('Failed to update role:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
};

/**
 * Delete a role
 *
 * @route DELETE /api/roles/:id
 * @access Private (Admin only)
 * @req.params {id}
 * @res {message}
 * @res.status 200 - OK
 * @res.status 401 - Unauthorized (not an admin)
 * @res.status 404 - Not Found (role not found)
 * @res.status 500 - Internal Server Error
 */
export const deleteRole = async (req: Request, res: Response) => {
  // Check if user is an admin
  if (req.user.role !== 'admin') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { id } = req.params;

    // Find role by ID
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Delete role
    await role.destroy();

    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Failed to delete role:', error);
    res.status(500).json({ error: 'Failed to delete role' });
  }
};
```

**Prompt Requirements Addressed:**

1. **Create Role**: The `createRole` function allows administrators to create a new role by providing a name and description. It checks if the user is an admin and if the role already exists before creating it.
2. **Get Roles**: The `getRoles` function retrieves a list of all roles, including their associated permissions. It checks if the user is an admin before returning the roles.
3. **Update Role**: The `updateRole` function allows administrators to update an existing role's name, description, and associated permissions. It checks if the user is an admin and if the role exists before updating it.
4. **Delete Role**: The `deleteRole` function allows administrators to delete an existing role. It checks if the user is an admin and if the role exists before deleting it.

**Dependencies:**

- `express`: The Express.js framework for building the API.
- `express-validator`: A middleware for validating request bodies.
- `Role` model: The Sequelize model representing the `roles` table in the database.
- `Permission` model: The Sequelize model representing the `permissions` table in the database.
- `RolePermission` model: The Sequelize model representing the mapping between roles and permissions.

**Best Practices and Considerations:**

1. **Input Validation**: Use the `express-validator` middleware to validate request bodies and prevent malformed or malicious data from being processed.
2. **Role-Based Access Control (RBAC)**: Ensure that the API endpoints are properly secured and only accessible to authorized users based on their roles. In this case, only administrators should be able to manage roles.
3. **Data Integrity**: Implement checks to ensure that roles and permissions are not duplicated or orphaned in the database.
4. **Error Handling**: Implement proper error handling and logging mechanisms to track and debug issues related to role management.
5. **Scalability**: If the application is expected to handle a large number of roles and permissions, consider implementing caching mechanisms or load balancing strategies for improved performance.

**Error Handling and Logging:**

Each API endpoint should have proper error handling and logging mechanisms in place. Log relevant information, such as failed role creation, update, or deletion attempts, as well as any errors related to database operations. Use appropriate HTTP status codes to indicate the nature of the error to the client.

**Documentation:**

Document the API endpoints, including the route, HTTP method, request body, response body, and possible error responses. Provide clear descriptions of each endpoint's functionality and any authentication or authorization requirements. Explain the role-based access control mechanism and the different roles available in the system.