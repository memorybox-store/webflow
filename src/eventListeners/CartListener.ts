
import {
  EL_CLASS_CART_AMOUNT,
  EL_CLASS_CART_EMPTY,
  EL_CLASS_CART_FORM,
  EL_CLASS_CART_LIST,
  EL_ID_CART_BADGE,
  EL_ID_CHECKOUT_BTN,
  EL_ID_CHECKOUT_OMISE_FORM
} from "../constants/elements";
import { cartItemTemplate } from "../templates/cart";

import { getCartItems, removeItemFromCart } from "../api/cart";
import { CartItem } from "../models/cart";

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
      replacedElement.innerText = `฿ ${amount.toFixed()} THB`;
      node.parentNode.replaceChild(replacedElement, node);
    }
  }
  const modalCheckOutFormElement = document.getElementById(EL_ID_CHECKOUT_OMISE_FORM) as HTMLElement;
  if (modalCheckOutFormElement) {
    const omiseElement = createOmiseElement(amount);
    modalCheckOutFormElement.parentNode.replaceChild(omiseElement, modalCheckOutFormElement);
  }
}

export const updateCartItems = (data: CartItem[]) => {

  updateCartBadge(data);
  updateCartList(data);
  updateCartAmount(data);

  const addedItems = data.map((item: CartItem) => item.product.id.toString());
  const addButtonElements: HTMLCollectionOf<HTMLElement>
    = document.getElementsByClassName('product-add-button') as HTMLCollectionOf<HTMLElement>;
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
  formElement.action = '/';

  // Creating a script element
  const scriptElement = document.createElement('script');
  scriptElement.type = 'text/javascript';
  scriptElement.src = 'https://cdn.omise.co/omise.js';
  scriptElement.setAttribute('data-key', 'pkey_test_5x66z2s0d6z4aobvn7f');
  scriptElement.setAttribute('data-amount', amount.toString());
  scriptElement.setAttribute('data-currency', 'THB');
  scriptElement.setAttribute('data-default-payment-method', 'credit_card');
  scriptElement.setAttribute('data-other-payment-methods', 'alipay,alipay_cn,alipay_hk,promptpay,truemoney,rabbit_linepay');

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

export const CartListener = (): void => {

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

  const modalElement: HTMLElement = document.querySelector('[data-node-type="commerce-cart-container-wrapper"]');
  if (modalElement) {
    modalElement.parentNode.removeChild(modalElement);
    document.querySelector('body')?.appendChild(modalElement);
    const modalLinkElement: HTMLElement = document.querySelector('[data-node-type="commerce-cart-open-link"]');
    modalLinkElement?.addEventListener('click', async () => {
      modalElement.classList.remove('hidden-force');
      modalElement.classList.add('flex-force');
    });
    const modalCloseElement: HTMLElement = document.querySelector('[data-node-type="commerce-cart-close-link"]');
    modalCloseElement?.addEventListener('click', async () => {
      modalElement.classList.remove('flex-force');
      modalElement.classList.add('hidden-force');
    });
    const modalCheckOutButtonElement: HTMLElement = document.querySelector('[data-node-type="cart-checkout-button"]');
    if (modalCheckOutButtonElement) {
      // const omiseElement = createOmiseElement(0);
      // modalCheckOutButtonElement.parentNode.replaceChild(omiseElement, modalCheckOutButtonElement);
    }
  }

  const element = document.getElementById(EL_ID_CART_BADGE) as HTMLElement;
  if (element) {
    load();
  }

  const checkoutElement = document.getElementById(EL_ID_CHECKOUT_BTN) as HTMLElement;
  if (checkoutElement) {
    const omiseElement = createOmiseElement(0);
    checkoutElement.parentElement.replaceChild(omiseElement, checkoutElement);
  }

}