```typescript
// users.ts

import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from './database';

interface UserAttributes {
  id: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public passwordHash!: string;
  public role!: string;

  // timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['admin', 'social_worker', 'participant']],
      },
    },
  },
  {
    sequelize,
    modelName: 'User',
    timestamps: true,
  }
);

export default User;
```

```typescript
// roles.ts

import { DataTypes, Model } from 'sequelize';
import sequelize from './database';

class Role extends Model {
  public id!: string;
  public name!: string;
  public description!: string;

  // timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Role.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Role',
    timestamps: true,
  }
);

export default Role;
```

```typescript
// permissions.ts

import { DataTypes, Model } from 'sequelize';
import sequelize from './database';

class Permission extends Model {
  public id!: string;
  public name!: string;
  public description!: string;

  // timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Permission.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Permission',
    timestamps: true,
  }
);

export default Permission;
```

```typescript
// role_permissions.ts

import { DataTypes, Model } from 'sequelize';
import sequelize from './database';

class RolePermission extends Model {
  public roleId!: string;
  public permissionId!: string;
}

RolePermission.init(
  {
    roleId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Roles',
        key: 'id',
      },
    },
    permissionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Permissions',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'RolePermission',
    timestamps: false,
  }
);

export default RolePermission;
```

**Prompt Requirements Addressed:**

1. **User Table**: The `User` model represents the users table, storing user information such as email, password hash, and role.
2. **Role Table**: The `Role` model represents the roles table, storing different roles (e.g., admin, social worker, participant) and their descriptions.
3. **Permission Table**: The `Permission` model represents the permissions table, storing different permissions (e.g., create survey, view analytics) and their descriptions.
4. **Role-Permission Mapping**: The `RolePermission` model represents the mapping between roles and permissions, allowing for role-based access control (RBAC).
5. **Data Integrity**: The schema enforces data integrity constraints, such as unique email addresses for users and valid role values.
6. **Timestamps**: The `User` and `Role` models include timestamps for tracking creation and update times.

**Dependencies:**

This schema design depends on the overall system architecture design, which should define the microservices and their responsibilities. The User Service will likely be responsible for managing the user-related tables, while other services may need to access user and role information for authorization purposes.

**Best Practices and Considerations:**

1. **Indexing**: Consider adding appropriate indexes on frequently queried columns (e.g., `email` in the `User` table) for better performance.
2. **Password Hashing**: Ensure that user passwords are securely hashed (e.g., using bcrypt) before storing them in the database.
3. **Data Validation**: Implement server-side data validation to ensure that only valid data is stored in the database.
4. **Scalability**: If the application is expected to handle a large number of users, consider partitioning or sharding strategies for the `User` table.
5. **Auditing**: Depending on the application's requirements, you may want to add audit trails for tracking changes to user accounts and roles.
6. **Internationalization**: If the application needs to support multiple languages, consider adding fields for storing localized role and permission names.

**Error Handling and Logging:**

Implement proper error handling and logging mechanisms in the User Service to track and debug issues related to user management and authentication. Log relevant information, such as failed login attempts, user creation errors, and permission-related issues.

**Documentation:**

Document the database schema, including table structures, relationships, and constraints. Provide clear descriptions of each table and field, as well as guidelines for working with user accounts, roles, and permissions in the application.