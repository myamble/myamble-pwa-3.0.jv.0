```typescript
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { Message, Notification } from '../models';
import { authenticateToken } from '../middleware/auth';
import { io } from '../socket';

const router = Router();

// Send a new message
router.post(
  '/messages',
  authenticateToken,
  [
    body('receiverId').isUUID(),
    body('content').notEmpty(),
    body('roomId').isUUID(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { receiverId, content, roomId } = req.body;
      const message = await Message.create({
        senderId: req.user.id,
        receiverId,
        content,
        roomId,
      });

      // Emit the new message to the room
      io.to(roomId).emit('message:received', message);

      // Create a notification for the receiver
      await Notification.create({
        userId: receiverId,
        type: 'message',
        data: {
          messageId: message.id,
          senderId: req.user.id,
          content: message.content,
        },
      });

      res.status(201).json(message);
    } catch (error) {
      console.error('Failed to create message:', error);
      res.status(500).json({ error: 'Failed to create message' });
    }
  }
);

// Get messages for a room
router.get(
  '/messages/:roomId',
  authenticateToken,
  async (req, res) => {
    try {
      const { roomId } = req.params;
      const messages = await Message.find({
        roomId,
        $or: [
          { senderId: req.user.id },
          { receiverId: req.user.id },
        ],
      })
        .sort({ createdAt: -1 })
        .limit(50);

      res.json(messages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  }
);

// Get unread notifications for the user
router.get(
  '/notifications',
  authenticateToken,
  async (req, res) => {
    try {
      const notifications = await Notification.find({
        userId: req.user.id,
        isRead: false,
      })
        .sort({ createdAt: -1 })
        .limit(20);

      res.json(notifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  }
);

// Mark a notification as read
router.patch(
  '/notifications/:id/read',
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const notification = await Notification.findOneAndUpdate(
        {
          _id: id,
          userId: req.user.id,
        },
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      res.json(notification);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  }
);

export default router;
```

**Considerations:**

1. **Authentication and Authorization**:
   - The `authenticateToken` middleware is used to verify the user's authentication token for all routes.
   - Access control mechanisms should be implemented to ensure that users can only access messages and notifications intended for them.

2. **Input Validation**:
   - The `express-validator` library is used to validate the request body for the `/messages` endpoint.
   - Validation rules are defined to ensure that required fields are present and have the correct format (e.g., UUIDs).

3. **Real-time Communication**:
   - The `io` object from the Socket.IO library is used to emit real-time events when a new message is created.
   - The `message:received` event is emitted to the appropriate room, allowing connected clients to receive the new message in real-time.

4. **Notifications**:
   - When a new message is created, a notification is also created for the receiver.
   - The `/notifications` endpoint allows users to retrieve their unread notifications.
   - The `/notifications/:id/read` endpoint allows users to mark a notification as read.

5. **Pagination and Sorting**:
   - The `/messages/:roomId` endpoint retrieves the latest 50 messages for a given room, sorted by creation time in descending order.
   - The `/notifications` endpoint retrieves the latest 20 unread notifications for the user, sorted by creation time in descending order.

6. **Error Handling**:
   - Appropriate error handling and logging mechanisms should be implemented for various error scenarios, such as database errors or validation failures.

7. **Security**:
   - Sensitive data, such as message content or notification details, should be encrypted before storing in the database.
   - Access control mechanisms should be implemented to ensure that users can only access messages and notifications intended for them.

8. **Performance**:
   - Consider implementing caching mechanisms for frequently accessed data, such as recent messages or unread notification counts.
   - Regularly monitor and optimize database performance, including indexing strategies and query optimization.

9. **Documentation**:
   - Document the API endpoints, including request and response formats, authentication requirements, and any assumptions or constraints.
   - Provide clear guidelines for interacting with the messaging and notification APIs, including best practices and error handling.

This prompt provides a detailed implementation of the messaging and notification API endpoints, including real-time communication using Socket.IO, input validation, pagination, sorting, and error handling. It also highlights important considerations such as security, performance, and documentation.