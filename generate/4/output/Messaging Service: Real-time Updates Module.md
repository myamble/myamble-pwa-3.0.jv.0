```typescript
import { Server } from 'socket.io';
import http from 'http';
import { Message, Notification } from './models';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Replace with your frontend URL
    credentials: true,
  },
});

// Middleware to authenticate Socket.IO connections
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const user = verifyToken(token);
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Handle new client connections
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.id}`);

  // Join a room
  socket.on('join:room', (roomId) => {
    socket.join(roomId);
  });

  // Send a new message
  socket.on('message:send', async (message) => {
    try {
      const savedMessage = await Message.create({
        senderId: socket.user.id,
        receiverId: message.receiverId,
        content: message.content,
        roomId: message.roomId,
      });

      // Emit the new message to the room
      io.to(message.roomId).emit('message:received', savedMessage);

      // Create a notification for the receiver
      await Notification.create({
        userId: message.receiverId,
        type: 'message',
        data: {
          messageId: savedMessage.id,
          senderId: socket.user.id,
          content: savedMessage.content,
        },
      });
    } catch (error) {
      console.error('Failed to save message:', error);
      socket.emit('message:error', { error: 'Failed to send message' });
    }
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.id}`);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

**Considerations:**

1. **Real-time Communication with Socket.IO**:
   - This module uses the `socket.io` library to enable real-time communication between clients and the server.
   - A new instance of `Server` is created, and the `io` object is used to handle Socket.IO events.

2. **Authentication**:
   - The `io.use` middleware is used to authenticate incoming Socket.IO connections.
   - The `verifyToken` function (not shown) is responsible for verifying the authentication token provided by the client.
   - Only authenticated users are allowed to establish a Socket.IO connection.

3. **Joining Rooms**:
   - Clients can join specific rooms using the `join:room` event, which allows for targeted message broadcasting.
   - The `roomId` parameter represents the unique identifier for the chat room or conversation.

4. **Sending Messages**:
   - The `message:send` event is used by clients to send new messages.
   - When a new message is received, it is saved to the database using the `Message` model.
   - The new message is then broadcasted to all clients in the corresponding room using the `message:received` event.
   - A notification is created for the receiver using the `Notification` model.

5. **Error Handling**:
   - If an error occurs while saving the message, the `message:error` event is emitted to the client with an error message.

6. **Logging**:
   - Connection and disconnection events are logged to the console for monitoring purposes.

7. **CORS Configuration**:
   - The Socket.IO server is configured with CORS settings to allow connections from the specified frontend URL.
   - Replace `'http://localhost:3000'` with the appropriate URL for your frontend application.

8. **Security**:
   - Sensitive data, such as message content or notification details, should be encrypted before storing in the database.
   - Access control mechanisms should be implemented to ensure that users can only access messages and notifications intended for them.

9. **Performance**:
   - Consider implementing caching mechanisms for frequently accessed data, such as recent messages or unread notification counts.
   - Regularly monitor and optimize database performance, including indexing strategies and query optimization.

10. **Scalability**:
    - Socket.IO supports horizontal scaling and load balancing, which can be implemented as the application grows.
    - Consider using a dedicated messaging queue or message broker for improved scalability and reliability.

11. **Documentation**:
    - Document the Socket.IO events, their payloads, and any assumptions or constraints related to the real-time communication module.
    - Provide clear guidelines for integrating the real-time messaging functionality with the frontend application.

This prompt provides a detailed implementation of the real-time messaging module using Socket.IO. It covers authentication, joining rooms, sending messages, creating notifications, error handling, and logging. Additionally, it highlights important considerations such as security, performance, scalability, and documentation.