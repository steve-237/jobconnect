import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
export declare class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly messagesService;
    server: Server;
    constructor(messagesService: MessagesService);
    private authenticateSocket;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinRoom(data: {
        applicationId: string;
    }, client: Socket): Promise<void>;
    handleSendMessage(data: {
        applicationId: string;
        content: string;
    }, client: Socket): Promise<void>;
}
