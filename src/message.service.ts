import { Injectable } from '@nestjs/common';
import { Message } from './interfaces/message.interface';

@Injectable()
export class MessageService {
  private readonly messages: Message[] = [];

  createMessage(id, text, name, room) {
    const msg = {
      id: id,
      name: name,
      text: text,
      room: room,
      time: new Date().toString().slice(15, 24),
    };
    this.messages.push(msg);
  }

  getLast(): Message {
    return this.messages[this.messages.length - 1];
  }

  isMessageToEchoBot(): boolean {
    return this.getLast().room.includes('echoBot');
  }

  isMessageToReverseBot(): boolean {
    return this.getLast().room.includes('reverseBot');
  }

  isMessageToSpamBot(): boolean {
    return this.getLast().room.includes('spamBot');
  }
}
