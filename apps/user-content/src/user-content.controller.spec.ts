import { Test, TestingModule } from '@nestjs/testing';
import { UserContentController } from './user-content.controller';
import { UserContentService } from './user-content.service';

describe('UserContentController', () => {
  let userContentController: UserContentController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [UserContentController],
      providers: [UserContentService],
    }).compile();

    userContentController = app.get<UserContentController>(UserContentController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(userContentController.getHello()).toBe('Hello World!');
    });
  });
});
