import { PAYMENT_SERVER } from '../constants/configs';
import { MSG_ERR_EMPTY_RES, MSG_ERR_UNKNOWN } from '../constants/messages';

import axios from '../config/axios';
import { AxiosResponse } from 'axios';

import { createRequestHeader, handleResponseError } from '../utils/rest';

export const charge = async (
  token: string = '', 
  source: string = '',
  amount: string = '',
  description: string = '',
) => {
  return new Promise(async (resolve, reject) => {
    const payload = {
      token: token,
      source: source,
      amount: amount,
      description: description
    }
    await axios.post(
      `${PAYMENT_SERVER}/opn/charge`,
      payload,
      {
        withCredentials: false,
        ...{
          headers: await createRequestHeader(true, true)
        }
      }
    ).then(async (response: AxiosResponse<any, any>) => {
      if (response.data) {
        if (response.data.object !== 'error') {
          resolve(response.data);
        } else {
          reject(response.data.message || MSG_ERR_UNKNOWN);
        }
      } else {
        reject(MSG_ERR_EMPTY_RES);
      }
    }).catch((error) => {
      reject(handleResponseError(error));
    });
  });
}

export const paymentAuthorize = async (
  status: boolean, 
  ref: string,
  type: string = '',
  code: string = '',
  message: string = '',
  orders: string = '',
) => {
  return new Promise(async (resolve, reject) => {
    const payload = {
      status: status,
      ref: ref,
      type: type,
      code: code,
      message: message,
      orders: orders
    }
    await axios.post(
      `${PAYMENT_SERVER}/payment/authorize`,
      payload,
      {
        withCredentials: false,
        ...{
          headers: await createRequestHeader(true, true)
        }
      }
    ).then(async (response: AxiosResponse<any, any>) => {
      if (response.data) {
        if (response.data.object !== 'error') {
          resolve(response.data);
        } else {
          reject(response.data.message || MSG_ERR_UNKNOWN);
        }
      } else {
        reject(MSG_ERR_EMPTY_RES);
      }
    }).catch((error) => {
      reject(handleResponseError(error));
    });
  });
}