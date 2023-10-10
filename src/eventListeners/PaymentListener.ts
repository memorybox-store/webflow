
import {
  EL_CLASS_CART_AMOUNT,
  EL_CLASS_CART_EMPTY,
  EL_CLASS_CART_FORM,
  EL_CLASS_CART_LIST,
  EL_DNT_CHECKOUT_BTN,
  EL_DNT_MODAL_CART,
  EL_DNT_MODAL_CART_CLOSE_LINK,
  EL_DNT_MODAL_CART_OPEN_LINK,
  EL_CLASS_ADD_TO_CART_BTN,
  EL_ID_CART_BADGE,
  EL_ID_CHECKOUT_OMISE_BTN,
  EL_ID_CHECKOUT_OMISE_FORM,
  EL_ID_CHECKOUT_OMISE_SCRIPT,
  EL_ID_CHART_BTN,
  EL_CLASS_REMOVE_BTN,
  EL_ID_ORDER_SUMMARY,
  EL_ID_PAYMENT_ITEM_SAMPLE,
  EL_CLASS_PAYMENT_ITEM,
  EL_CLASS_PAYMENT_ITEM_NAME,
  EL_CLASS_PAYMENT_ITEM_COMPANY,
  EL_CLASS_PAYMENT_ITEM_SIZE,
  EL_CLASS_PAYMENT_ITEM_PRICE,
  EL_ID_PAYMENT_LIST,
  EL_CLASS_PAYMENT_ITEM_REMOVE_BTN,
  EL_ID_PAYMENT_DISCOUNT_BADGE,
  EL_ID_PAYMENT_SUMMARY,
  EL_ID_PAYMENT_TOTAL,
  EL_CLASS_PAYMENT_ITEM_IMG
} from "../constants/elements";
import { cartItemTemplate } from "../templates/cart";

import { getCartItems, removeItemFromCart } from "../api/cart";
import { CartItem } from "../models/cart";
import omise from "../config/omise";
import { PAYMENT_PROCESS_PAGE } from "../constants/configs";
import { removeCartItem, updateCartItems } from "./CartListener";
import { loadImageAsBase64 } from "../utils/image";

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

const updateSummaryList = async (data: CartItem[]) => {

  const sampleItemElement = document.getElementById(EL_ID_PAYMENT_ITEM_SAMPLE) as HTMLElement;
  if (sampleItemElement) {

    const itemTemplateElement = sampleItemElement.cloneNode(true) as HTMLElement;

    const currentItemElements = document.querySelectorAll(`.${EL_CLASS_PAYMENT_ITEM}`) as NodeListOf<HTMLElement>;
    if (currentItemElements.length) {
      for (const [_, currentItemElement] of Object.entries(currentItemElements)) {
        currentItemElement.parentElement.removeChild(currentItemElement);
      }
    }

    const listElement = document.getElementById(EL_ID_PAYMENT_LIST) as HTMLElement;
    if (listElement) {
      for (const item of data) {

        const itemElement = itemTemplateElement.cloneNode(true) as HTMLElement;

        const itemNameElement = itemElement.querySelector(`.${EL_CLASS_PAYMENT_ITEM_NAME}`) as HTMLElement;
        if (itemNameElement) {
          itemNameElement.innerHTML = item.product.name;
        }

        const itemImgElement = itemElement.querySelector(`.${EL_CLASS_PAYMENT_ITEM_IMG}`) as HTMLImageElement;
        if (itemImgElement) {
          loadImageAsBase64(item.product.image).then((base64Data) => {
            // Use the base64Data in the src attribute of the img element
            itemImgElement.src = base64Data;
            itemImgElement.srcset = base64Data;
          }).catch((error) => {
            console.error(error.message);
          });
        }

        const itemCompanyElement = itemElement.querySelector(`.${EL_CLASS_PAYMENT_ITEM_COMPANY}`) as HTMLElement;
        if (itemCompanyElement) {
          itemCompanyElement.innerHTML = item.product.company.name;
        }

        const itemSizeElement = itemElement.querySelector(`.${EL_CLASS_PAYMENT_ITEM_SIZE}`) as HTMLElement;
        if (itemSizeElement) {
          itemSizeElement.innerHTML = `${item.product.details.package.width}x${item.product.details.package.height}`;
        }

        const itemPriceElement = itemElement.querySelector(`.${EL_CLASS_PAYMENT_ITEM_PRICE}`) as HTMLElement;
        if (itemPriceElement) {
          itemPriceElement.innerHTML = `฿ ${THB.format(item.product.price || 0)}`;
        }

        const itemRemoveButtonElement = itemElement.querySelector(`.${EL_CLASS_PAYMENT_ITEM_REMOVE_BTN}`) as HTMLElement;
        itemRemoveButtonElement?.addEventListener('click', async () => {
          removeCartItem(item.id, item.product.name).then(async () => {
            await getCartItems().then(async (updatedData: CartItem[]) => {
              updateCartItems(updatedData);
            }).catch((error) => {
              alert(error);
            });
          }).catch((error) => {
            alert(error);
          });
        });

        listElement.appendChild(itemElement);

      }
    }

  }

  // Init form
  const ecomFormElement = document.querySelector(`.${EL_CLASS_CART_FORM}`) as HTMLFormElement;
  if (ecomFormElement) {

    const formElement = ecomFormElement.cloneNode(true) as HTMLElement;
    formElement.removeAttribute('data-node-type');
    formElement.classList.remove("hidden-force");
    formElement.classList.remove("flex-force");
    if (data.length) {
      formElement.classList.add("flex-force");
    } else {
      formElement.classList.add("hidden-force");
    }

    // Handle items list
    const ecomListElement = formElement.querySelector(`.${EL_CLASS_CART_LIST}`) as HTMLElement;
    if (ecomListElement) {

      const itemsContainer = document.createElement('div');
      const itemsHTML = data.reduce(async (result: any, item: any) => {
        await loadImageAsBase64(item.product?.name).then((base64Data) => {
          return `
              ${result} 
              ${cartItemTemplate
            .replace('{{cartImage}}', item.product?.image || '')
            .replace('{{cartId}}', item.id.toString())
            .replace('{{cartName}}', base64Data)
            .replace('{{cartNamePrompt}}', item.product?.name || '')
            .replace('{{cartCompany}}', item.product?.company?.name || '')
            .replace('{{cartPrice}}', item.product?.price || '')
          }`;
        }).catch((error) => {
          console.error(error.message);
        });
      }, '');
      itemsContainer.innerHTML = itemsHTML;

      // Clear template list
      const listElement = ecomListElement.cloneNode(true) as HTMLElement;
      listElement.removeAttribute('data-wf-collection');
      listElement.removeAttribute('data-wf-template-id');
      if (listElement.hasChildNodes()) {
        const childNodes: Array<any> = Object.entries(listElement.childNodes).map(
          ([_, childNode]) => childNode
        );
        for (const childNode of childNodes) {
          listElement.removeChild(childNode);
        }
      }
      listElement.appendChild(itemsContainer);
      ecomListElement.parentNode.replaceChild(listElement, ecomListElement);

    }

    ecomFormElement.parentNode.replaceChild(formElement, ecomFormElement);

  }

  // Init empty cart
  const ecomEmptyElement = document.querySelector(`.${EL_CLASS_CART_EMPTY}`) as HTMLElement;
  if (ecomEmptyElement) {
    const emptyElement = ecomEmptyElement.cloneNode(true) as HTMLElement;
    emptyElement.removeAttribute('data-wf-collection');
    emptyElement.removeAttribute('data-wf-template-id');
    emptyElement.classList.remove("hidden-force");
    emptyElement.classList.remove("flex-force");
    if (data.length) {
      emptyElement.classList.add("hidden-force");
    } else {
      emptyElement.classList.add("flex-force");
    }
    ecomEmptyElement.parentNode.replaceChild(emptyElement, ecomEmptyElement);
  }

}

const updateSummaryAmount = async (data: CartItem[]) => {

  // Init amount
  let amount: number = 0;
  if (data.length) {
    amount = data.reduce((result: number, item: any) => {
      return result + (item.product?.price || 0);
    }, 0) * 100;
  }

  // Update payment discount
  const discountElement = document.getElementById(EL_ID_PAYMENT_DISCOUNT_BADGE) as HTMLElement;
  if (discountElement) {
    discountElement.classList.add('hidden-force');
    discountElement.innerHTML = `Discount ฿ ${0}`;
  }

  // Update payment summary
  const summaryElement = document.getElementById(`.${EL_ID_PAYMENT_SUMMARY}`) as HTMLElement;
  if (summaryElement) {
    summaryElement.innerText = `฿ ${THB.format(amount / 100 || 0)}`;
  }

  // Update payment total
  const totalElement = document.getElementById(`.${EL_ID_PAYMENT_TOTAL}`) as HTMLElement;
  if (totalElement) {
    totalElement.innerText = `฿ ${THB.format(amount / 100 || 0)}`;
  }

}

export const updateSummaryItems = (data: CartItem[]) => {
  // Batch update summary
  updateSummaryList(data);
  updateSummaryAmount(data);
}

export const createOmiseElement = (amount: number) => {

  // Init form
  const formElement = document.createElement('form');
  formElement.id = EL_ID_CHECKOUT_OMISE_FORM;
  formElement.method = 'GET';
  formElement.action = PAYMENT_PROCESS_PAGE;

  // Config form
  const scriptElement = document.createElement('script');
  scriptElement.id = EL_ID_CHECKOUT_OMISE_SCRIPT;
  scriptElement.type = 'text/javascript';
  scriptElement.src = 'https://cdn.omise.co/omise.js';
  scriptElement.setAttribute('data-key', 'pkey_test_5x66z2s0d6z4aobvn7f');
  scriptElement.setAttribute('data-button-label', `Checkout 0.00 THB`);
  scriptElement.setAttribute('data-amount', amount.toString());
  scriptElement.setAttribute('data-currency', 'THB');
  scriptElement.setAttribute('data-default-payment-method', 'credit_card');
  scriptElement.setAttribute('data-other-payment-methods', 'alipay,alipay_cn,alipay_hk,convenience_store,pay_easy,net_banking,googlepay,internet_banking,internet_banking_bay,internet_banking_bbl,mobile_banking_bay,mobile_banking_bbl,mobile_banking_kbank,mobile_banking_ktb,mobile_banking_scb,promptpay,points_citi,rabbit_linepay,shopeepay,truemoney');

  // Set script to form
  formElement.appendChild(scriptElement);

  formElement?.addEventListener('submit', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const formData = new FormData(formElement);
    for (const entry of (formData as any).entries()) {
      const [key, value] = entry;
      console.log(`${key}: ${value}`);
    }
  });

  return formElement;

}

export const PaymentListener = async (): Promise<void> => {

  const initializeElements = (data: CartItem[]) => {
    updateSummaryItems(data);
  }

  const load = () => {
    return new Promise(async (resolve) => {
      await getCartItems().then(async (data: CartItem[]) => {
        initializeElements(data);
        resolve(data);
      }).catch((error) => {
        alert(error);
      });
    });
  }

  const element = document.getElementById(EL_ID_ORDER_SUMMARY) as HTMLElement;
  if (element) {
    load();
  }

  const chargeElement = document.getElementById(EL_ID_CHART_BTN) as HTMLElement;
  if (chargeElement) {
    const omiseElement = createOmiseElement(0);
    chargeElement.parentElement.replaceChild(omiseElement, chargeElement);
  }

}