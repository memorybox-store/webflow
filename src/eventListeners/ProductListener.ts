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
  EL_CLASS_POPUP_CLOSE_BTN,
  EL_CLASS_PHOTO_IMAGE,
  EL_CLASS_REPORT,
  EL_CLASS_REPORT_CLOSE_BTN,
  EL_CLASS_REPORT_BTN,
  EL_CLASS_REPORT_SUBMIT_BTN,
  EL_ID_RESULT_HEADER_DATE,
  EL_ID_RESULT_HEADER_COMPANY
} from "../constants/elements";

import moment from '../config/moment';

import { addItemToCart, getCartItems } from "../api/cart";
import { getProducts } from "../api/product";

import { updateCartItems } from "./CartListener";

import { Product } from "../models/product";
import { CartItem } from "../models/cart";
import { loadImageAsBase64 } from "../utils/image";
import { NAME_CART_ADD, NAME_CART_ADDED, NAME_CART_ADDING } from "../constants/names";
import { MSG_INFO_NOT_AVAIL } from "../constants/messages";

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
      if (sampleElement) {
        sampleElement.style.opacity = '0';
        sampleElement.style.display = 'none';
        sampleElement.classList.add("hidden-force");
      }

      // Init result of image includes my picture
      const resultMyPicElement = document.getElementById(EL_ID_RESULT_SUM_MY_PIC) as HTMLElement;
      if (resultMyPicElement) {
        resultMyPicElement.innerText = MSG_INFO_NOT_AVAIL;
      }

      // Init result of total image
      const resultTotalElement = document.getElementById(EL_ID_RESULT_SUM_TOTAL) as HTMLElement;
      if (resultTotalElement) {
        resultTotalElement.innerText = '0';
      }

      // Init result of boat name
      const resultBoatElement = document.getElementById(EL_ID_RESULT_SUM_BOAT) as HTMLElement;
      if (resultBoatElement) {
        resultBoatElement.innerText = '-';
      }

      // Init result of company
      const resultCompanyElement = document.getElementById(EL_ID_RESULT_SUM_COMPANY) as HTMLElement;
      if (resultCompanyElement) {
        resultCompanyElement.innerText = companyName;
      }

      // Init result of company
      const resultHeaderCompanyElement = document.getElementById(EL_ID_RESULT_HEADER_COMPANY) as HTMLElement;
      if (resultHeaderCompanyElement) {
        resultHeaderCompanyElement.innerText = companyName;
      }

      // Init result of date
      const resultHeaderDateElement = document.getElementById(EL_ID_RESULT_HEADER_DATE) as HTMLElement;
      if (resultHeaderDateElement) {
        resultHeaderDateElement.innerText = moment(date).format('LL');
      }

      const initAddToCartElement = (element: HTMLElement, item: Product, addedItems: Array<any>) => {
        if (element) {
          element.setAttribute('data-target', item.id);
          // If item was added then disable button
          if (addedItems.includes(item.id.toString())) {
            element.classList.add('disabled');
            element.innerText = NAME_CART_ADDED;
          } else {
            element.classList.remove('disabled');
            element.innerText = NAME_CART_ADD;
          }
          // Register add to cart event
          element.addEventListener('click', async () => {
            const reset = () => {
              element.classList.remove('disabled');
              element.innerText = NAME_CART_ADD;
            }
            element.classList.add('disabled');
            element.innerText = NAME_CART_ADDING;
            add(
              item.id,
              item.company?.id.toString() || '',
              item.details.id.toString() || ''
            ).then(async () => {
              element.innerText = NAME_CART_ADDED;
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

          // Update result of image includes my picture
          if (resultTotalElement) {
            resultTotalElement.innerText = data.length.toString();
          }

          // Update result of total image
          if (resultBoatElement) {
            resultBoatElement.innerText = data.length ? data[0].boat?.name : '-';
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
              imgElement.crossOrigin = 'anonymous';
              imgElement.setAttribute('crossorigin', 'anonymous');

              imgElement.src = '';
              imgElement.srcset = '';
              loadImageAsBase64(item.image.marked).then((base64Data) => {
                // Use the base64Data in the src attribute of the img element
                imgElement.src = base64Data;
                imgElement.srcset = base64Data;
              }).catch((error) => {
                console.error(error.message);
              });

              imgElement.classList.add(EL_CLASS_PHOTO_IMAGE);
              imgElement.setAttribute('id', `image-${item.id}`);
              imgElement.addEventListener('click', async () => {
                const popupElement = document.querySelector(`[data-popup="${item.id}"]`) as HTMLElement;
                if (popupElement) {
                  popupElement.classList.add('popup-display-force');
                  popupElement.style.opacity = '1';
                  popupElement.style.pointerEvents = 'all';
                }
              });
            }

            // Init add to cart button
            const addButtonElement = cardElement.querySelector(`.${EL_CLASS_ADD_TO_CART_BTN}`) as HTMLElement;
            initAddToCartElement(addButtonElement, item, addedItems);

            // Init popup
            const innerPopupElement = cardElement.querySelector(`.${EL_CLASS_POPUP}`) as HTMLElement;
            if (innerPopupElement) {

              // Init popup
              const popupElement = innerPopupElement.cloneNode(true) as HTMLElement;

              popupElement.setAttribute('data-popup', item.id);
              popupElement.style.opacity = '0';
              popupElement.style.pointerEvents = 'none';

              // Init title
              const titlePopupElements = popupElement.querySelector(`.${EL_CLASS_POPUP_TITLE}`) as HTMLElement;
              if (titlePopupElements) {
                titlePopupElements.innerText = moment(date).format('DD.MM.YYYY');
              }

              // Init subtitle
              const subtitlePopupElements = popupElement.querySelector(`.${EL_CLASS_POPUP_SUBTITLE}`) as HTMLElement;
              if (subtitlePopupElements) {
                subtitlePopupElements.innerText = `${data.length ? data[0].boat?.name : '-'} x ${companyName}`;
              }

              // Init add to cart button in popup
              const addPopupButtonElement = popupElement.querySelector(`.${EL_CLASS_ADD_TO_CART_BTN}`) as HTMLElement;
              initAddToCartElement(addPopupButtonElement, item, addedItems);

              // Init image in popup
              const imgPopupElement = popupElement.querySelector('img') as HTMLImageElement;
              if (imgPopupElement) {
                imgPopupElement.src = item.image.marked;
                imgPopupElement.srcset = item.image.marked;
              }

              // Register click event to dismiss popup
              const closePopupButtonElements = popupElement.querySelectorAll(`.${EL_CLASS_POPUP_CLOSE_BTN}`) as NodeListOf<HTMLElement>;
              if (closePopupButtonElements) {
                for (const [_, closePopupButtonElement] of Object.entries(closePopupButtonElements)) {
                  closePopupButtonElement?.addEventListener('click', async () => {
                    popupElement.classList.remove('popup-display-force');
                    popupElement.style.opacity = '0';
                    popupElement.style.pointerEvents = 'none';
                  });
                }
              }

              // Register click event to dismiss popup
              const reportButtonElement = popupElement.querySelector(`.${EL_CLASS_REPORT_BTN}`) as HTMLElement;
              reportButtonElement?.addEventListener('click', async () => {
                const reportElement = popupElement.querySelector(`.${EL_CLASS_REPORT}`) as HTMLElement;
                reportElement?.classList.add('popup-display-force');
              });

              // Init report
              const innerReportElement = popupElement.querySelector(`.${EL_CLASS_REPORT}`) as HTMLElement;
              if (innerReportElement) {

                const reportElement = innerReportElement.cloneNode(true) as HTMLElement;
                reportElement.style.opacity = '0';
                reportElement.style.display = 'none';
                reportElement.style.pointerEvents = 'none';
                reportElement.classList.remove('popup-display-force');

                // Register click event to dismiss popup
                const reportSubmitButtonElement = reportElement.querySelector(`.${EL_CLASS_REPORT_SUBMIT_BTN}`) as HTMLElement;
                reportSubmitButtonElement?.addEventListener('click', async () => {
                  // Do submit
                });

                // Register click event to dismiss popup
                const closeReportButtonElements = reportElement.querySelectorAll(`.${EL_CLASS_REPORT_CLOSE_BTN}`) as NodeListOf<HTMLElement>;
                if (closeReportButtonElements) {
                  for (const [_, closeReportButtonElement] of Object.entries(closeReportButtonElements)) {
                    closeReportButtonElement?.addEventListener('click', async () => {
                      reportElement.classList.remove('popup-display-force');
                    });
                  }
                }

                popupElement.appendChild(reportElement);
                innerReportElement.parentElement.removeChild(innerReportElement);

              }

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