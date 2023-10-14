import { SERVER } from '../constants/configs';
import { MSG_ERR_EMP_RES } from '../constants/messages';

import axios from '../config/axios';
import moment from '../config/moment';

import { createRequestHeader, handleResponseError } from '../utils/rest';
import { CartItem } from '../models/cart';
import { Boat, Company } from '../models/sale';
import { Product, ProductDetail } from '../models/product';
import { AxiosResponse } from 'axios';
import { Order, OrderItem } from '../models/order';

export const getOrder = async (success: boolean) => {
  return new Promise(async (resolve, reject) => {
    const payload = {
      "OrderId": ""
    }
    await axios.post(
      `${SERVER}/api/${success ? 'MemoryBox/SelectOrderInv' : 'MainSale/SelectOrderNotInv'}`,
      payload,
      {
        withCredentials: false,
        ...{
          headers: await createRequestHeader(true, true)
        }
      }
    ).then(async (response: AxiosResponse<any, any>) => {
      if (response.data) {
        if (response.data.Status === 'Success') {
          const data: Array<any> = response.data.Data.sort((a: any, b: any) => b.order_id - a.order_id);
          const orders = [
            ...new Set(data.map((item: any) => item.order_no))
          ].map((uniqe: any) => {
            const orderItems = data.filter((item: any) => item.order_no === uniqe).map((item: any) => {
              const boat: Boat = {
                id: null,
                name: item.mst_name || null,
                prefix: null,
                createdAt: null
              };
              const company: Company = {
                id: item.comp_id,
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
                unit: {
                  id: item.unitid || null,
                  name: item.unitname || null,
                  price: item.unit_price || null,
                },
                file: {
                  name: item.fitem_name
                },
                referenceId: item.ms_id
              }
              const product: Product = {
                id: item.ms_id,
                name: item.slist_name,
                description: item.slist_details,
                tag: item.Tag,
                minPrice: item.minprice,
                maxPrice: item.maxprice,
                price: item.maxprice,
                image: {
                  marked: item.img_path || null,
                  unmarked: item.img_path || null,
                },
                details: productDetail,
                boat: boat,
                company: company,
              }
              const orderItem: OrderItem = {
                id: item.ms_id,
                product: product,
                quantity: item.qty,
                price: item.unit_price,
                discount: item.item_discount,
                total: item.total,
                remark: item.remark,
              }
              return orderItem;
            });
            const orderSelected = data.find((item: any) => item.order_no === uniqe);
            const order: Order = {
              id: orderSelected.order_id,
              orderNo: orderSelected.order_no,
              invoiceId: orderSelected.inv_id || null,
              date: orderSelected.order_date,
              partner: orderSelected.partner_id,
              company: orderSelected.comp_id,
              price: {
                parcel: orderSelected.delivery_price || null,
                total: orderSelected.grand_total,
              },
              items: orderItems
            }
            return order;
          });
          console.log(orders);
          // const cartItems: CartItem[] = data.map((item: any) => {
          //   const company: Company = {
          //     id: item.comp_id,
          //     title: item.comp_name_th,
          //     name: item.comp_name_th,
          //     branch: null,
          //     contactPerson: null,
          //     tel: null,
          //     email: null,
          //     address: null,
          //     website: null,
          //     image: null,
          //   };
          //   const productDetail: ProductDetail = {
          //     id: item.item_id,
          //     sku: item.sku,
          //     optionId: item.slist_option_id,
          //     option: item.itemoption,
          //     status: null,
          //     unit: {
          //       id: null,
          //       name: item.unitname,
          //       price: item.unitprice,
          //     },
          //     package: {
          //       depth: item.package_depth,
          //       height: item.package_height,
          //       width: item.package_width,
          //       weight: item.package_weight,
          //     }
          //   }
          //   const product: Product = {
          //     id: item.slist_id,
          //     itemId: item.fitem_id,
          //     name: item.slist_name,
          //     description: null,
          //     tag: null,
          //     minPrice: item.minprice,
          //     maxPrice: item.maxprice,
          //     price: item.price_total,
          //     image: item.img_path,
          //     details: productDetail,
          //     boat: null,
          //     company: company,
          //   }
          //   const cartItem: CartItem = {
          //     id: item.cart_id,
          //     quantity: item.qty,
          //     product: product
          //   }
          //   return cartItem;
          // });
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

export const cancelOrder = async (cartId: number | string) => {
  return new Promise(async (resolve, reject) => {
    const payload = {
      cart_id: parseInt(cartId.toString())
    }
    await axios.post(
      `${SERVER}/api/MemoryBox/DeleteItemCart`,
      payload,
      {
        ...{
          headers: await createRequestHeader(true, true)
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

export const addItemToOrder = async (
  productId: number | string,
  companyId: number | string,
  itemId: number | string,
  quantity: number
) => {
  // return new Promise(async (resolve, reject) => {
  //   const payload = {
  //     CompId: parseInt(companyId.toString()),
  //     slist_id: parseInt(productId.toString()), 
  //     ItemId: parseInt(itemId.toString()), 
  //     Qty: quantity.toString()
  //   }
  //   await axios.post(
  //     `${SERVER}/api/MemoryBox/AddItemToCart`,
  //     payload,
  //     {
  //       ...{
  //         headers: await createRequestHeader(true, true)
  //       }
  //     }
  //   ).then(async (response: AxiosResponse<any, any>) => {
  //     if (response.data) {
  //       if (response.data.Status === 'Success') {
  //         const data: Array<any> = response.data.Data;
  //         const cartItems: CartItem[] = data.map((item: any) => {
  //           const company: Company = {
  //             id: item.comp_id,
  //             title: item.comp_name_th,
  //             name: item.comp_name_th,
  //             branch: null,
  //             contactPerson: null,
  //             tel: null,
  //             email: null,
  //             address: null,
  //             website: null,
  //             image: null,
  //           };
  //           const productDetail: ProductDetail = {
  //             id: item.item_id,
  //             sku: item.sku,
  //             optionId: item.slist_option_id,
  //             option: item.itemoption,
  //             status: null,
  //             unit: {
  //               id: null,
  //               name: item.unitname,
  //               price: item.unitprice,
  //             },
  //             package: {
  //               depth: item.package_depth,
  //               height: item.package_height,
  //               width: item.package_width,
  //               weight: item.package_weight,
  //             }
  //           }
  //           const product: Product = {
  //             id: item.slist_id,
  //             name: item.slist_name,
  //             description: null,
  //             tag: null,
  //             minPrice: item.minprice,
  //             maxPrice: item.maxprice,
  //             price: item.price_total,
  //             image: {
  //               marked: item.img_path
  //             },
  //             details: productDetail,
  //             boat: null,
  //             company: company,
  //           }
  //           const cartItem: CartItem = {
  //             id: item.cart_id,
  //             quantity: item.qty,
  //             product: product
  //           }
  //           return cartItem;
  //         });
  //         resolve(cartItems);
  //       } else {
  //         reject(response.data.Message);
  //       }
  //     } else {
  //       reject(MSG_ERR_EMP_RES);
  //     }
  //   }).catch((error) => {
  //     reject(handleResponseError(error));
  //   });
  // });
}

export const removeItemFromOrder = async (cartId: number | string) => {
  return new Promise(async (resolve, reject) => {
    const payload = {
      cart_id: parseInt(cartId.toString())
    }
    await axios.post(
      `${SERVER}/api/MemoryBox/DeleteItemCart`,
      payload,
      {
        ...{
          headers: await createRequestHeader(true, true)
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