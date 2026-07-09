import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import * as jwt from 'jsonwebtoken';

@WebSocketGateway({
  cors: {
    origin: '*', // For MVP, allow all. In prod, restrict to frontend URL
  },
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly messagesService: MessagesService) {}

  /**
   * Basic authentication for WebSocket.
   * Extracts token from handshake headers or auth payload.
   */
  private authenticateSocket(client: Socket): any {
    try {
      const token = client.handshake.auth?.token?.split(' ')[1] || client.handshake.headers.authorization?.split(' ')[1];
      if (!token) return null;
      return jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    } catch (e) {
      return null;
    }
  }

  handleConnection(client: Socket) {
    const user = this.authenticateSocket(client);
    if (!user) {
      client.disconnect();
      return;
    }
    // console.log(`Client connected: ${client.id} (User: ${user.userId})`);
  }

  handleDisconnect(client: Socket) {
    // console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { applicationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.authenticateSocket(client);
    if (!user) return;

    try {
      // Verify they have access to this room
      await this.messagesService.verifyAccess(data.applicationId, user.userId);
      
      // Join the socket.io room
      client.join(`chat_${data.applicationId}`);
      // console.log(`User ${user.userId} joined room chat_${data.applicationId}`);
      
      // Optional: notify others in room
      // client.to(`chat_${data.applicationId}`).emit('userJoined', { userId: user.userId });
    } catch (e) {
      client.emit('error', { message: 'Unauthorized or room not found' });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { applicationId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.authenticateSocket(client);
    if (!user) return;

    try {
      // 1. Save to DB (this also verifies access again just in case)
      const savedMessage = await this.messagesService.saveMessage(
        data.applicationId,
        user.userId,
        data.content,
      );

      // 2. Broadcast to everyone in the room (including the sender, so they get the DB-confirmed message with ID and Timestamp)
      this.server.to(`chat_${data.applicationId}`).emit('newMessage', savedMessage);
    } catch (e) {
      client.emit('error', { message: 'Failed to send message' });
    }
  }
}
