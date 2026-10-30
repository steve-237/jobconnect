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
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      const allowed = [
        process.env.FRONTEND_URL,
        'http://localhost:3000',
        'http://127.0.0.1:3000',
      ].filter(Boolean) as string[];

      const isAllowed = allowed.some((allowedOrigin) =>
        origin === allowedOrigin || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')
      );

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error('Non autorisé par la politique CORS WebSocket'));
      }
    },
    credentials: true,
  },
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  constructor(private readonly messagesService: MessagesService) {}

  sendNotificationToUser(userId: string, notif: any) {
    if (this.server) {
      this.server.to(`user_${userId}`).emit('notification', notif);
    }
  }

  /**
   * Robust authentication for WebSocket.
   * Extracts token from handshake auth, headers, or query params, with or without 'Bearer ' prefix.
   */
  private authenticateSocket(client: Socket): any {
    try {
      let rawToken =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization ||
        client.handshake.query?.token;

      if (!rawToken || typeof rawToken !== 'string') return null;

      if (rawToken.startsWith('Bearer ')) {
        rawToken = rawToken.split(' ')[1];
      }

      const payload: any = jwt.verify(
        rawToken,
        process.env.JWT_SECRET || 'jobconnect_dev_insecure_jwt_secret_min_32_chars',
      );
      const userId = payload.userId || payload.sub || payload.id;
      return { ...payload, userId };
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
    // Auto-join user-specific room for real-time notifications & WebRTC calls
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

  // ─── WebRTC Call Signaling Handlers ───

  @SubscribeMessage('startCall')
  async handleStartCall(
    @MessageBody()
    data: {
      applicationId: string;
      receiverId: string;
      callerName: string;
      offerSdp?: any;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.authenticateSocket(client);
    if (!user) return;

    this.server.to(`user_${data.receiverId}`).emit('incomingCall', {
      applicationId: data.applicationId,
      callerId: user.userId,
      callerName: data.callerName || 'Un utilisateur',
      offerSdp: data.offerSdp,
    });
  }

  @SubscribeMessage('acceptCall')
  async handleAcceptCall(
    @MessageBody()
    data: {
      applicationId: string;
      callerId: string;
      answerSdp?: any;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.authenticateSocket(client);
    if (!user) return;

    this.server.to(`user_${data.callerId}`).emit('callAccepted', {
      applicationId: data.applicationId,
      receiverId: user.userId,
      answerSdp: data.answerSdp,
    });
  }

  @SubscribeMessage('rejectCall')
  async handleRejectCall(
    @MessageBody()
    data: {
      applicationId: string;
      callerId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.authenticateSocket(client);
    if (!user) return;

    this.server.to(`user_${data.callerId}`).emit('callRejected', {
      applicationId: data.applicationId,
      receiverId: user.userId,
    });
  }

  @SubscribeMessage('endCall')
  async handleEndCall(
    @MessageBody()
    data: {
      applicationId: string;
      targetUserId: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.authenticateSocket(client);
    if (!user) return;

    this.server.to(`user_${data.targetUserId}`).emit('callEnded', {
      applicationId: data.applicationId,
      byUserId: user.userId,
    });
  }

  @SubscribeMessage('iceCandidate')
  async handleIceCandidate(
    @MessageBody()
    data: {
      targetUserId: string;
      candidate: any;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const user = this.authenticateSocket(client);
    if (!user) return;

    this.server.to(`user_${data.targetUserId}`).emit('iceCandidate', {
      senderId: user.userId,
      candidate: data.candidate,
    });
  }
}
