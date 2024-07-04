Sure, here's a detailed prompt for setting up database replication and sharding for improved performance and fault tolerance in the Social Work Survey Application:

```typescript
// Prompt: Set up database replication and sharding for improved performance and fault tolerance

// Requirements:
// 1. Implement database replication for PostgreSQL and MongoDB to ensure high availability and fault tolerance.
// 2. Set up sharding for the ClickHouse database to distribute data across multiple nodes for improved performance and scalability.
// 3. Configure load balancing and failover mechanisms for the replicated databases.
// 4. Ensure data consistency and integrity across replicated and sharded databases.
// 5. Implement monitoring and alerting mechanisms for the replicated and sharded databases.

// Dependencies:
// - Existing PostgreSQL, ClickHouse, and MongoDB database instances
// - Database administration tools (e.g., pgAdmin, ClickHouse-server, MongoDB Compass)
// - Load balancing and failover tools (e.g., HAProxy, Keepalived)
// - Monitoring and alerting tools (e.g., Prometheus, Grafana)

// Instructions:

// 1. PostgreSQL Replication:
//    a. Set up PostgreSQL streaming replication using the built-in replication features.
//    b. Configure a primary server and one or more standby servers.
//    c. Implement automatic failover mechanisms using tools like Patroni or Repmgr.
//    d. Configure load balancing for read replicas using HAProxy or a similar tool.
//    e. Ensure data consistency and integrity across replicas by monitoring and resolving potential conflicts.

// 2. MongoDB Replication:
//    a. Set up a MongoDB replica set with one primary and multiple secondary nodes.
//    b. Configure automatic failover and election of a new primary in case of node failure.
//    c. Implement read preferences to distribute read operations across secondary nodes.
//    d. Monitor and resolve potential replication conflicts or data inconsistencies.

// 3. ClickHouse Sharding:
//    a. Analyze the data distribution and access patterns to determine an appropriate sharding strategy.
//    b. Set up ClickHouse sharding based on the chosen strategy (e.g., by survey ID, user ID, or geographic region).
//    c. Configure data replication across shard replicas for fault tolerance and high availability.
//    d. Implement load balancing and query routing mechanisms to distribute queries across shards.
//    e. Monitor and optimize shard performance, and adjust the sharding strategy as needed.

// 4. Data Consistency and Integrity:
//    a. Implement mechanisms to ensure data consistency across replicated and sharded databases.
//    b. Develop strategies for handling conflicts, data migrations, and schema changes.
//    c. Implement data validation and integrity checks at various levels (application, database, and infrastructure).
//    d. Develop and test backup and recovery strategies for replicated and sharded databases.

// 5. Monitoring and Alerting:
//    a. Set up monitoring and alerting systems (e.g., Prometheus, Grafana) for replicated and sharded databases.
//    b. Monitor key performance metrics, replication lag, shard distribution, and potential issues.
//    c. Configure alerts for critical events, such as node failures, replication issues, or data inconsistencies.
//    d. Implement logging and auditing mechanisms for database operations and changes.

// 6. Documentation:
//    a. Document the replication and sharding strategies, including the rationale behind the chosen approaches.
//    b. Provide clear guidelines for interacting with replicated and sharded databases, including best practices for querying, updating, and managing data.
//    c. Document the monitoring and alerting mechanisms, as well as the procedures for handling failures and data inconsistencies.
//    d. Maintain up-to-date documentation as the application evolves and the database infrastructure changes.

// Expected Outputs:
// - Replicated PostgreSQL and MongoDB databases with automatic failover and load balancing mechanisms.
// - Sharded ClickHouse database with data replication across shards for fault tolerance and high availability.
// - Monitoring and alerting systems for replicated and sharded databases.
// - Documentation for replication and sharding strategies, data consistency and integrity mechanisms, and monitoring and alerting procedures.

// Considerations:
// - Ensure that the replication and sharding strategies align with the application's performance, scalability, and availability requirements.
// - Balance the trade-offs between read and write performance, data consistency, and operational complexity when implementing replication and sharding.
// - Regularly monitor and adjust the replication and sharding configurations as the application's data and usage patterns evolve.
// - Adhere to security best practices, such as proper access control and data encryption, when implementing replication and sharding.
// - Plan for regular maintenance windows and procedures for database upgrades, schema changes, and data migrations.
```

This prompt covers the key requirements for setting up database replication and sharding in the Social Work Survey Application. It includes instructions for implementing replication for PostgreSQL and MongoDB databases, as well as sharding for the ClickHouse database.

The prompt emphasizes the importance of data consistency and integrity across replicated and sharded databases, as well as the need for monitoring and alerting mechanisms to ensure high availability and fault tolerance.

Additionally, the prompt highlights the importance of documentation, including guidelines for interacting with replicated and sharded databases, as well as procedures for handling failures and data inconsistencies.

By following this prompt, you can set up a robust and scalable database infrastructure that can handle increasing data volumes and traffic while ensuring high availability and fault tolerance for the Social Work Survey Application.