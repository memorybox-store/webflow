import {
  EL_ID_RESULT_CONTAINER,
  EL_ID_RESULT_SAMPLE,
  EL_ID_RESULT_SUM_MY_PIC,
  EL_ID_RESULT_SUM_TOTAL,
  EL_ID_RESULT_SUM_BOAT,
  EL_ID_RESULT_SUM_COMPANY
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
      const cardContainer: HTMLElement = document.getElementById(EL_ID_RESULT_CONTAINER);

      // Get sample element and hide
      const sampleElement: HTMLElement = document.getElementById(EL_ID_RESULT_SAMPLE);
      sampleElement?.classList.add("hidden-force");

      // Init summary of image includes my picture
      const sumMyPicElement: HTMLElement = document.getElementById(EL_ID_RESULT_SUM_MY_PIC);
      if (sumMyPicElement) {
        sumMyPicElement.innerText = 'N/A';
      }

      // Init summary of total image
      const sumTotalElement: HTMLElement = document.getElementById(EL_ID_RESULT_SUM_TOTAL);
      if (sumTotalElement) {
        sumTotalElement.innerText = '0';
      }

      // Init summary of boat name
      const sumBoatElement: HTMLElement = document.getElementById(EL_ID_RESULT_SUM_BOAT);
      if (sumBoatElement) {
        sumBoatElement.innerText = '-';
      }

      // Init summary of comapny
      const sumCompanyElement: HTMLElement = document.getElementById(EL_ID_RESULT_SUM_COMPANY);
      if (sumCompanyElement) {
        sumCompanyElement.innerText = '-';
      }

      const initAddToCartElement = (element: HTMLElement, item: Product, addedItems: Array<any>) => {
        if (element) {
          element.classList.add('product-add-button');
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
          console.log('Product', data);

          // Update summary of image includes my picture
          if (sumTotalElement) {
            sumTotalElement.innerText = data.length.toString();
          }

          // Update summary of total image
          if (sumBoatElement) {
            sumBoatElement.innerText = data.length ? data[0].boat?.name : '-';
          }

          // Update summary of comapny
          if (sumCompanyElement) {
            sumCompanyElement.innerText = data.length ? data[0].company?.name : '-';
          }

          for (let item of data) {

            // Init card (Cloned from sample element)
            const cardElement = sampleElement.cloneNode(true) as HTMLElement;
            cardElement.classList.remove("hidden-force");
            cardElement.removeAttribute('data-w-id');
            cardElement.setAttribute('id', `product-${item.id}`);

            // Init image
            const imgElement: HTMLImageElement = cardElement.querySelector('img');
            if (imgElement) {
              imgElement.src = item.image;
              imgElement.srcset = item.image;
              imgElement.classList.add('open-popup-button');
              imgElement.classList.add('clickable');
              // Register click event to open popup
              imgElement.addEventListener('click', async () => {
                const popupElement: HTMLElement = document.querySelector(`[data-popup="${item.image}"]`);
                popupElement?.classList.add('lightbox-display-force');
              });
            }

            // Init add to cart button
            const addButtonElement: HTMLElement = cardElement.querySelector('a.cart');
            initAddToCartElement(addButtonElement, item, addedItems);

            // Init popup
            const innerPopupElement: HTMLElement = cardElement.querySelector('.popup-wrapper-photo');
            if (innerPopupElement) {

              // Init popup
              const popupElement = innerPopupElement.cloneNode(true) as HTMLElement;

              popupElement.setAttribute('data-popup', item.image);

              // Init title
              const titlePopupElements: HTMLElement = popupElement.querySelector('.display-4');
              if (titlePopupElements) {
                titlePopupElements.innerText = moment(date).format('DD.MM.YYYY');
              }

              // Init subtitle
              const subtitlePopupElements: HTMLElement = popupElement.querySelector('.mg-bottom-24px');
              if (subtitlePopupElements) {
                subtitlePopupElements.innerText = `${data.length ? data[0].boat?.name : '-'} x ${companyName}`;
              }

              // Init add to cart button in popup
              const addPopupButtonElement: HTMLElement = popupElement.querySelector('a.add-to-cart');
              initAddToCartElement(addPopupButtonElement, item, addedItems);

              // Init image in popup
              const imgPopupElement: HTMLImageElement = popupElement.querySelector('img');
              if (imgPopupElement) {
                imgPopupElement.src = item.image;
                imgPopupElement.srcset = item.image;
              }

              // Register click event to dismiss popup
              const closePopupMobileButtonElement: HTMLElement = popupElement.querySelector('a.hide-mobile');
              closePopupMobileButtonElement?.addEventListener('click', async () => {
                popupElement.classList.remove('lightbox-display-force');
              });

              // Register click event to dismiss popup
              const closePopupButtonElements: HTMLElement = popupElement.querySelector('.close-button-popup-module');
              closePopupButtonElements?.addEventListener('click', async () => {
                popupElement.classList.remove('lightbox-display-force');
              });

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