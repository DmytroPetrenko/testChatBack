import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { UserService } from './user.service';
import { MessageService } from './message.service';
import * as fs from 'fs';
import * as path from 'path';

@WebSocketGateway()
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private usersService: UserService,
    private messageService: MessageService,
  ) {}

  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('AppGateway');

  @SubscribeMessage('msgToServer')
  handleMessageToServer(client: Socket, payload: any): void {
    this.messageService.createMessage(
      payload.clientId,
      payload.message,
      payload.clientName,
      payload.room,
    );
    const message = this.messageService.getLast();
    this.server.to(message.room).emit('newMessage', message);
  }

  @SubscribeMessage('generateNewUser')
  handleGenerateNewUser(client: Socket, clientId: String): void {
    this.usersService.createUser(clientId);
    client.emit('setAllUsers', this.usersService.findAll());
  }

  @SubscribeMessage('setUsers')
  handleSetUsers(client: Socket): void {
    client.emit('setAllUsers', this.usersService.findAll());
  }

  @SubscribeMessage('regTypingUser')
  handleRegTypingUser(client: Socket, str: String): void {
    this.server.emit('regTypingUser', str);
  }

  @SubscribeMessage('unregTypingUser')
  handleUnregTypingUser(client: Socket, str: String): void {
    this.server.emit('unregTypingUser', str);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, room: string) {
    client.join(room);
    //client.emit('joinedRoom', room);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(client: Socket, room: string) {
    client.leave(room);
    //client.emit('leftRoom', room);
  }

  afterInit(server: Server) {
    this.logger.log('Init');
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }
}
