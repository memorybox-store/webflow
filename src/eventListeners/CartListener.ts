
import {
  EL_CLASS_CART_FORM,
  EL_CLASS_CART_LIST,
  EL_ID_CART_BADGE
} from "../constants/elements";
import { cartItemTemplate, cartModalTemplate } from "../templates/cart";

import { getCartItems } from "../api/cart";

var cartItems: Array<any> = [];

const updateCartBadge = (data: Array<any>) => {
  const element: HTMLElement
    = document.getElementById(EL_ID_CART_BADGE) as HTMLElement;
  if (element) {
    element.textContent = data.length.toString();
  }
};

const updateCartList = (data: Array<any>) => {
  const forms: HTMLCollectionOf<HTMLElement>
    = document.getElementsByClassName(EL_CLASS_CART_FORM) as HTMLCollectionOf<HTMLElement>;
  if (forms && forms.length) {
    for (const [_, node] of Object.entries(forms)) {
      node.style.display = data.length ? 'block' : 'none';
    }
  }
  const elements: HTMLCollectionOf<HTMLElement>
    = document.getElementsByClassName(EL_CLASS_CART_LIST) as HTMLCollectionOf<HTMLElement>;
  if (elements && elements.length) {
    for (const [_, node] of Object.entries(forms)) {
      const container: HTMLElement = document.createElement('div');
      const innerHTML = data.reduce((result: any, item: any) => {
        return `
          ${result} 
          ${cartItemTemplate
            .replace('{{imageSource}}', item.product?.image)
            .replace('{{cartId}}', item.cartId)
          }`;
      }, '');
      container.innerHTML = innerHTML;
      if (node) {
        node.appendChild(container);
      }
    }
  }
}

export const updateCartItems = (data: Array<any>) => {
  cartItems = data;
  updateCartBadge(data);
  updateCartList(data);
}

export const CartListener = (): void => {

  const setCartItems = (data: Array<any>) => {
    cartItems = data;
    const element: HTMLElement
      = document.getElementById(EL_ID_CART_BADGE) as HTMLElement;
    if (element) {
      element.removeAttribute('data-wf-bindings');
      const replacedElement: HTMLElement = element.cloneNode(true) as HTMLElement;
      replacedElement.textContent = data.length.toString();
      element.parentNode.replaceChild(replacedElement, element);
    }
    updateCartBadge(data);
    updateCartList(data);
  }

  const loadCart = () => {
    return new Promise(async (resolve) => {
      await getCartItems().then(async (data: Array<any>) => {
        console.log('CART', data);
        setCartItems(data);
        resolve(data);
      }).catch((error) => {
        alert(error);
      });
    });
  }

  const createCartModal = () => {

    // Create a temporary container element
    const container = document.createElement('div');

    // Parse the HTML string into a DOM element
    container.innerHTML = cartModalTemplate;

    // Append the element to the document body or another target element
    const targetElement = document.querySelector('#cart-modal'); // Replace with the selector of your target element
    if (targetElement) {
      targetElement.appendChild(container);
    } else {
      document.body.appendChild(container);
    }
  }

  const element: HTMLElement
    = document.getElementById(EL_ID_CART_BADGE) as HTMLElement;
  if (element) {
    loadCart();
    // createCartModal();
  }

}