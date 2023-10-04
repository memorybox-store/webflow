import {
  EL_ID_RESULT_CONTAINER,
  EL_ID_RESULT_SAMPLE,
  EL_ID_RESULT_SUM_MY_PIC,
  EL_ID_RESULT_SUM_TOTAL,
  EL_ID_RESULT_SUM_BOAT,
  EL_ID_RESULT_SUM_COMPANY,
  EL_CLASS_ADD_TO_CART_BTN,
  EL_CLASS_POPUP,
  EL_CLASS_POPUP_TITLE,
  EL_CLASS_POPUP_SUBTITLE,
  EL_CLASS_POPUP_CLOSE_BTN
} from "../constants/elements";

import moment from '../config/moment';

import { addItemToCart, getCartItems } from "../api/cart";
import { getProducts } from "../api/product";

import { updateCartItems } from "./CartListener";

import { Product } from "../models/product";
import { CartItem } from "../models/cart";

export const ProductListener = (): void => {

  // Add product to cart
  const add = (id: string, companyId: string, itemId: string) => {
    return new Promise(async (resolve, reject) => {
      // Add product to cart via API
      await addItemToCart(id, companyId, itemId, 1).then(async (data: CartItem[]) => {
        resolve(data);
      }).catch((error) => {
        reject(error);
      });
    });
  }

  const load = (boatId: string, date: string, companyName: string) => {
    return new Promise(async (resolve) => {

      // Init card container
      const cardContainer = document.getElementById(EL_ID_RESULT_CONTAINER) as HTMLElement;

      // Get sample element and hide
      const sampleElement = document.getElementById(EL_ID_RESULT_SAMPLE) as HTMLElement;
      sampleElement.style.opacity = '0';
      sampleElement.style.display = 'none';
      sampleElement?.classList.add("hidden-force");

      // Init resultmary of image includes my picture
      const resultMyPicElement = document.getElementById(EL_ID_RESULT_SUM_MY_PIC) as HTMLElement;
      if (resultMyPicElement) {
        resultMyPicElement.innerText = 'N/A';
      }

      // Init resultmary of total image
      const resultTotalElement = document.getElementById(EL_ID_RESULT_SUM_TOTAL) as HTMLElement;
      if (resultTotalElement) {
        resultTotalElement.innerText = '0';
      }

      // Init resultmary of boat name
      const resultBoatElement = document.getElementById(EL_ID_RESULT_SUM_BOAT) as HTMLElement;
      if (resultBoatElement) {
        resultBoatElement.innerText = '-';
      }

      // Init resultmary of comapny
      const resultCompanyElement = document.getElementById(EL_ID_RESULT_SUM_COMPANY) as HTMLElement;
      if (resultCompanyElement) {
        resultCompanyElement.innerText = '-';
      }

      const initAddToCartElement = (element: HTMLElement, item: Product, addedItems: Array<any>) => {
        if (element) {
          element.setAttribute('data-target', item.id);
          // If item was added then disable button
          if (addedItems.includes(item.id.toString())) {
            element.classList.add('disabled');
            element.innerText = 'Added';
          } else {
            element.classList.remove('disabled');
            element.innerText = 'Add to Cart';
          }
          // Register add to cart event
          element.addEventListener('click', async () => {
            const reset = () => {
              element.classList.remove('disabled');
              element.innerText = 'Add to Cart';
            }
            element.classList.add('disabled');
            element.innerText = 'Adding...';
            add(
              item.id,
              item.company?.id.toString() || '',
              item.itemId.toString() || ''
            ).then(async () => {
              element.innerText = 'Added';
              // Get updated items from cart for checking via API
              await getCartItems().then(async (updatedData: CartItem[]) => {
                // Update cart count badges in header
                updateCartItems(updatedData);
              }).catch((error) => {
                alert(error);
                reset();
              });
            }).catch((error) => {
              alert(error);
              reset();
            });
          });
        }
      }

      // Get added items from cart for checking via API
      getCartItems().then(async (cartItemsData: CartItem[]) => {
        const addedItems = cartItemsData.map((item: CartItem) => item.product.id.toString());

        // Get products from boat via API
        await getProducts(boatId).then(async (data: Product[]) => {

          // Update resultmary of image includes my picture
          if (resultTotalElement) {
            resultTotalElement.innerText = data.length.toString();
          }

          // Update resultmary of total image
          if (resultBoatElement) {
            resultBoatElement.innerText = data.length ? data[0].boat?.name : '-';
          }

          // Update resultmary of comapny
          if (resultCompanyElement) {
            resultCompanyElement.innerText = data.length ? data[0].company?.name : '-';
          }

          for (let item of data) {

            // Init card (Cloned from sample element)
            const cardElement = sampleElement.cloneNode(true) as HTMLElement;
            cardElement.classList.remove("hidden-force");
            cardElement.removeAttribute('data-w-id');
            cardElement.setAttribute('id', `product-${item.id}`);
            cardElement.style.opacity = '1';
            cardElement.style.display = 'flex';

            // Init image
            const imgElement: HTMLImageElement = cardElement.querySelector('img');
            if (imgElement) {
              imgElement.src = item.image;
              imgElement.srcset = item.image;
              // Register click event to open popup
              imgElement.addEventListener('click', async () => {
                const popupElement: HTMLElement = document.querySelector(`[data-popup="${item.id}"]`);
                popupElement?.classList.add('popup-display-force');
                popupElement.style.opacity = '1';
                popupElement.style.pointerEvents = 'all';
              });
            }

            // Init add to cart button
            const addButtonElement: HTMLElement = cardElement.querySelector(`.${EL_CLASS_ADD_TO_CART_BTN}`);
            initAddToCartElement(addButtonElement, item, addedItems);

            // Init popup
            const innerPopupElement: HTMLElement = cardElement.querySelector(`.${EL_CLASS_POPUP}`);
            if (innerPopupElement) {

              // Init popup
              const popupElement = innerPopupElement.cloneNode(true) as HTMLElement;

              popupElement.setAttribute('data-popup', item.id);
              popupElement.style.opacity = '0';
              popupElement.style.pointerEvents = 'none';

              // Init title
              const titlePopupElements: HTMLElement = popupElement.querySelector(`.${EL_CLASS_POPUP_TITLE}`);
              if (titlePopupElements) {
                titlePopupElements.innerText = moment(date).format('DD.MM.YYYY');
              }

              // Init subtitle
              const subtitlePopupElements: HTMLElement = popupElement.querySelector(`.${EL_CLASS_POPUP_SUBTITLE}`);
              if (subtitlePopupElements) {
                subtitlePopupElements.innerText = `${data.length ? data[0].boat?.name : '-'} x ${companyName}`;
              }

              // Init add to cart button in popup
              const addPopupButtonElement: HTMLElement = popupElement.querySelector(`.${EL_CLASS_ADD_TO_CART_BTN}`);
              initAddToCartElement(addPopupButtonElement, item, addedItems);

              // Init image in popup
              const imgPopupElement: HTMLImageElement = popupElement.querySelector('img');
              if (imgPopupElement) {
                imgPopupElement.src = item.image;
                imgPopupElement.srcset = item.image;
              }

              // Register click event to dismiss popup
              const closePopupButtonElements: NodeListOf<HTMLElement> = popupElement.querySelectorAll(`.${EL_CLASS_POPUP_CLOSE_BTN}`);
              for (const [_, closePopupButtonElement] of Object.entries(closePopupButtonElements)) {
                closePopupButtonElement?.addEventListener('click', async () => {
                  popupElement.classList.remove('popup-display-force');
                  popupElement.style.opacity = '0';
                  popupElement.style.pointerEvents = 'none';
                });
              }

              // Register click event to dismiss popup
              // const closePopupButtonElements: HTMLElement = popupElement.querySelector('.close-button-popup-module');
              // closePopupButtonElements?.addEventListener('click', async () => {
              //   popupElement.classList.remove('popup-display-force');
              // });

              // Change popup location
              document.querySelector('body')?.appendChild(popupElement);
              innerPopupElement.parentElement.removeChild(innerPopupElement);

            }

            // Append card to container
            cardContainer?.appendChild(cardElement);

          }

          resolve(data);

        }).catch((error) => {
          alert(error);
        });

      }).catch((error) => {
        alert(error);
      });

    });
  }

  // Load on specific page
  const path: string = window.location.pathname;
  if (path === '/result') {
    const url = new URL(window.location.href);
    const boatId = url.searchParams.get("fid");
    const date = url.searchParams.get("date");
    const companyName = decodeURI(url.searchParams.get("company") || '');
    const imageId = url.searchParams.get("mid");
    if (boatId) {
      load(boatId, date, companyName);
    }
  }

}