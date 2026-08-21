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
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(private readonly messagesService: MessagesService) {}

  /**
   * Basic authentication for WebSocket.
   * Extracts token from handshake headers or auth payload.
   */
  private authenticateSocket(client: Socket): any {
    try {
      const token =
        client.handshake.auth?.token?.split(' ')[1] ||
        client.handshake.headers.authorization?.split(' ')[1];
      if (!token) return null;
      return jwt.verify(token, process.env.JWT_SECRET || 'secretKey');
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
    // Auto-join user-specific room for real-time notifications
    client.join(`user_${user.userId}`);
  }

  handleDisconnect(client: Socket) {
    // Client disconnected
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { applicationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.authenticateSocket(client);
    if (!user) {
      client.emit('chat_error', { message: 'Session non authentifiée' });
      return;
    }

    try {
      // Verify they have access to this room
      await this.messagesService.verifyAccess(data.applicationId, user.userId);

      // Join the socket.io room
      client.join(`chat_${data.applicationId}`);
    } catch (e: any) {
      client.emit('chat_error', { message: e?.message || 'Accès au chat non autorisé' });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: { applicationId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.authenticateSocket(client);
    if (!user) {
      client.emit('chat_error', { message: 'Session non authentifiée' });
      return;
    }

    try {
      // 1. Save to DB (this also verifies access again)
      const savedMessage = await this.messagesService.saveMessage(
        data.applicationId,
        user.userId,
        data.content,
      );

      // 2. Broadcast to application chat room (for active chat modals)
      this.server
        .to(`chat_${data.applicationId}`)
        .emit('newMessage', savedMessage);

      // 3. Emit real-time notification to the receiver's personal user room
      if (savedMessage.receiverId) {
        this.server
          .to(`user_${savedMessage.receiverId}`)
          .emit('notification', {
            id: `notif-${Date.now()}`,
            type: 'NEW_MESSAGE',
            applicationId: data.applicationId,
            jobTitle: savedMessage.jobTitle,
            senderName: `${savedMessage.sender.firstName} ${savedMessage.sender.lastName}`,
            content: savedMessage.content,
            createdAt: savedMessage.createdAt,
          });
      }
    } catch (e: any) {
      client.emit('chat_error', { message: e?.message || 'Échec de l’envoi du message' });
    }
  }
}
