import { SERVER } from '../constants/configs';
import { MSG_ERR_EMPTY_RES } from '../constants/messages';

import axios from '../config/axios';
import moment from '../config/moment';

import { createRequestHeader, handleResponseError } from '../utils/rest';

import { Company, Boat } from '../models/sale';
import { Product, ProductDetail } from '../models/product';
import { AxiosResponse } from 'axios';

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
        ...{
          headers: await createRequestHeader(true, true)
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
            const productDetail: ProductDetail = {
              id: null,
              file: {
                id: item.fitem_id
              },
              referenceId: item.slist_id
            };
            const product: Product = {
              id: item.slist_id,
              name: item.slist_name,
              description: item.slist_details,
              tag: item.Tag,
              minPrice: item.minprice,
              maxPrice: item.maxprice,
              price: item.maxprice,
              image: {
                marked: item.img_path
              },
              details: productDetail,
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
        reject(MSG_ERR_EMPTY_RES);
      }
    }).catch((error) => {
      reject(handleResponseError(error));
    });
  });
}

export const getProductsScan = async (boatId: string) => {
  return new Promise(async (resolve, reject) => {
    const payload = {
      PageNumber: 0,
      RowsOfPage: 0,
      Category: boatId
    }
    await axios.post(
      `${SERVER}/api/MemoryBox/SelectDataSaleList`,
      payload,
      {
        ...{
          headers: await createRequestHeader(true, true)
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
            const productDetail: ProductDetail = {
              id: item.item_id,
              file: {
                id: item.fitem_id
              },
              referenceId: item.slist_id
            };
            const product: Product = {
              id: item.slist_id,
              name: item.slist_name,
              description: item.slist_details,
              tag: item.Tag,
              minPrice: item.minprice,
              maxPrice: item.maxprice,
              price: item.maxprice,
              image: {
                marked: item.img_path,
                unmarked: item.img_path2,
              },
              details: productDetail,
              boat: boat,
              company: company
            }
            return product;
          });
          resolve(products);
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

export const getProduct = async (productId: number | string) => {
  return new Promise(async (resolve, reject) => {
    const payload = {
      slist_id: parseInt(productId.toString())
    }
    await axios.post(
      `${SERVER}/api/MainSale/SelectDataSaleListDetails`,
      payload,
      {
        ...{
          headers: await createRequestHeader(true, true)
        }
      }
    ).then(async (response: AxiosResponse<any, any>) => {
      if (response.data) {
        if (response.data.Status === 'Success') {
          if (response.data.Data && response.data.Data.length) {
            const data: any = response.data.Data[0];
            const boat: Boat = {
              id: data.mst_id,
              name: data.mst_name,
              prefix: data.mst_code_prefix,
              createdAt: null
            };
            const company: Company = {
              id: null,
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
            const productDetail: ProductDetail = {
              id: data.item_id,
              file: {
                id: null
              },
              referenceId: data.slist_id
            };
            const product: Product = {
              id: data.slist_id,
              name: data.slist_name,
              description: data.slist_details,
              tag: data.Tag,
              minPrice: null,
              maxPrice: null,
              price: null,
              image: {
                marked: data.img_path,
                unmarked: data.img_path2,
              },
              details: productDetail,
              boat: boat,
              company: company
            }
            resolve(product);
          } else {
            resolve(null);
          }
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

export const getProductDetails = async (productId: number | string) => {
  return new Promise(async (resolve, reject) => {
    const payload = {
      slist_id: parseInt(productId.toString())
    }
    await axios.post(
      `${SERVER}/api/MainSale/SelectDataSaleListDetailsItem`,
      payload,
      {
        ...{
          headers: await createRequestHeader(true, true)
        }
      }
    ).then(async (response: AxiosResponse<any, any>) => {
      if (response.data) {
        if (response.data.Status === 'Success') {
          if (response.data.Data.item && response.data.Data.item.length) {
            const data: any = response.data.Data.item[0];
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
              },
              file: {
                id: data.fitem_id
              },
              referenceId: data.slist_id
            }
            resolve(productDetail);
          } else {
            resolve(null);
          }
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