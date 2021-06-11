import { Injectable } from '@nestjs/common';
import { User } from './interfaces/user.interface';

@Injectable()
export class UserService {
  private readonly users: User[] = [];

  createUser(clientId) {
    const user = { id: clientId, name: 'Ponchik' };
    this.users.push(user);
  }

  findAll(): User[] {
    return this.users;
  }
}
