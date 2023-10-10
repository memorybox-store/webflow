import { SERVER } from '../constants/configs';
import { MSG_ERR_EMP_RES } from '../constants/messages';

import axios from '../config/axios';
import moment from '../config/moment';

import { createRequestHeader, handleResponseError } from '../utils/rest';
import { CartItem } from '../models/cart';
import { Company } from '../models/sale';
import { Product, ProductDetail } from '../models/product';
import { AxiosResponse } from 'axios';

export const getCartItems = async () => {
  return new Promise(async (resolve, reject) => {
    const payload = {}
    await axios.post(
      `${SERVER}/api/MainSale/SelectItemCart`,
      payload,
      {
        ...{
          headers: await createRequestHeader(true)
        }
      }
    ).then(async (response: AxiosResponse<any, any>) => {
      if (response.data) {
        if (response.data.Status === 'Success') {
          const data: Array<any> = response.data.Data;
          const cartItems: CartItem[] = data.map((item: any) => {
            const company: Company = {
              id: item.comp_id,
              title: item.comp_name_th,
              name: item.comp_name_th,
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
              sku: item.sku,
              optionId: item.slist_option_id,
              option: item.itemoption,
              status: null,
              unit: {
                id: null,
                name: item.unitname,
                price: item.unitprice,
              },
              package: {
                depth: item.package_depth,
                height: item.package_height,
                width: item.package_width,
                weight: item.package_weight,
              }
            }
            const product: Product = {
              id: item.slist_id,
              itemId: item.fitem_id,
              name: item.slist_name,
              description: null,
              tag: null,
              minPrice: item.minprice,
              maxPrice: item.maxprice,
              price: item.price_total,
              image: item.img_path,
              details: productDetail,
              boat: null,
              company: company,
            }
            const cartItem: CartItem = {
              id: item.cart_id,
              quantity: item.qty,
              product: product
            }
            return cartItem;
          });
          resolve(cartItems);
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
  productId: number | string,
  companyId: number | string,
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
        ...{
          headers: await createRequestHeader(true)
        }
      }
    ).then(async (response: AxiosResponse<any, any>) => {
      if (response.data) {
        if (response.data.Status === 'Success') {
          const data: Array<any> = response.data.Data;
          const cartItems: CartItem[] = data.map((item: any) => {
            const company: Company = {
              id: item.comp_id,
              title: item.comp_name_th,
              name: item.comp_name_th,
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
              sku: item.sku,
              optionId: item.slist_option_id,
              option: item.itemoption,
              status: null,
              unit: {
                id: null,
                name: item.unitname,
                price: item.unitprice,
              },
              package: {
                depth: item.package_depth,
                height: item.package_height,
                width: item.package_width,
                weight: item.package_weight,
              }
            }
            const product: Product = {
              id: item.slist_id,
              itemId: item.fitem_id,
              name: item.slist_name,
              description: null,
              tag: null,
              minPrice: item.minprice,
              maxPrice: item.maxprice,
              price: item.price_total,
              image: item.img_path,
              details: productDetail,
              boat: null,
              company: company,
            }
            const cartItem: CartItem = {
              id: item.cart_id,
              quantity: item.qty,
              product: product
            }
            return cartItem;
          });
          resolve(cartItems);
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

export const removeItemFromCart = async (cartId: number | string) => {
  return new Promise(async (resolve, reject) => {
    const payload = {
      cart_id: parseInt(cartId.toString())
    }
    await axios.post(
      `${SERVER}/api/MemoryBox/DeleteItemCart`,
      payload,
      {
        ...{
          headers: await createRequestHeader(true)
        }
      }
    ).then(async (response: AxiosResponse<any, any>) => {
      if (response.data) {
        if (response.data.Status === 'Success') {
          resolve(true);
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