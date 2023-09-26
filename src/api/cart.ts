import { SERVER } from '../constants/configs';
import { MSG_ERR_EMP_RES } from '../constants/messages';

import axios, { AxiosResponse } from 'axios';
axios.defaults.withCredentials = true;
import moment from '../config/moment';

import { createRequestHeader, handleResponseError } from '../utils/rest';

export const getCartItems = async () => {
  return new Promise(async (resolve, reject) => {
    const payload = {}
    await axios.post(
      `${SERVER}/api/MainSale/SelectItemCart`,
      payload,
      {
        withCredentials: true,
        ...{
          headers: await createRequestHeader(true)
        }
      }
    ).then(async (response: AxiosResponse<any, any>) => {
      if (response.data) {
        if (response.data.Status === 'Success') {
          const data = response.data.Data;
          console.log(data);
          resolve(data);
        } else {
          reject(response.data.Message);
        }
      } else {
        reject(MSG_ERR_EMP_RES);
      }
    }).catch((error) => {
      reject(handleResponseError(error));
    });
  });
}

export const addItemToCart = async (
  companyId: number | string,
  productId: number | string,
  itemId: number | string,
  quantity: number
) => {
  return new Promise(async (resolve, reject) => {
    const payload = {
      CompId: parseInt(companyId.toString()),
      slist_id: parseInt(productId.toString()), 
      ItemId: parseInt(itemId.toString()), 
      Qty: quantity.toString()
    }
    await axios.post(
      `${SERVER}/api/MemoryBox/AddItemToCart`,
      payload,
      {
        withCredentials: true,
        ...{
          headers: await createRequestHeader(true)
        }
      }
    ).then(async (response: AxiosResponse<any, any>) => {
      if (response.data) {
        if (response.data.Status === 'Success') {
          const data = response.data.Data;
          console.log(data);
          resolve(data);
        } else {
          reject(response.data.Message);
        }
      } else {
        reject(MSG_ERR_EMP_RES);
      }
    }).catch((error) => {
      reject(handleResponseError(error));
    });
  });
}