import { SERVER } from '../constants/configs';
import { MSG_ERR_EMPTY_RES } from '../constants/messages';

import axios from '../config/axios';
import { AxiosResponse } from 'axios';
import moment from '../config/moment';

import { createRequestHeader, handleResponseError } from '../utils/rest';

import { checkPartnership, savePartnership } from './partner';
import { getProduct, getProductDetails } from './product';

import { CartItem } from '../models/cart';
import { Boat, Company } from '../models/sale';
import { Product, ProductDetail } from '../models/product';
import { Order, OrderItem } from '../models/order';

export const getOrder = async (success: boolean, orderId: number | string | '' = '') => {
  return new Promise(async (resolve, reject) => {
    const payload = {
      OrderId: parseInt(orderId.toString())
    }
    await axios.post(
      `${SERVER}/api/${success ? 'MemoryBox/SelectOrderInv' : 'MainSale/SelectOrderNotInv'}`,
      payload,
      {
        ...{
          headers: await createRequestHeader(true, true)
        }
      }
    ).then(async (response: AxiosResponse<any, any>) => {
      if (response.data) {
        if (response.data.Status === 'Success') {
          const data: Array<any> = response.data.Data.sort((a: any, b: any) => b.order_id - a.order_id);
          const orderNos = [...new Set(data.map((item: any) => item.order_no))];
          let orders: Order[] = [];
          for (let orderNo of orderNos) {
            let orderItems: OrderItem[] = [];
            for (let item of data.filter((item: any) => item.order_no === orderNo)) {
              let itemProduct: Product | null = null;
              let itemProductDetails: ProductDetail | null = null;
              await getProduct(item.item_id).then(async (dataProduct: Product) => {
                itemProduct = dataProduct;
              }).catch(() => { });
              await getProductDetails(item.item_id).then(async (dataProductDetail: ProductDetail) => {
                itemProductDetails = dataProductDetail;
              }).catch(() => { });
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
              const productDetail: ProductDetail = itemProductDetails
                ? itemProductDetails
                : {
                  id: item.item_id,
                  unit: {
                    id: item.unitid || null,
                    name: item.unitname || null,
                    price: item.unit_price || null,
                  },
                  package: {
                    depth: item.package_depth,
                    height: item.package_height,
                    width: item.package_width,
                    weight: item.package_weight,
                  },
                  file: {
                    name: item.fitem_name
                  },
                  referenceId: item.ms_id
                }
              const product: Product = {
                id: item.item_id,
                name: item.slist_name || itemProduct?.name || null,
                description: item.slist_details || itemProduct?.description || null,
                tag: item.Tag,
                minPrice: item.minprice || item.unit_price || itemProductDetails?.unit?.price || null,
                maxPrice: item.maxprice || item.unit_price || itemProductDetails?.unit?.price || null,
                price: item.maxprice || item.unit_price || itemProductDetails?.unit?.price || null,
                image: {
                  marked: itemProduct?.image.marked || null,
                  unmarked: success ? item.img_path : null,
                },
                details: productDetail,
                boat: boat,
                company: company,
              }
              const orderItem: OrderItem = {
                id: item.ms_id,
                product: product,
                quantity: item.qty,
                amount: item.unit_price || itemProductDetails?.unit?.price || null,
                discount: item.item_discount,
                total: item.total,
                remark: item.remark,
              }
              orderItems = [...orderItems, orderItem];
            }
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
            orders = [...orders, order];
          }
          resolve(orders);
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

export const createOrder = async (cartItems: CartItem[]) => {
  return new Promise(async (resolve, reject) => {
    let results: Array<any> = [];
    let errors: Array<any> = [];
    let totalCalculation: number = 0;
    const companyIds = [
      ...new Set(cartItems.map((item: CartItem) => item.product.company.id))
    ];
    const create = async (payload: any, itemIds: any) => {
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
      totalCalculation += total;
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
      await checkPartnership(companyId).then(async (partnership: any) => {
        if (!partnership) {
          await savePartnership(companyId).then(async () => {
            await create(payload, itemIds);
          }).catch(() => {
            errors = [...errors, ...itemIds];
          });
        } else {
          await create(payload, itemIds);
        }
      }).catch(() => {
        errors = [...errors, ...itemIds];
      });
    }
    if (!errors.length) {
      resolve({
        orders: results,
        total: totalCalculation
      });
    } else {
      reject(`Unable to creae order for items ${errors.join(', ')}`)
    }
  });
}

export const cancelOrder = async (orderId: number | string) => {
  return new Promise(async (resolve, reject) => {
    const payload = {
      OrderId: parseInt(orderId.toString())
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
        reject(MSG_ERR_EMPTY_RES);
      }
    }).catch((error) => {
      reject(handleResponseError(error));
    });
  });
}