import { SERVER } from '../constants/configs';
import { MSG_ERR_EMP_RES } from '../constants/messages';

import axios, { AxiosResponse } from 'axios';
import moment from '../config/moment';

import { createRequestHeader, handleResponseError } from '../utils/rest';

import { Company, Boat } from '../models/sale';
import { Product, ProductDetail } from '../models/product';

export const getProducts = async (boatId: string) => {
  return new Promise(async (resolve, reject) => {
    const payload = {
      PageNumber: 0,
      RowsOfPage: 0,
      Category: boatId
    }
    await axios.post(
      `${SERVER}/api/MainSale/SelectDataSaleList`,
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
          const products: Product[] = data.map((item: any) => {
            const boat: Boat = {
              id: item.mst_id,
              name: item.mst_name,
              prefix: item.mst_code_prefix,
              createdAt: null
            };
            const company: Company = {
              id: item.parentcomp_id,
              title: null,
              name: null,
              branch: null,
              contactPerson: null,
              tel: null,
              email: null,
              address: null,
              website: null,
              image: null,
            };
            const product: Product = {
              id: item.slist_id,
              itemId: item.fitem_id,
              name: item.slist_name,
              description: item.slist_details,
              tag: item.Tag,
              minPrice: item.minprice,
              maxPrice: item.maxprice,
              price: item.maxprice,
              image: item.img_path,
              details: null,
              boat: boat,
              company: company,
            }
            return product;
          });
          resolve(products);
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

export const getProductDetails = async (productId: number | string) => {
  return new Promise(async (resolve, reject) => {
    const payload = {
      slist_id: parseInt(productId.toString())
    }
    await axios.post(
      `${SERVER}/api/MainSale/SelectDataSaleListDetailsItem`,
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
          if (response.data.Data && response.data.Data.length) {
            const data: any = response.data.Data[0];
            const productDetail: ProductDetail = {
              id: data.item_id,
              sku: data.sku,
              optionId: data.slist_option_id,
              option: data.itemoption,
              status: data.status,
              unit: {
                id: data.unitid,
                name: data.unitname,
                price: data.unitprice,
              },
              package: {
                depth: data.package_depth,
                height: data.package_height,
                width: data.package_width,
                weight: data.package_weight,
              }
            }
            resolve(productDetail);
          } else {
            resolve(null);
          }
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