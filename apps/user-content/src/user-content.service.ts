import { Injectable } from '@nestjs/common';

@Injectable()
export class UserContentService {
  getHello(): string {
    return 'Hello World!';
  }
}
