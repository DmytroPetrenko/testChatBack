import { Injectable } from '@nestjs/common';
import { Message } from './interfaces/message.interface';

@Injectable()
export class MessageService {
  private readonly messages: Message[] = [];

  createMessage(id, text) {
    const msg = {
      id: id,
      name: 'Ponchik',
      text: text,
      time: new Date().toString().slice(15, 24),
    };
    this.messages.push(msg);
  }

  getLast(): Message {
    return this.messages[this.messages.length - 1];
  }
}
