import { Controller, Get } from '@nestjs/common';
import { UserContentService } from './user-content.service';

@Controller()
export class UserContentController {
  constructor(private readonly userContentService: UserContentService) {}

  @Get()
  getHello(): string {
    return this.userContentService.getHello();
  }
}
