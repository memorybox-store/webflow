
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
  EL_ID_CHECKOUT_OMISE_SCRIPT
} from "../constants/elements";
import { cartItemTemplate } from "../templates/cart";

import { getCartItems, removeItemFromCart } from "../api/cart";
import { CartItem } from "../models/cart";
import omise from "../config/omise";

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

const removeCartItem = (cartId: string, cartName: string) => {
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
  const element: HTMLElement
    = document.getElementById(EL_ID_CART_BADGE) as HTMLElement;
  if (element) {
    const replacedElement: HTMLElement = element.cloneNode(true) as HTMLElement;
    replacedElement.removeAttribute('data-wf-bindings');
    replacedElement.innerText = data.length.toString();
    element.parentNode.replaceChild(replacedElement, element);
  }
};

const updateCartList = (data: CartItem[]) => {

  const formElements: HTMLCollectionOf<HTMLElement>
    = document.getElementsByClassName(EL_CLASS_CART_FORM) as HTMLCollectionOf<HTMLElement>;
  if (formElements && formElements.length) {
    for (const [_, formNode] of Object.entries(formElements)) {

      const formElement: HTMLElement = formNode.cloneNode(true) as HTMLElement;
      formElement.removeAttribute('data-node-type');
      formElement.classList.remove("hidden-force");
      formElement.classList.remove("flex-force");
      if (data.length) {
        formElement.classList.add("flex-force");
      } else {
        formElement.classList.add("hidden-force");
      }

      const listElements: HTMLCollectionOf<HTMLElement>
        = formElement.getElementsByClassName(EL_CLASS_CART_LIST) as HTMLCollectionOf<HTMLElement>;
      if (listElements && listElements.length) {
        for (const [_, listNode] of Object.entries(listElements)) {
          const itemsContainer: HTMLElement = document.createElement('div');
          const itemsHTML = data.reduce((result: any, item: any) => {
            return `
              ${result} 
              ${cartItemTemplate
                .replace('{{cartImage}}', item.product?.image || '')
                .replace('{{cartId}}', item.id.toString())
                .replace('{{cartName}}', item.product?.name || '')
                .replace('{{cartNamePrompt}}', item.product?.name || '')
                .replace('{{cartCompany}}', item.product?.company?.name || '')
                .replace('{{cartPrice}}', item.product?.price || '')
              }`;
          }, '');
          itemsContainer.innerHTML = itemsHTML;

          const listElement: HTMLElement = listNode.cloneNode(true) as HTMLElement;
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
          listNode.parentNode.replaceChild(listElement, listNode);

        }

      }

      formNode.parentNode.replaceChild(formElement, formNode);


      const removeElements: HTMLCollectionOf<HTMLElement>
        = document.getElementsByClassName('cart-remove-button') as HTMLCollectionOf<HTMLElement>;
      if (removeElements && removeElements.length) {
        for (const [_, removeNode] of Object.entries(removeElements)) {
          removeNode.addEventListener('click', async () => {
            const cartId = removeNode.getAttribute('data-target');
            if (cartId) {
              const cartName = removeNode.getAttribute('data-name') || '';
              removeCartItem(cartId, cartName).then(async () => {
                await getCartItems().then(async (updatedData: CartItem[]) => {
                  updateCartItems(updatedData);
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
  }

  const emptyElements: HTMLCollectionOf<HTMLElement>
    = document.getElementsByClassName(EL_CLASS_CART_EMPTY) as HTMLCollectionOf<HTMLElement>;
  if (emptyElements && emptyElements.length) {
    for (const [_, emptyNode] of Object.entries(emptyElements)) {
      const emptyElement: HTMLElement = emptyNode.cloneNode(true) as HTMLElement;
      emptyElement.removeAttribute('data-wf-collection');
      emptyElement.removeAttribute('data-wf-template-id');
      emptyElement.classList.remove("hidden-force");
      emptyElement.classList.remove("flex-force");
      if (data.length) {
        emptyElement.classList.add("hidden-force");
      } else {
        emptyElement.classList.add("flex-force");
      }
      emptyNode.parentNode.replaceChild(emptyElement, emptyNode);
    }
  }

}

const updateCartAmount = async (data: CartItem[]) => {
  let amount: number = 0;
  if (data.length) {
    amount = data.reduce((result: number, item: any) => {
      return result + (item.product?.price || 0);
    }, 0) * 100;
  }
  const elements: HTMLCollectionOf<HTMLElement>
    = document.getElementsByClassName(EL_CLASS_CART_AMOUNT) as HTMLCollectionOf<HTMLElement>;
  if (elements && elements.length) {
    for (const [_, node] of Object.entries(elements)) {
      const replacedElement: HTMLElement = node.cloneNode(true) as HTMLElement;
      replacedElement.removeAttribute('data-wf-bindings');
      replacedElement.innerText = data.length.toString();
      replacedElement.innerText = `฿ ${THB.format(amount/100 || 0)} THB`;
      node.parentNode.replaceChild(replacedElement, node);
    }
  }
  const modalCheckOutFormScript = document.getElementById(EL_ID_CHECKOUT_OMISE_SCRIPT) as HTMLElement;
  if (modalCheckOutFormScript) {
    modalCheckOutFormScript.setAttribute('data-amount', amount.toString());
    modalCheckOutFormScript.setAttribute(
      'data-button-label',
      `Pay ${THBcompact.format(amount/100 || 0)} THB`
    );
    const checkoutButtonElement = document.querySelector(`.${EL_ID_CHECKOUT_OMISE_BTN}`);
    if (checkoutButtonElement) {
      console.log(checkoutButtonElement);
      checkoutButtonElement.innerHTML = `Pay ${THBcompact.format(amount/100 || 0)} THB`;
    }
  }
}

export const updateCartItems = (data: CartItem[]) => {

  updateCartBadge(data);
  updateCartList(data);
  updateCartAmount(data);

  const addedItems = data.map((item: CartItem) => item.product.id.toString());
  const addButtonElements: HTMLCollectionOf<HTMLElement>
    = document.getElementsByClassName(EL_CLASS_ADD_TO_CART_BTN) as HTMLCollectionOf<HTMLElement>;
  if (addButtonElements) {
    for (const [_, addNode] of Object.entries(addButtonElements)) {
      const productId = addNode.getAttribute('data-target');
      if (productId) {
        if (addedItems.includes(productId.toString())) {
          addNode.classList.add('disabled');
          addNode.innerText = 'Added';
        } else {
          addNode.classList.remove('disabled');
          addNode.innerText = 'Add to Cart';
        }
      } else {
        addNode.classList.remove('disabled');
        addNode.innerText = 'Add to Cart';
      }
    }
  }

}

export const createOmiseElement = (amount: number) => {

  // Creating a form element
  const formElement = document.createElement('form');
  formElement.id = EL_ID_CHECKOUT_OMISE_FORM;
  formElement.method = 'GET';
  formElement.action = 'https://hooks.webflow.com/logic/64bf3a6357b2eb45b38e5e39/o-fFRyRn1mQ/';

  // Creating a script element
  const scriptElement = document.createElement('script');
  scriptElement.id = EL_ID_CHECKOUT_OMISE_SCRIPT;
  scriptElement.type = 'text/javascript';
  scriptElement.src = 'https://cdn.omise.co/omise.js';
  scriptElement.setAttribute('data-key', 'pkey_test_5x66z2s0d6z4aobvn7f');
  scriptElement.setAttribute('data-button-label', `Pay 0.00 THB`);
  scriptElement.setAttribute('data-amount', amount.toString());
  scriptElement.setAttribute('data-currency', 'THB');
  scriptElement.setAttribute('data-default-payment-method', 'credit_card');
  scriptElement.setAttribute('data-other-payment-methods', 'alipay,alipay_cn,alipay_hk,convenience_store,pay_easy,net_banking,googlepay,internet_banking,internet_banking_bay,internet_banking_bbl,mobile_banking_bay,mobile_banking_bbl,mobile_banking_kbank,mobile_banking_ktb,mobile_banking_scb,promptpay,points_citi,rabbit_linepay,shopeepay,truemoney');

  // Appending the script element to the form element
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

  // Appending the form element to the target element
  return formElement;

}

export const CartListener = async (): Promise<void> => {

  const initializeElements = (data: CartItem[]) => {
    updateCartItems(data);
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

  const modalElement: HTMLElement = document.querySelector(`[data-node-type="${EL_DNT_MODAL_CART}"]`);
  if (modalElement) {
    modalElement.parentNode.removeChild(modalElement);
    document.querySelector('body')?.appendChild(modalElement);
    const modalLinkElement: HTMLElement = document.querySelector(`[data-node-type="${EL_DNT_MODAL_CART_OPEN_LINK}"]`);
    modalLinkElement?.addEventListener('click', async () => {
      modalElement.classList.remove('hidden-force');
      modalElement.classList.add('flex-force');
    });
    const modalCloseElement: HTMLElement = document.querySelector(`[data-node-type="${EL_DNT_MODAL_CART_CLOSE_LINK}"]`);
    modalCloseElement?.addEventListener('click', async () => {
      modalElement.classList.remove('flex-force');
      modalElement.classList.add('hidden-force');
    });
  }

  const element = document.getElementById(EL_ID_CART_BADGE) as HTMLElement;
  if (element) {
    load();
  }

  const checkoutElement = document.querySelector(`[data-node-type="${EL_DNT_CHECKOUT_BTN}"]`);
  if (checkoutElement) {
    const omiseElement = createOmiseElement(0);
    checkoutElement.parentElement.replaceChild(omiseElement, checkoutElement);
    const checkoutButtonElement = document.querySelector(`.${EL_ID_CHECKOUT_OMISE_BTN}`);
    if (checkoutButtonElement) {
      console.log(checkoutButtonElement);
      checkoutButtonElement.innerHTML = 'Pay';
    }
  }

}