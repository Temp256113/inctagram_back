import { Injectable } from '@nestjs/common';
import axios, { Axios } from 'axios';
import * as PaymentContentMicroserviceTypes from '@libs/common-types/payment/microservice';

@Injectable()
export class PaypalAdapter {
  //   private axios;
  constructor() {
    // const result = axios({
    //   url: process.env.PAYPAL_BASE_URL + '/v1/oauth2/token',
    //   method: 'post',
    //   data: 'grant_type=client_credentials',
    //   auth: {
    //     username: process.env.PAYPAL_CLIENT_ID,
    //     password: process.env.PAYPAL_SECRET,
    //   },
    // });
    // console.log(result);
  }

  private async _getToken(): Promise<string> {
    const result = await axios({
      url: process.env.PAYPAL_BASE_URL + '/v1/oauth2/token',
      method: 'post',
      data: 'grant_type=client_credentials',
      auth: {
        username: process.env.PAYPAL_CLIENT_ID,
        password: process.env.PAYPAL_SECRET,
      },
    });

    return result.data.access_token;
  }

  async createPayment(data: {
    description: string;
    clientId: number;
    autoRenewal: boolean;
    price: number;
    startTime: Date;
    subscriptionType: PaymentContentMicroserviceTypes.SubscriptionType;
  }): Promise<PaymentContentMicroserviceTypes.PaymentCreateResponce> {
    const accessToken = await this._getToken();
    if (data.autoRenewal) {
      //получаем список планов подписки

      let countPages;
      try {
        countPages = await axios({
          url:
            process.env.PAYPAL_BASE_URL +
            '/v1/billing/plans?sort_by=create_time&sort_order=desc&total_required=true',
          method: 'get',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + accessToken,
          },
        });
      } catch (err) {
        console.log('createPayment ERR: ');
        console.log(err);
      }

      const listPlans = [];
      for (let i = 1; i <= countPages.data.total_pages; i++) {
        let plans;
        try {
          plans = await axios({
            url:
              process.env.PAYPAL_BASE_URL +
              `/v1/billing/plans?sort_by=create_time&sort_order=desc&page=${i}`,
            method: 'get',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + accessToken,
            },
          });
        } catch (err) {
          console.log('createPayment ERR: ');
          console.log(err);
        }
        listPlans.push(...plans.data.plans);
      }

      const listActivePlans = listPlans.filter((i) => i.status === 'ACTIVE');

      let dayPlan;
      let weekPlan;
      let monthPlan;

      //если планов нет, то создаём их
      if (listActivePlans.length < 3) {
        try {
          const response = await axios({
            url: process.env.PAYPAL_BASE_URL + '/v1/billing/plans',
            method: 'post',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + accessToken,
            },
            data: JSON.stringify({
              product_id: 'PROD-68N96763LX400345E',
              name: 'Day Inctagram Plan',
              description: 'Subscribe for day Inctagram Plan',
              status: 'ACTIVE',
              billing_cycles: [
                {
                  frequency: { interval_unit: 'DAY', interval_count: 1 },
                  tenure_type: 'REGULAR',
                  sequence: 1,
                  // total_cycles: 12,
                  pricing_scheme: {
                    fixed_price: { value: '1', currency_code: 'USD' },
                  },
                },
              ],
              payment_preferences: {
                auto_bill_outstanding: true,
                setup_fee: { value: '0', currency_code: 'USD' },
                setup_fee_failure_action: 'CONTINUE',
                payment_failure_threshold: 3,
              },
              taxes: { percentage: '0', inclusive: false },
            }),
          });

          dayPlan = response.data;
        } catch (err) {
          console.log('createPayment ERR: ');
          console.log(err);
        }

        try {
          const response = await axios({
            url: process.env.PAYPAL_BASE_URL + '/v1/billing/plans',
            method: 'post',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + accessToken,
            },
            data: JSON.stringify({
              product_id: 'PROD-68N96763LX400345E',
              name: 'Week Inctagram Plan',
              description: 'Subscribe for week Inctagram Plan',
              status: 'ACTIVE',
              billing_cycles: [
                {
                  frequency: { interval_unit: 'WEEK', interval_count: 1 },
                  tenure_type: 'REGULAR',
                  sequence: 1,
                  // total_cycles: 12,
                  pricing_scheme: {
                    fixed_price: { value: '7', currency_code: 'USD' },
                  },
                },
              ],
              payment_preferences: {
                auto_bill_outstanding: true,
                setup_fee: { value: '0', currency_code: 'USD' },
                setup_fee_failure_action: 'CONTINUE',
                payment_failure_threshold: 3,
              },
              taxes: { percentage: '0', inclusive: false },
            }),
          });
          weekPlan = response.data;
        } catch (err) {
          console.log('createPayment ERR: ');
          console.log(err);
        }

        try {
          const response = await axios({
            url: process.env.PAYPAL_BASE_URL + '/v1/billing/plans',
            method: 'post',
            headers: {
              'Content-Type': 'application/json',
              Authorization: 'Bearer ' + accessToken,
            },
            data: JSON.stringify({
              product_id: 'PROD-68N96763LX400345E',
              name: 'Month Inctagram Plan',
              description: 'Subscribe for month Inctagram Plan',
              status: 'ACTIVE',
              billing_cycles: [
                {
                  frequency: { interval_unit: 'MONTH', interval_count: 1 },
                  tenure_type: 'REGULAR',
                  sequence: 1,
                  // total_cycles: 12,
                  pricing_scheme: {
                    fixed_price: { value: '30', currency_code: 'USD' },
                  },
                },
              ],
              payment_preferences: {
                auto_bill_outstanding: true,
                setup_fee: { value: '0', currency_code: 'USD' },
                setup_fee_failure_action: 'CONTINUE',
                payment_failure_threshold: 3,
              },
              taxes: { percentage: '0', inclusive: false },
            }),
          });
          monthPlan = response.data;
        } catch (err) {
          console.log('createPayment ERR: ');
          console.log(err);
        }
      } else {
        //если планы есть, то получаем их подробнее
        for (let i = 0; i < 3; i++) {
          let plan;
          try {
            plan = await axios({
              url:
                process.env.PAYPAL_BASE_URL +
                '/v1/billing/plans/' +
                listActivePlans[i].id,
              method: 'get',
              headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + accessToken,
              },
            });
          } catch (err) {
            console.log('createPayment ERR: ');
            console.log(err);
          }

          if (plan.data.billing_cycles[0].frequency.interval_unit === 'DAY') {
            dayPlan = plan.data;
          } else if (
            plan.data.billing_cycles[0].frequency.interval_unit === 'WEEK'
          ) {
            weekPlan = plan.data;
          } else if (
            plan.data.billing_cycles[0].frequency.interval_unit === 'MONTH'
          ) {
            monthPlan = plan.data;
          }
        }
      }

      let planId;
      if (data.subscriptionType === 'day') {
        planId = dayPlan.id;
      } else if (data.subscriptionType === 'week') {
        planId = weekPlan.id;
      } else if (data.subscriptionType === 'month') {
        planId = monthPlan.id;
      }

      let response;

      //делаем подписку
      try {
        response = await axios({
          url: process.env.PAYPAL_BASE_URL + '/v1/billing/subscriptions',
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + accessToken,
            Prefer: 'return=representation',
          },
          data: JSON.stringify({
            plan_id: planId,
            application_context: {
              brand_name: 'inctagram',
              shipping_preference: 'NO_SHIPPING',
              user_action: 'SUBSCRIBE_NOW',
              payment_method: {
                payer_selected: 'PAYPAL',
                payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
              },
              return_url: process.env.FRONTEND_SUCCESS_PAYMENT_URL,
              cansel_url: process.env.FRONTEND_SUCCESS_PAYMENT_URL,
            },
            start_time: data.startTime.toISOString(),
            plan: {
              billing_cycles: [
                {
                  sequence: 1,
                  total_cycles: 0,
                },
              ],
            },
          }),
        });
      } catch (err) {
        console.log('createPayment ERR: ');
        // console.log(err);
        return;
      }

      return {
        data: response.data,
        sessionId: response.data.id,
        url: response.data.links.find((i) => i.rel === 'approve').href,
      };
    } else {
      let response;
      try {
        response = await axios({
          url: process.env.PAYPAL_BASE_URL + '/v2/checkout/orders',
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + accessToken,
          },
          data: JSON.stringify(
            // {
            //   intent: 'CAPTURE',
            //   purchase_units: [
            //     {
            //       reference_id: 'd9f80740-38f0-11e8-b467-0ed5f89f718b',
            //       amount: { currency_code: 'USD', value: '100.00' },
            //     },
            //   ],
            //   payment_source: {
            //     paypal: {
            //       experience_context: {
            //         payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
            //         brand_name: 'EXAMPLE INC',
            //         locale: 'en-US',
            //         landing_page: 'LOGIN',
            //         shipping_preference: 'SET_PROVIDED_ADDRESS',
            //         user_action: 'PAY_NOW',
            //         return_url: 'https://example.com/returnUrl',
            //         cancel_url: 'https://example.com/cancelUrl',
            //       },
            //     },
            //   },
            // },
            {
              intent: 'CAPTURE',
              purchase_units: [
                {
                  // items: [
                  //   {
                  //     name: 'name',
                  //     deescription: data.description,
                  //     quantity: 1,
                  //     unit_amount: {
                  //       currency_code: 'USD',
                  //       value: data.priceCents.toString(),
                  //     },
                  //   },
                  // ],
                  // reference_id: 'd9f80740-38f0-11e8-b467-0ed5f89f718b',
                  amount: {
                    currency_code: 'USD',
                    value: data.price.toString(),
                  },
                },
              ],
              payment_source: {
                paypal: {
                  experience_context: {
                    payment_method_preference: 'IMMEDIATE_PAYMENT_REQUIRED',
                    brand_name: 'inctagram',
                    // locale: 'en-US',
                    // landing_page: 'LOGIN',
                    shipping_preference: 'NO_SHIPPING',
                    user_action: 'PAY_NOW',
                    return_url:
                      process.env.BASE_URL + '/api/v1/payment/paypal/success',
                    cancel_url:
                      process.env.BASE_URL + '/api/v1/payment/paypal/cancel',
                  },
                },
              },
              // application_context: {
              //   return_url:
              //     process.env.BASE_URL + '/api/v1/payment/paypal/success',
              //   cansel_url:
              //     process.env.BASE_URL + '/api/v1/payment/paypal/cancel',
              //   shipping_preference: 'NO_SHIPPING',
              //   user_action: 'PAY_NOW',
              //   brand_name: 'inctagram',
              // },
            },
          ),
        });
      } catch (err) {
        console.log('paypal order ERR: ');
        console.log(err);
      }

      const url = response.data.links.find(
        (link) => link.rel === 'payer-action',
      ).href;
      return { data: response.data, sessionId: response.data.id, url: url };
    }
  }

  async capturePayment(orderId) {
    const accessToken = await this._getToken();

    let responce;

    try {
      responce = await axios({
        url:
          process.env.PAYPAL_BASE_URL +
          `/v2/checkout/orders/${orderId}/capture`,
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + accessToken,
        },
      });
    } catch (err) {
      console.log('paypal ERR');

      console.log(err);
      return '';
    }

    return responce.data;
  }

  async checkPayment(orderId): Promise<boolean> {
    const accessToken = await this._getToken();

    let responce;

    try {
      responce = await axios({
        url: process.env.PAYPAL_BASE_URL + `/v2/checkout/orders/${orderId}`,
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + accessToken,
        },
      });
    } catch (err) {
      console.log('paypal checkPayment ERR');

      console.log(err);
      return false;
    }

    if (
      responce.data.intent === 'CAPTURE' &&
      responce.data.status === 'COMPLETED'
    )
      return true;

    return false;
  }

  async checkSubscriptionPayment(
    subscriptionId: string,
    paymentDate: string,
    nextPayment: Date,
  ): Promise<{ check: boolean; nextPayment: string }> {
    const accessToken = await this._getToken();

    let responce;

    try {
      responce = await axios({
        url:
          process.env.PAYPAL_BASE_URL +
          `/v1/billing/subscriptions/${subscriptionId}`,
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + accessToken,
        },
      });
    } catch (err) {
      console.log('paypal checkPayment ERR');

      console.log(err);
      return {
        check: false,
        nextPayment: '',
      };
    }

    const check = nextPayment
      ? responce.data.billing_info.last_payment.time === paymentDate &&
        paymentDate == nextPayment.toString()
      : responce.data.billing_info.last_payment.time === paymentDate;

    if (check)
      return {
        check: true,
        nextPayment: responce.data.billing_info.next_billing_time,
      };

    return {
      check: false,
      nextPayment: '',
    };
  }
}
