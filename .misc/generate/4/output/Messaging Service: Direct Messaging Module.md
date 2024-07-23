```typescript
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { Message, Notification } from '../models';
import { authenticateToken } from '../middleware/auth';
import { io } from '../socket';
import { encryptData, decryptData } from '../utils/encryption';

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
      const encryptedContent = encryptData(content);
      const message = await Message.create({
        senderId: req.user.id,
        receiverId,
        content: encryptedContent,
        roomId,
      });

      // Emit the new message to the room
      io.to(roomId).emit('message:received', {
        id: message.id,
        senderId: req.user.id,
        receiverId,
        content: encryptedContent,
        roomId,
        createdAt: message.createdAt,
      });

      // Create a notification for the receiver
      await Notification.create({
        userId: receiverId,
        type: 'message',
        data: {
          messageId: message.id,
          senderId: req.user.id,
          content: encryptedContent,
        },
      });

      res.status(201).json({ id: message.id, content: encryptedContent });
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

      const decryptedMessages = messages.map((message) => ({
        id: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        content: decryptData(message.content),
        roomId: message.roomId,
        createdAt: message.createdAt,
      }));

      res.json(decryptedMessages);
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

      const decryptedNotifications = notifications.map((notification) => ({
        id: notification.id,
        userId: notification.userId,
        type: notification.type,
        data: {
          ...notification.data,
          content: decryptData(notification.data.content),
        },
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      }));

      res.json(decryptedNotifications);
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

      res.json({
        id: notification.id,
        userId: notification.userId,
        type: notification.type,
        data: {
          ...notification.data,
          content: decryptData(notification.data.content),
        },
        isRead: notification.isRead,
        createdAt: notification.createdAt,
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  }
);

export default router;
```

**Prompt:**

Develop a module for sending and receiving direct messages between users. Ensure that the message content is encrypted before storing in the database and decrypted before sending to the client. Implement input validation, error handling, and real-time communication using Socket.IO. Follow best practices for security, performance, and documentation.

**Considerations:**

1. **Encryption and Decryption**:
   - Import the `encryptData` and `decryptData` functions from the `../utils/encryption` module.
   - Before storing a new message, encrypt the `content` field using `encryptData`.
   - Before sending messages or notifications to the client, decrypt the `content` field using `decryptData`.

2. **Real-time Communication**:
   - When a new message is created, emit the `message:received` event to the appropriate room using Socket.IO.
   - Send the encrypted message content in the event payload.

3. **Input Validation**:
   - Use the `express-validator` library to validate the request body for the `/messages` endpoint.
   - Ensure that required fields (`receiverId`, `content`, `roomId`) are present and have the correct format (e.g., UUIDs).

4. **Error Handling**:
   - Implement proper error handling and logging for various error scenarios, such as database errors or validation failures.
   - Return appropriate error responses with descriptive error messages.

5. **Security**:
   - Ensure that sensitive data, such as message content or notification details, is encrypted before storing in the database.
   - Implement access control mechanisms to ensure that users can only access messages and notifications intended for them.

6. **Performance**:
   - Consider implementing caching mechanisms for frequently accessed data, such as recent messages or unread notification counts.
   - Regularly monitor and optimize database performance, including indexing strategies and query optimization.

7. **Documentation**:
   - Document the API endpoints, including request and response formats, authentication requirements, and any assumptions or constraints.
   - Provide clear guidelines for interacting with the messaging and notification APIs, including best practices and error handling.

By following this prompt, you will create a secure and efficient module for sending and receiving direct messages between users. The implementation includes encryption and decryption of message content, real-time communication using Socket.IO, input validation, error handling, and considerations for security, performance, and documentation.