import { OmiseClient, TokenResponse, OmiseError } from 'omise-nodejs';
import omise from '../config/omise';
import { PAYMENT_PROCESS_REDIRECT } from '../constants/configs';

export const createOmiseToken = async () => {

  const token: any = await omise.token.create({
    card: {
      name: 'JOHN DOE',
      number: '4242424242424242',
      expiration_month: 2,
      expiration_year: 2027,
      security_code: '123',
    },
  });
  console.log(token);

  if (token) {
    await omise.charge.create({
      amount: 5000,
      currency: 'thb',
      card: token.id,
      customer: token.card.name,
      return_uri: PAYMENT_PROCESS_REDIRECT,
      source: '',
      description: 'test'
    });
  }

  console.log(token);

}