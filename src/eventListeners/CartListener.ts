
import {
  EL_CLASS_CART_AMOUNT,
  EL_CLASS_CART_EMPTY,
  EL_CLASS_CART_FORM,
  EL_CLASS_CART_LIST,
  EL_ID_CART_BADGE
} from "../constants/elements";
import { cartItemTemplate, cartModalTemplate } from "../templates/cart";

import { getCartItems, removeItemFromCart } from "../api/cart";

var cartItems: Array<any> = [];

const removeCartItem = (cartId: string) => {
  return new Promise(async (resolve) => {
    await removeItemFromCart(cartId).then(async (data: Array<any>) => {
      resolve(data);
    }).catch((error) => {
      alert(error);
    });
  });
}

const updateCartBadge = (data: Array<any>) => {
  const element: HTMLElement
    = document.getElementById(EL_ID_CART_BADGE) as HTMLElement;
  if (element) {
    element.removeAttribute('data-wf-bindings');
    const replacedElement: HTMLElement = element.cloneNode(true) as HTMLElement;
    replacedElement.textContent = data.length.toString();
    element.parentNode.replaceChild(replacedElement, element);
  }
};

const updateCartList = async (data: Array<any>) => {
  const forms: HTMLCollectionOf<HTMLElement>
    = document.getElementsByClassName(EL_CLASS_CART_FORM) as HTMLCollectionOf<HTMLElement>;
  if (forms && forms.length) {
    console.log(forms);
    for (const [_, node] of Object.entries(forms)) {
      node.removeAttribute('data-node-type');
      node.style.display = data.length ? 'flex !important' : 'none !important';
      const replacedElement: HTMLElement = node.cloneNode(true) as HTMLElement;
      replacedElement.textContent = data.length.toString();
      node.parentNode.replaceChild(replacedElement, node);
      console.log(node);
    }
  }
  const emptyElements: HTMLCollectionOf<HTMLElement>
    = document.getElementsByClassName(EL_CLASS_CART_EMPTY) as HTMLCollectionOf<HTMLElement>;
  if (emptyElements && emptyElements.length) {
    console.log(emptyElements);
    for (const [_, node] of Object.entries(emptyElements)) {
      node.removeAttribute('data-wf-collection');
      node.removeAttribute('data-wf-template-id');
      node.style.display = data.length ? 'none !important' : 'flex !important';
      const replacedElement: HTMLElement = node.cloneNode(true) as HTMLElement;
      replacedElement.textContent = data.length.toString();
      node.parentNode.replaceChild(replacedElement, node);
      console.log(node);
    }
  }
  const elements: HTMLCollectionOf<HTMLElement>
    = document.getElementsByClassName(EL_CLASS_CART_LIST) as HTMLCollectionOf<HTMLElement>;
  if (elements && elements.length) {
    console.log(elements);
    for (const [_, node] of Object.entries(elements)) {
      console.log(node);
      const container: HTMLElement = document.createElement('div');
      const innerHTML = data.reduce((result: any, item: any) => {
        return `
          ${result} 
          ${cartItemTemplate
            .replace('{{cartImage}}', item.product?.image || '')
            .replace('{{cartId}}', item.id.toString())
            .replace('{{cartName}}', item.product?.name || '')
            .replace('{{cartCompany}}', item.product?.company?.name || '')
            .replace('{{cartPrice}}', item.product?.price || '')
          }`;
      }, '');
      container.innerHTML = innerHTML;
      if (node) {
        if (node.hasChildNodes()) {
          const childNodes: Array<any> = Object.entries(node.childNodes).map(
            ([_, childNode]) => childNode
          );
          for (const childNode of childNodes) {
            await node.removeChild(childNode);
          }
        }
        node.appendChild(container);
        const replacedElement: HTMLElement = node.cloneNode(true) as HTMLElement;
        replacedElement.textContent = data.length.toString();
        node.parentNode.replaceChild(replacedElement, node);
        const removeElements: HTMLCollectionOf<HTMLElement>
          = document.getElementsByClassName('cart-remove-button') as HTMLCollectionOf<HTMLElement>;
        if (removeElements && removeElements.length) {
          for (const [_, removeNode] of Object.entries(removeElements)) {
            removeNode.addEventListener('click', async () => {
              const cartId = removeNode.getAttribute('data-target');
              removeCartItem(cartId).then(() => {
                updateCartBadge(data);
                updateCartList(data);
                updateCartAmount(data);
              }).catch((error) => {
                alert(error);
              });
            });
          }
        }
      }
    }
  }
}

const updateCartAmount = (data: Array<any>) => {
  const elements: HTMLCollectionOf<HTMLElement>
    = document.getElementsByClassName(EL_CLASS_CART_AMOUNT) as HTMLCollectionOf<HTMLElement>;
  if (elements && elements.length) {
    console.log(elements);
    for (const [_, node] of Object.entries(elements)) {
      console.log(node);
      if (data.length) {
        node.removeAttribute('data-wf-bindings');
        node.textContent = `฿ ${data.reduce((result: number, item: any) => {
          return result + (item.product?.price || 0);
        }, 0).toString()
          } THB`;
      } else {
        node.textContent = '฿ 0 THB';
      }
    }
  }
}

export const updateCartItems = (data: Array<any>) => {
  cartItems = data;
  updateCartBadge(data);
  updateCartList(data);
  updateCartAmount(data);
}

export const CartListener = (): void => {

  const initializeElements = (data: Array<any>) => {
    cartItems = data;
    updateCartBadge(data);
    updateCartList(data);
    updateCartAmount(data);
  }

  const load = () => {
    return new Promise(async (resolve) => {
      await getCartItems().then(async (data: Array<any>) => {
        console.log('CART', data);
        initializeElements(data);
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
    load();
    // createCartModal();
  }

}