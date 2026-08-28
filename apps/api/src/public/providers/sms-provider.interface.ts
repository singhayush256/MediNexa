export interface ISmsProvider {
  sendSms(to: string, message: string): Promise<boolean>;
}

export const SMS_PROVIDER_TOKEN = 'SMS_PROVIDER_TOKEN';
