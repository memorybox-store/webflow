
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
  EL_CLASS_REMOVE_BTN,
  EL_ID_CART_CHECKOUT_BTN,
  EL_CLASS_ADD_TO_CART_POPUP_BTN
} from "../constants/elements";
import {
  NAME_CANCEL,
  NAME_CART_ADD,
  NAME_CART_ADDED,
  NAME_CONFIRM,
  NAME_OK
} from "../constants/names";
import { URL_LOGIN, URL_USER } from "../constants/urls";
import { MSG_ERR_UNKNOWN } from "../constants/messages";
import {
  DATA_ATT_CHECKOUT_URI,
  DATA_ATT_LOGIN_URI,
  DATA_ATT_REMOVE,
  DATA_ATT_REMOVE_BTN_CANCEL,
  DATA_ATT_REMOVE_BTN_CONFIRM
} from "../constants/attributes";

import * as tingle from 'tingle.js';

import { cartItemTemplate } from "../templates/cart";

import { updatePaymentItems } from "./PaymentListener";
import { getCartItems, removeItemFromCart } from "../api/cart";

import { CartItem } from "../models/cart";
import { authen } from "../api/user";
import { getStorage, setStorage } from "../utils/storage";

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

export const removeCartItem = (cartId: string, cartName: string) => {
  return new Promise(async (resolve, reject) => {

    const element = document.getElementById(EL_ID_CART_BADGE) as HTMLElement;

    const txtPrompt: string = element?.getAttribute(DATA_ATT_REMOVE) || `Do you want to remove {{name}} from cart?`;
    const txtConfirm: string = element?.getAttribute(DATA_ATT_REMOVE_BTN_CONFIRM) || NAME_CONFIRM;
    const txtCancel: string = element?.getAttribute(DATA_ATT_REMOVE_BTN_CANCEL) || NAME_CANCEL;

    const modalRemove = new tingle.modal({
      footer: true,
      stickyFooter: false,
      closeMethods: ['overlay', 'button', 'escape'],
      closeLabel: '',
      beforeClose: () => {
        return true;
      }
    });
    modalRemove.setContent(txtPrompt.replace('{{name}}', cartName));
    modalRemove.addFooterBtn(txtConfirm, 'tingle-btn tingle-btn--danger', async () => {
      modalRemove.close();
      await authen().then(async () => {
        await removeItemFromCart(cartId).then(async (data: CartItem[]) => {
          resolve(data);
        }).catch((error) => {
          reject(error);
        });
      }).catch(async () => {
        let cartItems: CartItem[] = [];
        await getStorage('cart-items', true).then(async (stored: []) => {
          if (stored && stored.length) {
            cartItems = stored as CartItem[];
          }
        });
        console.log(cartId);
        console.log(cartItems);
        const cartItem = cartItems.find((item: any) => item.id.toString() === cartId.toString());
        console.log(cartItem);
        await setStorage(
          'cart-items',
          cartItems.filter((item: any) => item.id.toString() !== cartId.toString()),
          true
        );
        resolve(cartItem);
      });
    });
    modalRemove.addFooterBtn(txtCancel, 'tingle-btn', () => modalRemove.close());
    modalRemove.open();

  });
}

const updateCartBadge = (data: CartItem[]) => {
  const element = document.getElementById(EL_ID_CART_BADGE) as HTMLElement;
  if (element) {
    const badgeElement = element.cloneNode(true) as HTMLElement;
    badgeElement.removeAttribute('data-wf-bindings');
    badgeElement.innerText = data.length.toString();
    element.parentNode.replaceChild(badgeElement, element);
  }
};

const updateCartList = (data: CartItem[]) => {

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
      const itemsHTML = data.reduce((result: any, item: any) => {
        return `
              ${result} 
              ${cartItemTemplate
            .replace('{{cartImage}}', item.product?.image.marked || '')
            .replace('{{cartId}}', item.id.toString())
            .replace('{{cartName}}', item.product?.name || '')
            .replace('{{cartNamePrompt}}', item.product?.name || '')
            .replace('{{cartCompany}}', item.product?.company?.name || '')
            .replace('{{cartPrice}}', item.product?.price || '')
          }`;
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

    // Init remove buttons
    const removeElements = document.querySelectorAll(`.${EL_CLASS_REMOVE_BTN}`) as NodeListOf<HTMLElement>;
    if (removeElements && removeElements.length) {
      for (const [_, removeElement] of Object.entries(removeElements)) {
        removeElement.addEventListener('click', async () => {
          const cartId = removeElement.getAttribute('data-target');
          if (cartId) {
            const cartName = removeElement.getAttribute('data-name') || '';
            removeCartItem(cartId, cartName).then(async () => {
              await authen().then(async () => {
                await getCartItems().then(async (updatedData: CartItem[]) => {
                  updateCartItems(updatedData);
                  updatePaymentItems(updatedData);
                }).catch((message) => {
                  modal.setContent(message || MSG_ERR_UNKNOWN);
                  modal.open();
                });
              }).catch(async () => {
                let cartItems: CartItem[] = [];
                await getStorage('cart-items', true).then(async (stored: []) => {
                  console.log(stored);
                  if (stored && stored.length) {
                    cartItems = stored as CartItem[];
                  }
                });
                updateCartItems(cartItems);
                updatePaymentItems(cartItems);
              });
            }).catch((message) => {
              modal.setContent(message || MSG_ERR_UNKNOWN);
              modal.open();
            });
          }
        });
      }
    }

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

const updateCartAmount = async (data: CartItem[]) => {

  // Init amount
  let amount: number = 0;
  if (data.length) {
    amount = data.reduce((result: number, item: any) => {
      return result + (item.product?.price || 0);
    }, 0) * 100;
  }

  // Update cart summary
  const ecomSummaryElement = document.querySelector(`.${EL_CLASS_CART_AMOUNT}`) as HTMLElement;
  if (ecomSummaryElement) {
    const summaryElement = ecomSummaryElement.cloneNode(true) as HTMLElement;
    summaryElement.removeAttribute('data-wf-bindings');
    summaryElement.innerText = `฿ ${THBcompact.format(amount / 100 || 0)} THB`;
    ecomSummaryElement.parentNode.replaceChild(summaryElement, ecomSummaryElement);
  }

}

export const updateCartItems = (data: CartItem[]) => {

  // Batch update cart
  updateCartBadge(data);
  updateCartList(data);
  updateCartAmount(data);

  // Update add buttons
  const addedItems = data.map((item: CartItem) => item.product.id.toString());
  const update = (elements: NodeListOf<HTMLElement>) => {
    if (elements.length) {
      for (const [_, addElement] of Object.entries(elements)) {
        const productId = addElement.getAttribute('data-target');
        if (productId) {
          if (addedItems.includes(productId.toString())) {
            addElement.classList.add('disabled');
            addElement.innerText = NAME_CART_ADDED;
          } else {
            addElement.classList.remove('disabled');
            addElement.innerText = NAME_CART_ADD;
          }
        } else {
          addElement.classList.remove('disabled');
          addElement.innerText = NAME_CART_ADD;
        }
      }
    }
  }
  const addButtonElements = document.querySelectorAll(`.${EL_CLASS_ADD_TO_CART_BTN}`) as NodeListOf<HTMLElement>;
  if (addButtonElements.length) {
    update(addButtonElements);
  }
  const addPopupButtonElements = document.querySelectorAll(`.${EL_CLASS_ADD_TO_CART_POPUP_BTN}`) as NodeListOf<HTMLElement>;
  if (addPopupButtonElements.length) {
    update(addPopupButtonElements);
  }

}

export const CartListener = async (): Promise<void> => {

  const initializeElements = (data: CartItem[]) => {
    updateCartItems(data);
    updatePaymentItems(data);
  }

  const load = () => {
    return new Promise(async (resolve) => {
      await authen().then(async () => {
        await getCartItems().then(async (data: CartItem[]) => {
          initializeElements(data);
          resolve(data);
        }).catch((message) => {
          modal.setContent(message || MSG_ERR_UNKNOWN);
          modal.open();
        });
      }).catch(async () => {
        let cartItems: CartItem[] = [];
        await getStorage('cart-items', true).then(async (stored: []) => {
          if (stored && stored.length) {
            cartItems = stored as CartItem[];
          }
        });
        initializeElements(cartItems);
        resolve(cartItems);
      });
    });
  }

  const element = document.getElementById(EL_ID_CART_BADGE) as HTMLElement;
  if (element) {

    load();

    const checkoutURI = element.getAttribute(DATA_ATT_CHECKOUT_URI) || `./${URL_USER}#cart`;
    const loginURI = element.getAttribute(DATA_ATT_LOGIN_URI) || `./${URL_LOGIN}`;

    // Init checkout button
    const ecomCheckoutElement = document.querySelector(`[data-node-type="${EL_DNT_CHECKOUT_BTN}"]`);
    if (ecomCheckoutElement) {
      ecomCheckoutElement.removeAttribute('data-node-type');
      const checkoutButtonElement = ecomCheckoutElement.cloneNode(true) as HTMLElement;
      checkoutButtonElement.id = EL_ID_CART_CHECKOUT_BTN;
      await authen().then(() => {
        checkoutButtonElement.setAttribute('href', checkoutURI);
      }).catch(() => {
        checkoutButtonElement.setAttribute('href', `${loginURI}?redirect=${encodeURIComponent(checkoutURI)}`);
      });
      checkoutButtonElement.addEventListener('click', async () => {
        const modalElement = document.querySelector(`[data-node-type="${EL_DNT_MODAL_CART}"]`) as HTMLElement;
        if (modalElement) {
          modalElement.classList.remove('flex-force');
          modalElement.classList.add('hidden-force');
        }
      });
      ecomCheckoutElement.parentElement.replaceChild(checkoutButtonElement, ecomCheckoutElement);
    }

    // Init cart modal
    const modalElement = document.querySelector(`[data-node-type="${EL_DNT_MODAL_CART}"]`) as HTMLElement;
    if (modalElement) {
      modalElement.parentNode.removeChild(modalElement);
      document.querySelector('body')?.appendChild(modalElement);
      const modalLinkElement = document.querySelector(`[data-node-type="${EL_DNT_MODAL_CART_OPEN_LINK}"]`) as HTMLElement;
      modalLinkElement?.addEventListener('click', async () => {
        modalElement.classList.remove('hidden-force');
        modalElement.classList.add('flex-force');
      });
      const modalCloseElement = document.querySelector(`[data-node-type="${EL_DNT_MODAL_CART_CLOSE_LINK}"]`) as HTMLElement;
      modalCloseElement?.addEventListener('click', async () => {
        modalElement.classList.remove('flex-force');
        modalElement.classList.add('hidden-force');
      });
    }

  }

}