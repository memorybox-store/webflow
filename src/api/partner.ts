import { SERVER } from '../constants/configs';
import { MSG_ERR_EMPTY_RES } from '../constants/messages';

import axios from '../config/axios';
import moment from '../config/moment';

import { createRequestHeader, handleResponseError } from '../utils/rest';
import { CartItem } from '../models/cart';
import { Boat, Company } from '../models/sale';
import { Product, ProductDetail } from '../models/product';
import { AxiosResponse } from 'axios';
import { Order, OrderItem } from '../models/order';

export const checkPartnership = async (companyId: number | string) => {
  return new Promise(async (resolve, reject) => {
    const payload = {
      CompId: parseInt(companyId.toString())
    }
    await axios.post(
      `${SERVER}/api/Main/CheckDataPartner`,
      payload,
      {
        ...{
          headers: await createRequestHeader(true, true)
        }
      }
    ).then(async (response: AxiosResponse<any, any>) => {
      if (response.data) {
        if (response.data.Status === 'Success') {
          const data: boolean = response.data.Data === 'True' ? true : false;
          resolve(data);
        } else {
          reject(response.data.Message);
        }
      } else {
        reject(MSG_ERR_EMPTY_RES);
      }
    }).catch((error) => {
      reject(handleResponseError(error));
    });
  });
}

export const savePartnership = async (companyId: number | string) => {
  return new Promise(async (resolve, reject) => {
    const payload = {
      CompId: parseInt(companyId.toString())
    }
    await axios.post(
      `${SERVER}/api/Main/SaveDataPartnerFromUserWeb`,
      payload,
      {
        ...{
          headers: await createRequestHeader(true, true)
        }
      }
    ).then(async (response: AxiosResponse<any, any>) => {
      if (response.data) {
        if (response.data.Status === 'Success') {
          const data: boolean = response.data.Data;
          resolve(data);
        } else {
          reject(response.data.Message);
        }
      } else {
        reject(MSG_ERR_EMPTY_RES);
      }
    }).catch((error) => {
      reject(handleResponseError(error));
    });
  });
}