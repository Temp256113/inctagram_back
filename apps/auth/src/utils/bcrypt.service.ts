import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';

@Injectable()
export class BcryptService {
  async encryptPassword(pass: string): Promise<string> {
    return hash(pass, 10);
  }

  async compareHashAndPassword(data: {
    password: string;
    hash: string;
  }): Promise<boolean> {
    return compare(data.password, data.hash);
  }
}
