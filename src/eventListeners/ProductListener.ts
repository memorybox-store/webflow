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
  EL_ID_RESULT_HEADER_COMPANY,
  EL_CLASS_ADD_TO_CART_POPUP_BTN
} from "../constants/elements";
import {
  NAME_CART_ADD,
  NAME_CART_ADDED,
  NAME_CART_ADDING,
  NAME_OK
} from "../constants/names";
import {
  MSG_ERR_UNKNOWN,
  MSG_INFO_NOT_AVAIL
} from "../constants/messages";
import { DATA_ATT_EMPTY } from "../constants/attributes";

import moment from '../config/moment';

import { updateCartItems } from "./CartListener";

import { loadImageAsBase64 } from "../utils/image";

import { addItemToCart, getCartItems } from "../api/cart";
import { getProducts } from "../api/product";

import { Product } from "../models/product";
import { CartItem } from "../models/cart";
import { getStorage, setStorage } from "../utils/storage";

import * as tingle from 'tingle.js';
import { authen } from "../api/user";
import { URL_LOGIN } from "../constants/urls";
import { updateScannerStatusReady } from "./ScanListener";

const modal = new tingle.modal({
  footer: true,
  stickyFooter: false,
  closeMethods: ['overlay', 'button', 'escape'],
  closeLabel: '',
  beforeClose: () => {
    return true;
  }
});
modal.setContent('');
modal.addFooterBtn(NAME_OK, 'tingle-btn tingle-btn--primary', () => modal.close());

export const ProductListener = async (): Promise<void> => {

  // Add product to cart
  const add = (item: Product) => {
    return new Promise(async (resolve, reject) => {
      // Add product to cart via API
      await authen().then(async () => {
        await addItemToCart(
          item.id,
          item.company?.id.toString() || '',
          item.details.id.toString() || '',
          1
        ).then(async (data: CartItem[]) => {
          resolve(data);
        }).catch((error) => {
          reject(error);
        });
      }).catch(async () => {
        await getStorage('cart-items', true).then(async (stored: [] | null) => {
          let cartItems: CartItem[] = [];
          if (stored && stored.length) {
            cartItems = stored as CartItem[];
          }
          if (cartItems.find((cartItem: CartItem) => cartItem.product.id.toString() === item.id.toString()) === undefined) {
            const cartItem: CartItem = {
              id: item.id,
              quantity: 1,
              product: item
            }
            const updatedCartItems = [...cartItems, cartItem];
            await setStorage('cart-items', updatedCartItems, true);
            resolve(updatedCartItems);
          } else {
            resolve(cartItems);
          }
        });
        // const redirect: string = encodeURIComponent(window.location.href);
        // location.href = `./${URL_LOGIN}?redirect=${redirect}`;
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
        await getStorage('status-mypic').then((data: string) => {
          resultMyPicElement.innerText = data || resultMyPicElement.getAttribute(DATA_ATT_EMPTY) || MSG_INFO_NOT_AVAIL;
        });
      }

      // Init result of total image
      const resultTotalElement = document.getElementById(EL_ID_RESULT_SUM_TOTAL) as HTMLElement;
      if (resultTotalElement) {
        await getStorage('status-total').then((data: string) => {
          resultTotalElement.innerText = data || resultTotalElement.getAttribute(DATA_ATT_EMPTY) || '0';
        });
      }

      // Init result of boat name
      const resultBoatElement = document.getElementById(EL_ID_RESULT_SUM_BOAT) as HTMLElement;
      if (resultBoatElement) {
        await getStorage('status-boat').then((data: string) => {
          resultBoatElement.innerText = data || resultBoatElement.getAttribute(DATA_ATT_EMPTY) || '-';
        });
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
            add(item).then(async (cartItems: CartItem[]) => {
              element.innerText = NAME_CART_ADDED;
              // Get updated items from cart for checking via API
              await authen().then(async () => {
                await getCartItems().then(async (updatedData: CartItem[]) => {
                  // Update cart count badges in header
                  updateCartItems(updatedData);
                }).catch((message) => {
                  modal.setContent(message || MSG_ERR_UNKNOWN);
                  modal.open();
                  reset();
                });
              }).catch(async () => {
                updateCartItems(cartItems);
              });
            }).catch((message) => {
              modal.setContent(message || MSG_ERR_UNKNOWN);
              modal.open();
              reset();
            });
          });
        }
      }

      let addedItems: string[] = [];

      // Get added items from cart for checking via API
      await authen().then(async () => {
        await getCartItems().then(async (cartItemsData: CartItem[]) => {
          addedItems = cartItemsData.map((item: CartItem) => item.product.id.toString());
        }).catch(() => { });
      }).catch(async () => {
        await getStorage('cart-items', true).then(async (stored: [] | null) => {
          if (stored && stored.length) {
            addedItems = stored.map((item: CartItem) => item.product.id.toString());
          }
        });
      });

      // Get products from boat via API
      await getProducts(boatId).then(async (data: Product[]) => {

        // Update result of image includes my picture
        if (resultTotalElement) {
          resultTotalElement.innerText = data.length.toString();
          setStorage('status-total', data.length.toString());
        }

        // Update result of total image
        if (resultBoatElement) {
          resultBoatElement.innerText = data.length ? data[0].boat?.name : '-';
          setStorage('status-boat', data.length ? data[0].boat?.name : '-');
        }

        let index = 0;
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

            imgElement.onload = () => {
              const lastId = data[data.length - 1].id;
              if (item.id === lastId) {
                updateScannerStatusReady();
              }
            }

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
            const addPopupButtonElement = popupElement.querySelector(`.${EL_CLASS_ADD_TO_CART_POPUP_BTN}`) as HTMLElement;
            initAddToCartElement(addPopupButtonElement, item, addedItems);

            // Init image in popup
            const imgPopupElement = popupElement.querySelector('img') as HTMLImageElement;
            if (imgPopupElement) {

              imgPopupElement.crossOrigin = 'anonymous';
              imgPopupElement.setAttribute('crossorigin', 'anonymous');

              imgPopupElement.src = '';
              imgPopupElement.srcset = '';
              loadImageAsBase64(item.image.marked).then((base64Data) => {
                // Use the base64Data in the src attribute of the img element
                imgPopupElement.src = base64Data;
                imgPopupElement.srcset = base64Data;
              }).catch((error) => {
                console.error(error.message);
              });

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

          index += 1;

        }

        resolve(data);

      }).catch((message) => {
        modal.setContent(message || MSG_ERR_UNKNOWN);
        modal.open();
      });

    });
  }

  // Load on specific page
  const element = document.getElementById(EL_ID_RESULT_CONTAINER) as HTMLElement;
  if (element) {
    const url = new URL(window.location.href);
    let boat = url.searchParams.get("fid");
    if (!boat) {
      await getStorage('result-fid').then(async (boatStored: string) => {
        if (boatStored && boatStored !== 'null') {
          boat = boatStored;
        }
      });
    } else {
      await setStorage('result-fid', boat ? boat : '');
    }
    if (boat) {
      let date = url.searchParams.get("date");
      if (!date) {
        await getStorage('result-date').then(async (dateStored: string) => {
          if (dateStored && dateStored !== 'null') {
            date = dateStored;
          }
        });
      } else {
        await setStorage('result-date', date ? date : '');
      }
      if (date) {
        let companyName = url.searchParams.get("company");
        if (!companyName) {
          await getStorage('result-company').then(async (companyNameStored: string) => {
            if (!companyNameStored || companyNameStored === 'null') {
              companyName = companyNameStored;
            }
          });
        } else {
          companyName = decodeURI(url.searchParams.get("company") || '');
          await setStorage('result-company', companyName ? companyName : '');
        }
        if (companyName) {
          const url = new URL(window.location.href);
          const path: string = window.location.pathname;
          let run = url.searchParams.get("run");
          if (run) {
            window.history.pushState(null, "", `${path}?fid=${boat}&date=${date}&company=${encodeURI(companyName)}&run=true`);
          } else {
            window.history.pushState(null, "", `${path}?fid=${boat}&date=${date}&company=${encodeURI(companyName)}`);
          }
          const imageId = url.searchParams.get("mid");
          load(boat, date, companyName);
        }
      }
    }

  }

}