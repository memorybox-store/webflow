
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

const removeCartItem = (cartId: string, cartName: string) => {
  return new Promise(async (resolve, reject) => {
    if (confirm(`Do you want to remove "${cartName}" from cart?`)) {
      await removeItemFromCart(cartId).then(async (data: Array<any>) => {
        resolve(data);
      }).catch((error) => {
        reject(error);
      });
    }
  });
}

const updateCartBadge = (data: Array<any>) => {
  const element: HTMLElement
    = document.getElementById(EL_ID_CART_BADGE) as HTMLElement;
  if (element) {
    const replacedElement: HTMLElement = element.cloneNode(true) as HTMLElement;
    replacedElement.removeAttribute('data-wf-bindings');
    replacedElement.textContent = data.length.toString();
    element.parentNode.replaceChild(replacedElement, element);
  }
};

const updateCartList = (data: Array<any>) => {

  const formElements: HTMLCollectionOf<HTMLElement>
    = document.getElementsByClassName(EL_CLASS_CART_FORM) as HTMLCollectionOf<HTMLElement>;
  if (formElements && formElements.length) {
    console.log(formElements);
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
      console.log(data.length ? 'flex' : 'none');

      const listElements: HTMLCollectionOf<HTMLElement>
        = formElement.getElementsByClassName(EL_CLASS_CART_LIST) as HTMLCollectionOf<HTMLElement>;
      if (listElements && listElements.length) {
        console.log(listElements);
        for (const [_, listNode] of Object.entries(listElements)) {
          console.log(listNode);

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
                await getCartItems().then(async (updatedData: Array<any>) => {
                  updateCartBadge(updatedData);
                  updateCartList(updatedData);
                  updateCartAmount(updatedData);
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

      console.log(formElement);
    }
  }

  const emptyElements: HTMLCollectionOf<HTMLElement>
    = document.getElementsByClassName(EL_CLASS_CART_EMPTY) as HTMLCollectionOf<HTMLElement>;
  if (emptyElements && emptyElements.length) {
    console.log(emptyElements);
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
      console.log(data.length ? 'none' : 'flex');
      console.log(emptyElement);
    }
  }

}

const updateCartAmount = async (data: Array<any>) => {
  const elements: HTMLCollectionOf<HTMLElement>
    = document.getElementsByClassName(EL_CLASS_CART_AMOUNT) as HTMLCollectionOf<HTMLElement>;
  if (elements && elements.length) {
    console.log(elements);
    for (const [_, node] of Object.entries(elements)) {
      console.log(node);
      const replacedElement: HTMLElement = node.cloneNode(true) as HTMLElement;
      replacedElement.removeAttribute('data-wf-bindings');
      replacedElement.textContent = data.length.toString();
      if (data.length) {
        replacedElement.textContent = `฿ ${data.reduce((result: number, item: any) => {
          return result + (item.product?.price || 0);
        }, 0).toString()
          } THB`;
      } else {
        replacedElement.textContent = '฿ 0 THB';
      }
      node.parentNode.replaceChild(replacedElement, node);
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