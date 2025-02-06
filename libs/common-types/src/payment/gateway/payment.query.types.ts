import { IsDefined } from 'class-validator';

export class PaypalSuccessQuery {
  @IsDefined()
  token: string;

  @IsDefined()
  PayerID: string;
}
