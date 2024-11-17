import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserRepository } from '@libs/repositories/repos/user.repository';

@Injectable()
export class PaymentService {
  constructor(private readonly userRepository: UserRepository) {}

  //проверяет оплачен ли аккаунт и по истечении подписки меняет "Business" на "Personal"
  @Cron(CronExpression.EVERY_SECOND) //every second
  async checkoutUserAccountType(): Promise<void> {
    await this.userRepository.checkUserAccountType();
  }
}
