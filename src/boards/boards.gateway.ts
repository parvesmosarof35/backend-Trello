import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class BoardsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('BoardsGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinBoard')
  handleJoinBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody() boardId: string,
  ) {
    client.join(`board:${boardId}`);
    this.logger.log(`Client ${client.id} joined board:${boardId}`);
    return { status: 'joined', boardId };
  }

  @SubscribeMessage('leaveBoard')
  handleLeaveBoard(
    @ConnectedSocket() client: Socket,
    @MessageBody() boardId: string,
  ) {
    client.leave(`board:${boardId}`);
    this.logger.log(`Client ${client.id} left board:${boardId}`);
    return { status: 'left', boardId };
  }

  /**
   * Broadcast real-time board mutations to all users currently looking at the board
   */
  notifyBoardUpdate(boardId: string, event: string, payload: any) {
    if (this.server) {
      this.server.to(`board:${boardId}`).emit('board:event', {
        event,
        payload,
        timestamp: new Date().toISOString(),
      });
    }
  }
}
