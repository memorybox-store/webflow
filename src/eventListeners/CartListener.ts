
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
  EL_ID_CHECKOUT_OMISE_SCRIPT,
  EL_CLASS_REMOVE_BTN,
  EL_ID_CART_CHECKOUT_BTN,
  EL_ID_CHECKOUT_OMISE_FORM,
  EL_CLASS_ADD_TO_CART_POPUP_BTN
} from "../constants/elements";
import { cartItemTemplate } from "../templates/cart";

import { getCartItems, removeItemFromCart } from "../api/cart";
import { CartItem } from "../models/cart";
import { PAYMENT_REDIRECT } from "../constants/configs";
import { MSG_INFO_OMISE } from "../constants/messages";
import { getStorage } from "../utils/storage";
import { Session } from "../models/user";
import { NAME_CART_ADD, NAME_CART_ADDED } from "../constants/names";
import { updatePaymentItems } from "./PaymentListener";

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
    if (confirm(`Do you want to remove "${cartName}" from cart?`)) {
      await removeItemFromCart(cartId).then(async (data: CartItem[]) => {
        resolve(data);
      }).catch((error) => {
        reject(error);
      });
    }
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
              await getCartItems().then(async (updatedData: CartItem[]) => {
                updateCartItems(updatedData);
                updatePaymentItems(updatedData);
              }).catch((error) => {
                alert(error);
              });
            }).catch((error) => {
              alert(error);
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
      await getCartItems().then(async (data: CartItem[]) => {
        initializeElements(data);
        resolve(data);
      }).catch((error) => {
        alert(error);
      });
    });
  }

  const element = document.getElementById(EL_ID_CART_BADGE) as HTMLElement;
  if (element) {
    load();
  }

  // Init checkout button
  const ecomCheckoutElement = document.querySelector(`[data-node-type="${EL_DNT_CHECKOUT_BTN}"]`);
  if (ecomCheckoutElement) {
    ecomCheckoutElement.removeAttribute('data-node-type');
    const checkoutButtonElement = ecomCheckoutElement.cloneNode(true) as HTMLElement;
    checkoutButtonElement.id = EL_ID_CART_CHECKOUT_BTN;
    checkoutButtonElement.setAttribute('href', './user#cart');
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