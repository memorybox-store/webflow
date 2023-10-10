import { OmiseClient, TokenResponse, OmiseError } from 'omise-nodejs';
import omise from '../config/omise';
import { OMISE_PUBLIC_KEY, OMISE_SECRET_KEY, PAYMENT_PROCESS_REDIRECT } from '../constants/configs';
import axios from '../config/axios';
import { handleResponseError } from '../utils/rest';
import { MSG_ERR_EMP_RES } from '../constants/messages';
import { AxiosResponse } from 'axios';

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
    return token;
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

export const chargeOmise = async (
  amount: number,
  description: string = '',
  card: string = '',
  source: string = ''
) => {
  return new Promise(async (resolve, reject) => {
    const payload = {
      amount: amount,
      currency: "thb",
      card: card,
      source: source,
      return_uri: PAYMENT_PROCESS_REDIRECT,
      description: description
    }
    await axios.post(
      `https://api.omise.co/charges`,
      payload,
      {
        withCredentials: false,
        auth: {
          username: OMISE_SECRET_KEY,
          password: '',
        },
      }
    ).then(async (response: AxiosResponse<any, any>) => {
      console.log(response);
      if (response.data) {
        resolve(response.data);
      } else {
        reject(MSG_ERR_EMP_RES);
      }
    }).catch((error) => {
      reject(handleResponseError(error));
    });
  });
}

export const chargeOmise2 = async (
  amount: number,
  description: string = '',
  card: string = '',
  source: string = ''
) => {
  return new Promise(async (resolve, reject) => {
    const payload = {
      amount: amount,
      currency: "thb",
      card: card,
      source: source,
      return_uri: PAYMENT_PROCESS_REDIRECT,
      description: description
    }
    await axios.post(
      `https://api.omise.co/charges`,
      payload,
      {
        withCredentials: false,
        auth: {
          username: OMISE_SECRET_KEY,
          password: '',
        },
      }
    ).then(async (response: AxiosResponse<any, any>) => {
      console.log(response);
      if (response.data) {
        resolve(response.data);
      } else {
        reject(MSG_ERR_EMP_RES);
      }
    }).catch((error) => {
      reject(handleResponseError(error));
    });
  });
}