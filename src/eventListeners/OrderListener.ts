
import {
  EL_ID_CHECKOUT_OMISE_FORM,
  EL_CLASS_ORDER_ITEM_SAMPLE,
  EL_CLASS_ORDER_ITEM_NAME,
  EL_CLASS_ORDER_ITEM_COMPANY,
  EL_CLASS_ORDER_ITEM_SIZE,
  EL_CLASS_ORDER_ITEM_PRICE,
  EL_CLASS_ORDER_LIST,
  EL_CLASS_ORDER_SUMMARY,
  EL_CLASS_ORDER_TOTAL,
  EL_CLASS_ORDER_ITEM_IMG,
  EL_ID_CHECKOUT_OMISE_BTN,
  EL_CLASS_ORDER_CHECKOUT_BTN,
  EL_ID_ORDER_FORM_LIST,
  EL_ID_ORDER_FORM_SAMPLE,
  EL_ID_ORDER_COUNT,
  EL_CLASS_ORDER_CANCEL_BTN,
  EL_CLASS_ORDER_NO
} from "../constants/elements";

import { loadImageAsBase64 } from "../utils/image";
import { MSG_INFO_OMISE, MSG_LOADING } from "../constants/messages";
import { cancelOrder, getOrder } from "../api/order";
import { getStorage } from "../utils/storage";
import { Session } from "../models/user";
import { Order, OrderItem } from "../models/order";

// Init price format
const THB = new Intl.NumberFormat(
  'th-TH',
  {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 2,
  }
);
const THBcompact = new Intl.NumberFormat(
  'th-TH',
  {
    minimumFractionDigits: 2,
  }
);

const updateOrderList = async (formElement: HTMLFormElement, data: OrderItem[]) => {

  const sampleItemElement = formElement.querySelector(`.${EL_CLASS_ORDER_ITEM_SAMPLE}`) as HTMLElement;
  if (sampleItemElement) {

    const itemTemplateElement = sampleItemElement.cloneNode(true) as HTMLElement;
    sampleItemElement.classList.add('hidden-force');

    const listElement = formElement.querySelector(`.${EL_CLASS_ORDER_LIST}`) as HTMLElement;
    if (listElement) {

      // Clear list
      if (listElement.hasChildNodes()) {
        const childNodes: Array<any> = Object.entries(listElement.childNodes).map(
          ([_, childNode]) => childNode
        );
        for (const childNode of childNodes) {
          if (childNode.id !== EL_CLASS_ORDER_ITEM_SAMPLE) {
            listElement.removeChild(childNode);
          }
        }
      }

      for (const item of data) {

        const itemElement = itemTemplateElement.cloneNode(true) as HTMLElement;
        itemElement.classList.remove('hidden-force');
        itemElement.classList.add('grid-force');
        itemElement.style.display = '';
        itemElement.removeAttribute('id');

        const itemNameElement = itemElement.querySelector(`.${EL_CLASS_ORDER_ITEM_NAME}`) as HTMLElement;
        if (itemNameElement) {
          itemNameElement.innerHTML = item.product.name;
        }

        const itemImgElement = itemElement.querySelector(`.${EL_CLASS_ORDER_ITEM_IMG}`) as HTMLImageElement;
        if (itemImgElement) {
          itemImgElement.crossOrigin = 'anonymous';
          itemImgElement.setAttribute('crossorigin', 'anonymous');
          itemImgElement.src = '';
          itemImgElement.srcset = '';
          if (item.product.image.marked) {
            loadImageAsBase64(item.product.image.marked).then((base64Data) => {
              // Use the base64Data in the src attribute of the img element
              itemImgElement.src = base64Data;
              itemImgElement.srcset = base64Data;
            }).catch((error) => {
              console.error(error.message);
            });
          }
        }

        const itemCompanyElement = itemElement.querySelector(`.${EL_CLASS_ORDER_ITEM_COMPANY}`) as HTMLElement;
        if (itemCompanyElement) {
          itemCompanyElement.innerHTML = item.product.company?.name || '-';
        }

        const itemSizeElement = itemElement.querySelector(`.${EL_CLASS_ORDER_ITEM_SIZE}`) as HTMLElement;
        if (itemSizeElement) {
          itemSizeElement.innerHTML = item.product.details.package
            ? `${item.product.details.package.width}x${item.product.details.package.height}`
            : '-';
        }

        const itemPriceElement = itemElement.querySelector(`.${EL_CLASS_ORDER_ITEM_PRICE}`) as HTMLElement;
        if (itemPriceElement) {
          itemPriceElement.innerHTML = `฿ ${THBcompact.format(item.product.price || 0)}`;
        }

        listElement.appendChild(itemElement);

      }
    }

  }

}

const updateOrderAmount = async (formElement: HTMLFormElement, data: OrderItem[]) => {

  // Init amount
  let amount: number = 0;
  if (data.length) {
    amount = data.reduce((result: number, item: any) => {
      return result + (item.amount || 0);
    }, 0);
  }

  let total: number = 0;
  if (data.length) {
    total = data.reduce((result: number, item: any) => {
      return result + (item.total || 0);
    }, 0);
  }

  // Update payment summary
  const summaryElement = formElement.querySelector(`.${EL_CLASS_ORDER_SUMMARY}`) as HTMLElement;
  if (summaryElement) {
    summaryElement.innerText = `฿ ${THBcompact.format(amount || 0)}`;
  }

  // Update payment total
  const totalElement = formElement.querySelector(`.${EL_CLASS_ORDER_TOTAL}`) as HTMLElement;
  if (totalElement) {
    totalElement.innerText = `฿ ${THBcompact.format(total || 0)}`;
  }

}

export const updateOrderItems = (formElement: HTMLFormElement, data: OrderItem[]) => {
  // Batch update summary
  updateOrderList(formElement, data);
  updateOrderAmount(formElement, data);
}

export const updateOrders = async () => {

  const element = document.getElementById(EL_ID_ORDER_FORM_LIST) as HTMLElement;
  if (element) {

    // Clear list
    if (element.hasChildNodes()) {
      const childNodes: Array<any> = Object.entries(element.childNodes).map(
        ([_, childNode]) => childNode
      );
      for (const childNode of childNodes) {
        if (childNode.id !== EL_ID_ORDER_FORM_SAMPLE) {
          element.removeChild(childNode);
        }
      }
    }

    const templateElement = document.getElementById(EL_ID_ORDER_FORM_SAMPLE) as HTMLFormElement;
    if (templateElement) {

      templateElement.classList.add('hidden-force');
      const msgWait: string = templateElement.getAttribute('data-wait') || MSG_LOADING;

      await getOrder(false).then(async (orders: Order[]) => {

        const orderCountElement = document.getElementById(EL_ID_ORDER_COUNT) as HTMLElement;
        if (orderCountElement) {
          orderCountElement.innerHTML = orders.length.toString();
        }

        for (let order of orders) {

          const formElement = templateElement.cloneNode(true) as HTMLFormElement;
          formElement.classList.remove('hidden-force');

          updateOrderItems(formElement, order.items);

          // Update order number
          const orderNoElement = formElement.querySelector(`.${EL_CLASS_ORDER_NO}`) as HTMLElement;
          if (orderNoElement) {
            orderNoElement.innerText = `Order Number ${order.orderNo}`;
          }

          const cancelButtonElement = formElement.querySelector(`.${EL_CLASS_ORDER_CANCEL_BTN}`) as HTMLInputElement;
          if (cancelButtonElement) {
            cancelButtonElement.addEventListener('click', async () => {
              if (confirm(`Do you want to cancel "${order.orderNo}"?`)) {
                await cancelOrder(order.orderNo).then(async () => {
                  updateOrders();
                }).catch((message) => {
                  alert(message);
                });
              }
            });
          }

          formElement.addEventListener('submit', async (event) => {
            event.preventDefault();
            event.stopPropagation();
            let paymentButtonLabel = 'Pay';
            const paymentButtonElement = formElement.querySelector(`.${EL_CLASS_ORDER_CHECKOUT_BTN}`) as HTMLInputElement;
            if (paymentButtonElement) {
              paymentButtonLabel = paymentButtonElement.getAttribute('value');
              paymentButtonElement.setAttribute('value', msgWait);
            }
            const omiseFormElement = document.getElementById(EL_ID_CHECKOUT_OMISE_FORM) as HTMLFormElement;
            if (omiseFormElement) {
              const omiseDescriptionElement = omiseFormElement.querySelector('input[name="omiseDescription"]') as HTMLInputElement;
              omiseDescriptionElement?.setAttribute('value', `${MSG_INFO_OMISE} (${order.id})`);
              const orderIdsElement = omiseFormElement.querySelector('input[name="orderIds"]') as HTMLInputElement;
              orderIdsElement?.setAttribute('value', order.id.toString());
              const omiseScriptElement = omiseFormElement.querySelector('script') as HTMLElement;
              if (omiseScriptElement) {
                omiseScriptElement.setAttribute('data-amount', (order.amount.total * 100).toString());
                omiseScriptElement.setAttribute(
                  'data-button-label',
                  `Checkout ${THBcompact.format(order.amount.total || 0)} THB`
                );
              }
              const omiseButtonElement = document.querySelector(`.${EL_ID_CHECKOUT_OMISE_BTN}`) as HTMLElement;
              if (omiseButtonElement) {
                omiseButtonElement.innerHTML = `Checkout ${THBcompact.format(order.amount.total || 0)} THB`;
                omiseButtonElement.click();
              }
            }
            paymentButtonElement.setAttribute('value', paymentButtonLabel);
          });

          element.append(formElement);

        }
      }).catch((error) => {
        alert(error);
      });
    }

  }

}

export const OrderListener = async (): Promise<void> => {

  const omiseFormElement = document.getElementById(EL_ID_CHECKOUT_OMISE_FORM) as HTMLFormElement;
  if (omiseFormElement) {
    omiseFormElement.style.display = '';
    const omiseAuthorizationElement = omiseFormElement.querySelector('input[name="Authorization"]') as HTMLInputElement;
    if (omiseAuthorizationElement) {
      const getAccessToken = async () => {
        const session = await getStorage('session', true) as Session | null;
        if (session) {
          return session?.accessToken || '';
        } else {
          return '';
        }
      }
      const loginToken = await getAccessToken();
      omiseAuthorizationElement.value = loginToken;
    }
  }

  updateOrders();

}