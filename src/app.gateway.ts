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
//import { User } from './interfaces/user.interface';

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
    );
    const message = this.messageService.getLast();
    this.server.emit('newMessage', message);
  }

  @SubscribeMessage('generateNewUser')
  handleGenerateNewUser(client: Socket): void {
    this.usersService.createUser(client.id);
    const user = this.usersService.getLast();
    const self = this;
    const imgSrc = this.usersService.generateImgSrc();
    user.imgSrc = imgSrc;
    self.server.emit('setNewUser', user);

    let readStream = fs.createReadStream(path.resolve(__dirname, imgSrc), {
        encoding: 'binary',
      }),
      chunks = [];

    readStream.on('data', function (chunk) {
      chunks.push(chunk);
      self.server.emit('sendChunk', chunk);
    });
  }

  @SubscribeMessage('getUserImg')
  handleGetUserImg(client: Socket, imgSrc: string): void {
    const self = this;
    let readStream = fs.createReadStream(path.resolve(__dirname, imgSrc), {
        encoding: 'binary',
      }),
      chunks = [];

    readStream.on('data', function (chunk) {
      chunks.push(chunk);
      self.server.emit('sendChunk', chunk);
    });
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
