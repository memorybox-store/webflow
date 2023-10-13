
import {
  EL_CLASS_CART_EMPTY,
  EL_CLASS_CART_FORM,
  EL_CLASS_CART_LIST,
  EL_ID_CHECKOUT_OMISE_FORM,
  EL_ID_CART_BTN,
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
  EL_CLASS_PAYMENT_ITEM_IMG,
  EL_ID_USER_CHECKOUT_BTN,
  EL_ID_CHECKOUT_OMISE_BTN,
  EL_ID_PAYMENT_CHECKOUT_BTN,
  EL_ID_PAYMENT_FORM
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
    sampleItemElement.classList.add('hidden-force');

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
        itemElement.classList.remove('hidden-force');
        itemElement.style.display = '';

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
          itemPriceElement.innerHTML = `฿ ${THBcompact.format(item.product.price || 0)}`;
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
        await loadImageAsBase64(item.product?.image).then((base64Data) => {
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
    summaryElement.innerText = `฿ ${THBcompact.format(amount / 100 || 0)}`;
  }

  // Update payment total
  const totalElement = document.getElementById(`.${EL_ID_PAYMENT_TOTAL}`) as HTMLElement;
  if (totalElement) {
    totalElement.innerText = `฿ ${THBcompact.format(amount / 100 || 0)}`;
  }

}

export const updateSummaryItems = (data: CartItem[]) => {
  // Batch update summary
  updateSummaryList(data);
  updateSummaryAmount(data);
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

  const element = document.getElementById(EL_ID_PAYMENT_FORM) as HTMLElement;
  if (element) {
    load();
  }

  const paymentButtonElement = document.getElementById(EL_ID_PAYMENT_CHECKOUT_BTN) as HTMLElement;
  if (paymentButtonElement) {
    const paymentElement = paymentButtonElement.cloneNode(true) as HTMLElement;
    paymentElement.setAttribute('type', 'button');
    paymentElement.addEventListener('click', async () => {
      const omiseButtonElement = document.querySelector(`.${EL_ID_CHECKOUT_OMISE_BTN}`) as HTMLElement;
      if (omiseButtonElement) {
        omiseButtonElement.click();
      }
    });
    paymentButtonElement.parentElement.replaceChild(paymentElement, paymentButtonElement);
  }

}