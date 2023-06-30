import { UseGuards } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { User } from 'src/Users/user.schema';
import { RoomService } from './room.service';

@WebSocketGateway({ namespace: '/v1/api/room' })
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly roomService: RoomService) {}

  @WebSocketServer() server: Server;

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.headers.authorization;
      const roomId = client.handshake.query.roomId;

      if (!token) {
        throw new Error('Token not provided');
      }

      const user: User = await this.roomService.authenticate(token as string);

      // Attach the authenticated user to the socket object
      client.data.user = user;

      console.log('Client connected:', user);

      client.join(roomId);

      // Continue with your WebSocket logic, e.g., emitting events, handling messages, etc.
    } catch ({ error }) {
      // Handle authentication error, e.g., disconnect the socket
      client.emit('authenticationError', { error: error });
      client.disconnect(true);
    }
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): void {
    const user = client.data.user;
    const roomId = client.handshake.query.roomId;

    this.server.to(roomId).emit('message', {
      clientId: user._id,
      ClientName: user.username,
      message: payload,
    });
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }
}
