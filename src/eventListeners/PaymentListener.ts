
import {
  EL_ID_CHECKOUT_OMISE_FORM,
  EL_ID_PAYMENT_ITEM_SAMPLE,
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
  EL_ID_CHECKOUT_OMISE_BTN,
  EL_ID_PAYMENT_CHECKOUT_BTN,
  EL_ID_PAYMENT_FORM,
  EL_ID_PAYMENT_CHECKBOX_ALL,
  EL_NAME_PAYMENT_CHECKBOX,
  EL_ID_USER_TAB_PAYMENT,
  EL_ID_PAYMENT_COUNT
} from "../constants/elements";
import { MSG_ERR_EMPTY_ORDER, MSG_INFO_OMISE, MSG_LOADING } from "../constants/messages";
import { PAYMENT_REDIRECT } from "../constants/configs";
import { DATA_ATT_EMPTY, DATA_ATT_PAYMENT_RETURN_URI, DATA_ATT_WAIT } from "../constants/attributes";

import { updateOrders } from "./OrderListener";
import { removeCartItem, updateCartItems } from "./CartListener";

import { loadImageAsBase64 } from "../utils/image";

import { getCartItems } from "../api/cart";
import { createOrder } from "../api/order";

import { CartItem } from "../models/cart";
import { URL_USER } from "../constants/urls";
import { LANG_PREF_CN, LANG_PREF_TH } from "../constants/languages";

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

const updatePaymentList = async (data: CartItem[]) => {

  const sampleItemElement = document.getElementById(EL_ID_PAYMENT_ITEM_SAMPLE) as HTMLElement;
  if (sampleItemElement) {

    const itemTemplateElement = sampleItemElement.cloneNode(true) as HTMLElement;
    sampleItemElement.classList.add('hidden-force');

    const listElement = document.getElementById(EL_ID_PAYMENT_LIST) as HTMLElement;
    if (listElement) {

      // Clear list
      if (listElement.hasChildNodes()) {
        const childNodes: Array<any> = Object.entries(listElement.childNodes).map(
          ([_, childNode]) => childNode
        );
        for (const childNode of childNodes) {
          if (childNode.id !== EL_ID_PAYMENT_ITEM_SAMPLE) {
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

        const itemCheckboxElement = itemElement.querySelector(`input[name="${EL_NAME_PAYMENT_CHECKBOX}"]`) as HTMLInputElement;
        if (itemCheckboxElement) {
          itemCheckboxElement.setAttribute('value', item.product.details.id);
        }

        const itemNameElement = itemElement.querySelector(`.${EL_CLASS_PAYMENT_ITEM_NAME}`) as HTMLElement;
        if (itemNameElement) {
          itemNameElement.innerHTML = item.product.name;
        }

        const itemImgElement = itemElement.querySelector(`.${EL_CLASS_PAYMENT_ITEM_IMG}`) as HTMLImageElement;
        if (itemImgElement) {
          itemImgElement.crossOrigin = 'anonymous';
          itemImgElement.setAttribute('crossorigin', 'anonymous');
          itemImgElement.src = '';
          itemImgElement.srcset = '';
          loadImageAsBase64(item.product.image.marked).then((base64Data) => {
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
          itemSizeElement.innerHTML = item.product.details.package
            ? `${item.product.details.package.width}x${item.product.details.package.height}`
            : '-';
        }

        const itemPriceElement = itemElement.querySelector(`.${EL_CLASS_PAYMENT_ITEM_PRICE}`) as HTMLElement;
        if (itemPriceElement) {
          itemPriceElement.innerHTML = `฿ ${THBcompact.format(item.product.price || 0)}`;
        }

        const itemRemoveButtonElement = itemElement.querySelector(`.${EL_CLASS_PAYMENT_ITEM_REMOVE_BTN}`) as HTMLElement;
        if (itemRemoveButtonElement) {
          itemRemoveButtonElement.style.cursor = 'pointer';
          itemRemoveButtonElement.addEventListener('click', async () => {
            removeCartItem(item.id, item.product.name).then(async () => {
              await getCartItems().then(async (updatedData: CartItem[]) => {
                updateCartItems(updatedData);
                updatePaymentItems(updatedData);
              }).catch((error) => {
                alert(error);
              });
            }).catch((error) => {
              alert(error);
            });
          });
        }

        listElement.appendChild(itemElement);

      }
    }

  }

}

const updatePaymentAmount = async (data: CartItem[]) => {

  // Init amount
  let amount: number = 0;
  if (data.length) {
    amount = data.reduce((result: number, item: any) => {
      return result + (item.product?.price || 0);
    }, 0);
  }

  // Update payment discount
  const discountElement = document.getElementById(EL_ID_PAYMENT_DISCOUNT_BADGE) as HTMLElement;
  if (discountElement) {
    discountElement.classList.add('hidden-force');
    discountElement.innerHTML = `Discount ฿ ${0}`;
  }

  // Update payment summary
  const summaryElement = document.getElementById(EL_ID_PAYMENT_SUMMARY) as HTMLElement;
  if (summaryElement) {
    summaryElement.innerText = `฿ ${THBcompact.format(amount || 0)}`;
  }

  // Update payment total
  const totalElement = document.getElementById(EL_ID_PAYMENT_TOTAL) as HTMLElement;
  if (totalElement) {
    totalElement.innerText = `฿ ${THBcompact.format(amount || 0)}`;
  }

}

const resetPaymentAmount = async () => {

  // Init amount
  let amount: number = 0;

  // Update payment discount
  const discountElement = document.getElementById(EL_ID_PAYMENT_DISCOUNT_BADGE) as HTMLElement;
  if (discountElement) {
    discountElement.classList.add('hidden-force');
    discountElement.innerHTML = `Discount ฿ ${0}`;
  }

  // Update payment summary
  const summaryElement = document.getElementById(EL_ID_PAYMENT_SUMMARY) as HTMLElement;
  if (summaryElement) {
    summaryElement.innerText = `฿ 0`;
  }

  // Update payment total
  const totalElement = document.getElementById(EL_ID_PAYMENT_TOTAL) as HTMLElement;
  if (totalElement) {
    totalElement.innerText = `฿ 0`;
  }

}

const updatePaymentCount = (data: CartItem[]) => {
  const element = document.getElementById(EL_ID_PAYMENT_COUNT) as HTMLElement;
  if (element) {
    element.innerText = data.length.toString();
  }
};

export const updatePaymentItems = (data: CartItem[]) => {
  // Batch update summary
  updatePaymentCount(data);
  updatePaymentList(data);
  resetPaymentAmount();
}

export const PaymentListener = async (): Promise<void> => {

  const initializeElements = (data: CartItem[]) => {
    updatePaymentItems(data);
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

  const element = document.getElementById(EL_ID_PAYMENT_FORM) as HTMLFormElement;
  if (element) {

    const msgEmpty: string = element.getAttribute(DATA_ATT_EMPTY) || MSG_ERR_EMPTY_ORDER;
    const msgWait: string = element.getAttribute(DATA_ATT_WAIT) || MSG_LOADING;

    element.addEventListener('submit', async (event) => {
      event.preventDefault();
      event.stopPropagation();
      let paymentButtonLabel = 'Pay';
      const paymentButtonElement = document.getElementById(EL_ID_PAYMENT_CHECKOUT_BTN) as HTMLInputElement;
      if (paymentButtonElement) {
        paymentButtonLabel = paymentButtonElement.getAttribute('value');
        paymentButtonElement.setAttribute('value', msgWait);
      }
      const formData = new FormData(element);
      const checks = formData.getAll(EL_NAME_PAYMENT_CHECKBOX) as string[];
      await getCartItems().then(async (data: CartItem[]) => {
        const items = data.filter(
          (item: CartItem) => checks.includes(item.product.details.id.toString())
        );
        if (items.length) {
          await createOrder(items).then(async (data: any) => {
            const omiseFormElement = document.getElementById(EL_ID_CHECKOUT_OMISE_FORM) as HTMLFormElement;
            if (omiseFormElement) {
              const omiseDescriptionElement = omiseFormElement.querySelector('input[name="omiseDescription"]') as HTMLInputElement;
              omiseDescriptionElement?.setAttribute('value', `${MSG_INFO_OMISE} (${data.orders.join(', ')})`);
              const ordersElement = omiseFormElement.querySelector('input[name="orders"]') as HTMLInputElement;
              ordersElement?.setAttribute('value', data.orders.join(','));
              const omiseScriptElement = omiseFormElement.querySelector('script') as HTMLElement;
              if (omiseScriptElement) {
                omiseScriptElement.setAttribute('data-amount', (data.total * 100).toString());
                omiseScriptElement.setAttribute(
                  'data-button-label',
                  `Checkout ${THBcompact.format(data.total || 0)} THB`
                );
              }
              const omiseButtonElement = document.querySelector(`.${EL_ID_CHECKOUT_OMISE_BTN}`) as HTMLElement;
              if (omiseButtonElement) {
                omiseButtonElement.innerHTML = `Checkout ${THBcompact.format(data.total || 0)} THB`;
                omiseButtonElement.click();
              }
              const omiseReturnURIElement = omiseFormElement.querySelector('input[name="omiseReturnURI"]') as HTMLInputElement;
              if (!omiseReturnURIElement) {
                const returnURI = element.getAttribute(DATA_ATT_PAYMENT_RETURN_URI) || '';
                if (returnURI) {
                  omiseReturnURIElement.setAttribute('value', returnURI);
                } else {
                  omiseReturnURIElement.setAttribute('value', PAYMENT_REDIRECT);
                }
              }
            }
            getCartItems().then((updatedData: CartItem[]) => {
              updateCartItems(updatedData);
              updatePaymentItems(updatedData);
            }).catch((error) => {
              alert(error);
            });
            updateOrders();
            const path: string = window.location.pathname;
            if (path === `/${URL_USER}` || path === `/${LANG_PREF_TH}${URL_USER}` || path === `/${LANG_PREF_CN}${URL_USER}`) {
              const tabPaymentElement = document.getElementById(EL_ID_USER_TAB_PAYMENT) as HTMLElement;
              tabPaymentElement?.click();
            }
          }).catch((error) => {
            alert(error);
          });
        } else {
          alert(msgEmpty)
        }
      }).catch((error) => {
        alert(error);
      });
      paymentButtonElement.setAttribute('value', paymentButtonLabel);
    });

    element.addEventListener('change', async () => {
      const formData = new FormData(element);
      const checks = formData.getAll(EL_NAME_PAYMENT_CHECKBOX) as string[];
      await getCartItems().then(async (data: CartItem[]) => {
        const items = data.filter(
          (item: CartItem) => checks.includes(item.product.details.id.toString())
        );
        updatePaymentAmount(items);
      }).catch((error) => {
        alert(error);
      });
    });

    load();

  }

  const checkboxAllElement = document.getElementById(EL_ID_PAYMENT_CHECKBOX_ALL) as HTMLInputElement;
  if (checkboxAllElement) {
    checkboxAllElement.addEventListener('change', async (event: any) => {
      const checkboxElements = document.querySelectorAll(`[name="${EL_NAME_PAYMENT_CHECKBOX}"]`) as NodeListOf<HTMLInputElement>;
      if (checkboxElements.length) {
        for (const [_, checkboxElement] of Object.entries(checkboxElements)) {
          checkboxElement.checked = event.target.checked;
        }
      }
    });
  }

}