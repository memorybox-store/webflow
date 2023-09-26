import { SERVER } from '../constants/configs';
import { MSG_ERR_EMP_RES } from '../constants/messages';

import axios, { AxiosResponse } from 'axios';
axios.defaults.withCredentials = true;
import moment from '../config/moment';

import { createRequestHeader, handleResponseError } from '../utils/rest';

import { Company, Boat } from '../models/sale';

export const getCompanies = async () => {
  return new Promise(async (resolve, reject) => {
    const payload = {}
    await axios.post(
      `${SERVER}/api/Main/SelectCompany`,
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
          const data: Array<any> = response.data.Data;
          const companies: Company[] = data.map((item: any) => (
            {
              id: item.a1,
              title: item.a13,
              name: item.a4,
              branch: item.a14,
              contactPerson: item.a7,
              tel: item.a8,
              email: item.a9,
              address: item.a6,
              website: item.a15,
              image: item.a19
            }
          ));
          console.log(companies);
          resolve(companies);
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

export const getBoats = async (compId: string, date: string) => {
  return new Promise(async (resolve, reject) => {
    const payload = {
      comp_id: compId,
      created_date: moment(date).format()
    }
    await axios.post(
      `${SERVER}/api/MainSale/SelectProductCategory`,
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
          const data: Array<any> = response.data.Data;
          const boats: Boat[] = data.map((item: any) => (
            {
              id: item.a1,
              name: item.a3,
              prefix: item.a2,
              createdAt: item.a4
            }
          ));
          console.log(boats);
          resolve(boats);
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