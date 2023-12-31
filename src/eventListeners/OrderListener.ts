
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
import { 
  MSG_ERR_UNKNOWN, 
  MSG_INFO_OMISE, 
  MSG_LOADING 
} from "../constants/messages";
import { PAYMENT_REDIRECT } from "../constants/configs";
import { 
  DATA_ATT_CANCEL, 
  DATA_ATT_CANCEL_BTN_CANCEL, 
  DATA_ATT_CANCEL_BTN_CONFIRM, 
  DATA_ATT_PAYMENT_RETURN_URI, 
  DATA_ATT_WAIT 
} from "../constants/attributes";
import { 
  NAME_CANCEL, 
  NAME_CONFIRM, 
  NAME_OK }
   from "../constants/names";

import * as tingle from 'tingle.js';

import { loadImageAsBase64 } from "../utils/image";

import { cancelOrder, getOrder } from "../api/order";

import { Order, OrderItem } from "../models/order";

const modal = new tingle.modal({
  footer: true,
  stickyFooter: false,
  closeMethods: ['overlay', 'button', 'escape'],
  closeLabel: '',
  beforeClose: () => {
    return true;
  }
});
modal.setContent('');
modal.addFooterBtn(NAME_OK, 'tingle-btn tingle-btn--primary', () => modal.close());

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

const updateOrderCount = (data: Order[]) => {
  const element = document.getElementById(EL_ID_ORDER_COUNT) as HTMLElement;
  if (element) {
    element.innerHTML = data.length.toString();
  }
};

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
          itemNameElement.innerHTML = `${item.product.name}`;
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
          itemCompanyElement.innerHTML = `฿ ${THBcompact.format(item.product.price || 0)}`;
        }

        const itemSizeElement = itemElement.querySelector(`.${EL_CLASS_ORDER_ITEM_SIZE}`) as HTMLElement;
        if (itemSizeElement) {
          itemSizeElement.innerHTML = item.product.details.unit.name
            ? item.product.details.unit.name
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
      const msgWait: string = templateElement.getAttribute(DATA_ATT_WAIT) || MSG_LOADING;

      await getOrder(false).then(async (orders: Order[]) => {

        updateOrderCount(orders);

        for (let order of orders) {

          const formElement = templateElement.cloneNode(true) as HTMLFormElement;
          formElement.classList.remove('hidden-force');
          formElement.setAttribute('id', `order-${order.id}`);

          const txtPrompt: string = formElement?.getAttribute(DATA_ATT_CANCEL) || `Do you want to cancel {{name}}?`;
          const txtConfirm: string = formElement?.getAttribute(DATA_ATT_CANCEL_BTN_CONFIRM) || NAME_CONFIRM;
          const txtCancel: string = formElement?.getAttribute(DATA_ATT_CANCEL_BTN_CANCEL) || NAME_CANCEL;

          updateOrderItems(formElement, order.items);

          // Update order number
          const orderNoElement = formElement.querySelector(`.${EL_CLASS_ORDER_NO}`) as HTMLElement;
          if (orderNoElement) {
            orderNoElement.innerText = `Order Number ${order.orderNo}`;
          }

          const cancelButtonElement = formElement.querySelector(`.${EL_CLASS_ORDER_CANCEL_BTN}`) as HTMLInputElement;
          if (cancelButtonElement) {
            cancelButtonElement.addEventListener('click', async () => {

              const modalCancel = new tingle.modal({
                footer: true,
                stickyFooter: false,
                closeMethods: ['overlay', 'button', 'escape'],
                closeLabel: '',
                beforeClose: () => {
                  return true;
                }
              });
              modalCancel.setContent(txtPrompt.replace('{{name}}', order.orderNo));
              modalCancel.addFooterBtn(txtConfirm, 'tingle-btn tingle-btn--danger', async () => {
                modalCancel.close();
                await cancelOrder(order.id).then(async () => {
                  const orderRemoveElement = document.getElementById(`order-${order.id}`) as HTMLElement;
                  orderRemoveElement?.parentElement.removeChild(orderRemoveElement);
                  const orderCountElement = document.getElementById(EL_ID_ORDER_COUNT) as HTMLElement;
                  if (orderCountElement) {
                    if (orderCountElement.innerText && orderCountElement.innerText !== '0') {
                      const count = parseInt(orderCountElement.innerText) - 1;
                      orderCountElement.innerHTML = count.toString();
                    }
                  }
                }).catch((message) => {
                  modal.setContent(message || MSG_ERR_UNKNOWN);
                  modal.open();
                });
              });
              modalCancel.addFooterBtn(txtCancel, 'tingle-btn', () => modalCancel.close());
              modalCancel.open();

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
              let omiseDescriptionElement = omiseFormElement.querySelector('input[name="omiseDescription"]') as HTMLInputElement;
              omiseDescriptionElement?.setAttribute('value', `${MSG_INFO_OMISE} (${order.id})`);
              const ordersElement = omiseFormElement.querySelector('input[name="orders"]') as HTMLInputElement;
              ordersElement?.setAttribute('value', order.id.toString());
              const omiseScriptElement = omiseFormElement.querySelector('script') as HTMLElement;
              if (omiseScriptElement) {
                omiseScriptElement.setAttribute('data-amount', (order.amount.total * 100).toString());
                omiseScriptElement.setAttribute(
                  'data-button-label',
                  `Checkout ${THBcompact.format(order.amount.total || 0)} THB`
                );
                omiseScriptElement.setAttribute('data-currency', 'THB');
              }
              const omiseButtonElement = document.querySelector(`.${EL_ID_CHECKOUT_OMISE_BTN}`) as HTMLElement;
              if (omiseButtonElement) {
                omiseButtonElement.innerHTML = `Checkout ${THBcompact.format(order.amount.total || 0)} THB`;
                omiseButtonElement.click();
              }
              const omiseReturnURIElement = omiseFormElement.querySelector('input[name="omiseReturnURI"]') as HTMLInputElement;
              if (!omiseReturnURIElement) {
                const returnURI = formElement.getAttribute(DATA_ATT_PAYMENT_RETURN_URI) || '';
                if (returnURI) {
                  omiseReturnURIElement.setAttribute('value', returnURI);
                } else {
                  omiseReturnURIElement.setAttribute('value', PAYMENT_REDIRECT);
                }
              }
            }
            paymentButtonElement.setAttribute('value', paymentButtonLabel);
          });

          element.appendChild(formElement);

        }
      }).catch((message) => {
        modal.setContent(message || MSG_ERR_UNKNOWN);
        modal.open();
      });
    }

  }

}

export const OrderListener = async (): Promise<void> => {
  updateOrders();
}