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

export const getOrder = async (success: boolean, orderId: number | '' = '') => {
  return new Promise(async (resolve, reject) => {
    const payload = {
      OrderId: orderId
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
          const orderNos = [...new Set(data.map((item: any) => item.order_no))];
          const orders = orderNos.map((orderNo: any) => {
            const orderItems = data.filter((item: any) => item.order_no === orderNo).map((item: any) => {
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
                amount: item.unit_price,
                discount: item.item_discount,
                total: item.total,
                remark: item.remark,
              }
              return orderItem;
            });
            const orderSelected = data.find((item: any) => item.order_no === orderNo);
            const order: Order = {
              id: orderSelected.order_id,
              orderNo: orderSelected.order_no,
              invoiceId: orderSelected.inv_id || null,
              date: orderSelected.order_date,
              partner: orderSelected.partner_id,
              company: orderSelected.comp_id,
              amount: {
                parcel: orderSelected.delivery_price || null,
                total: orderSelected.grand_total,
              },
              items: orderItems
            }
            return order;
          });
          console.log(orders);
          console.log(moment().format());
          resolve(orders);
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

export const createOrder = async (cartItems: CartItem[]) => {
  return new Promise(async (resolve, reject) => {
    let results: Array<any> = [];
    let errors: Array<any> = [];
    const companyIds = [
      ...new Set(cartItems.map((item: CartItem) => item.product.company.id))
    ];
    for (let companyId of companyIds) {
      const items = cartItems.filter((item: any) => item.product.company.id === companyId).map((item: CartItem) => (
        {
          ItemId: item.product.details.id,
          Qty: item.quantity,
          Unitprice: item.product.price,
          ItemDiscount: 0,
          Total: item.product.price,
          Remark: ""
        }
      ));
      const price: number = items.reduce((result: number, item: any) => {
        return result + (item.Unitprice || 0);
      }, 0);
      const discount: number = items.reduce((result: number, item: any) => {
        return result + (item.ItemDiscount || 0);
      }, 0);
      const total: number = items.reduce((result: number, item: any) => {
        return result + (item.Total || 0);
      }, 0);
      const payload = {
        CompId: companyId,
        Doctype: "E-SO",
        OrderDate: moment().format(),
        Rate: "1",
        Total: price,
        Discount: discount,
        Deposit: 0,
        SumTotal: total,
        Vat: 0,
        GrandTotal: total,
        Remark: '',
        ItemOrder: items
      }
      const itemIds = payload.ItemOrder.map((item: any) => item.ItemId);
      await axios.post(
        `${SERVER}/api/MainSale/InsertOrder`,
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
            results = [...results, ...data.map((item: any) => item.order_id)];
          } else {
            errors = [...errors, ...itemIds];
          }
        } else {
          errors = [...errors, ...itemIds];
        }
      }).catch(() => {
        errors = [...errors, ...itemIds];
      });
    }
    if (!errors.length) {
      resolve(results);
    } else {
      reject(`Unable to creae order for items ${errors.join(', ')}`)
    }
  });
}

export const cancelOrder = async (OrderId: number | string) => {
  return new Promise(async (resolve, reject) => {
    const payload = {
      OrderId: parseInt(OrderId.toString())
    }
    await axios.post(
      `${SERVER}/api/MainSale/CancelOrder`,
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