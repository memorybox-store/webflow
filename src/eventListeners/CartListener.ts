import { getCartItems } from "../api/cart";
import { EL_ID_CART_BADGE } from "../constants/elements";
import { cartModalTemplate } from "../templates/cart";

export const CartListener = (): void => {

  let cartItems: Array<any> = [];

  const setCartItems = (data: Array<any>) => {
    cartItems = data;
    const element = document.getElementById(EL_ID_CART_BADGE);
    if (element) {
      const replacedElement: any = element.cloneNode(true);
      replacedElement.textContent = data.length.toString();
      element.parentNode.replaceChild(replacedElement, element);
    }
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

  const element = document.getElementById(EL_ID_CART_BADGE);
  if (element) {
    loadCart();
    // createCartModal();
  }

}