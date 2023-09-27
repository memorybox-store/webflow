import {
  EL_ID_RESULT_CONTAINER,
  EL_ID_RESULT_SAMPLE,
  EL_ID_RESULT_SUM_MY_PIC,
  EL_ID_RESULT_SUM_TOTAL,
  EL_ID_RESULT_SUM_BOAT,
  EL_ID_RESULT_SUM_COMPANY
} from "../constants/elements";

import { addItemToCart, getCartItems } from "../api/cart";
import { getProducts } from "../api/product";
import { Product } from "../models/product";
import { updateCartItems } from "./CartListener";
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

  const load = (boatId: string) => {
    return new Promise(async (resolve) => {

      // Get added items from cart for checking via API
      getCartItems().then(async (cartItemsData: CartItem[]) => {
        const addedItems = cartItemsData.map((item: CartItem) => item.product.id.toString());

        // Init card container
        const cardContainer: HTMLElement
          = document.getElementById(EL_ID_RESULT_CONTAINER) as HTMLElement;

        // Get sample element and hide
        const sampleElement: HTMLElement
          = document.getElementById(EL_ID_RESULT_SAMPLE) as HTMLElement;
        sampleElement.classList.add("hidden-force");

        // Update summary of image includes my picture to default
        const sumMyPicElement: HTMLElement
          = document.getElementById(EL_ID_RESULT_SUM_MY_PIC) as HTMLElement;
        if (sumMyPicElement) {
          sumMyPicElement.innerText = 'N/A';
        }

        // Update summary of total image to default
        const sumTotalElement: HTMLElement
          = document.getElementById(EL_ID_RESULT_SUM_TOTAL) as HTMLElement;
        if (sumTotalElement) {
          sumTotalElement.innerText = '0';
        }

        // Update summary of boat name to default
        const sumBoatElement: HTMLElement
          = document.getElementById(EL_ID_RESULT_SUM_BOAT) as HTMLElement;
        if (sumBoatElement) {
          sumBoatElement.innerText = '-';
        }

        // Update summary of comapny to default
        const sumCompanyElement: HTMLElement
          = document.getElementById(EL_ID_RESULT_SUM_COMPANY) as HTMLElement;
        if (sumCompanyElement) {
          sumCompanyElement.innerText = '-';
        }

        // Get products from boat via API
        await getProducts(boatId).then(async (data: Product[]) => {
          console.log('Product', data);
          for (let item of data) {

            // Init card (Cloned from sample element)
            const cardElement: HTMLElement
              = sampleElement.cloneNode(true) as HTMLElement;
            cardElement.classList.remove("hidden-force");
            cardElement.removeAttribute('data-w-id');
            cardElement.setAttribute('id', `product-${item.id}`);

            // Init image
            const imgElement: HTMLImageElement
              = cardElement.querySelector('img') as HTMLImageElement;
            if (imgElement) {

              imgElement.src = item.image;
              imgElement.srcset = item.image;
              imgElement.classList.add('open-popup-button');

              // Init image in popup
              const popupElement: HTMLCollectionOf<HTMLElement>
                = cardElement.getElementsByTagName('popup-wrapper-photo') as HTMLCollectionOf<HTMLElement>;
              if (popupElement) {
                for (const [_, popupNode] of Object.entries(popupElement)) {
                  const imgPopupElement: HTMLImageElement
                    = popupNode.querySelector('img') as HTMLImageElement;
                  if (imgPopupElement) {
                    imgPopupElement.src = item.image;
                    imgPopupElement.srcset = item.image;
                  }
                }
              }

            }

            // Init add to cart button
            const addButtonElements: HTMLCollectionOf<HTMLElement>
              = cardElement.getElementsByTagName('a.cart') as HTMLCollectionOf<HTMLElement>;
            if (addButtonElements) {
              for (const [_, addNode] of Object.entries(addButtonElements)) {
                addNode.classList.add('product-add-button');
                addNode.setAttribute('data-target', item.id || '');
                addNode.setAttribute('data-company', item.company?.id.toString() || '');
                addNode.setAttribute('data-item', item.itemId.toString() || '');
                // If item was added then disable button
                if (addedItems.includes(item.id.toString())) {
                  addNode.classList.add('disabled');
                  addNode.textContent = 'Added';
                } else {
                  addNode.classList.remove('disabled');
                  addNode.textContent = 'Add to Cart';
                }
              }
            }

            // Init add to cart button in popup
            const addPopupButtonElements: HTMLCollectionOf<HTMLElement>
              = cardElement.getElementsByTagName('a.add-to-cart') as HTMLCollectionOf<HTMLElement>;
            if (addPopupButtonElements) {
              for (const [_, addNode] of Object.entries(addPopupButtonElements)) {
                addNode.classList.add('product-add-button');
                addNode.setAttribute('data-target', item.id || '');
                addNode.setAttribute('data-company', item.company?.id.toString() || '');
                addNode.setAttribute('data-item', item.itemId.toString() || '');
                // If item was added then disable button
                if (addedItems.includes(item.id.toString())) {
                  addNode.classList.add('disabled');
                  addNode.textContent = 'Added';
                } else {
                  addNode.classList.remove('disabled');
                  addNode.textContent = 'Add to Cart';
                }
              }
            }

            // Append card to container
            cardContainer.appendChild(cardElement);

          }

          // Init close button in popup
          const closePopupMobileButtonElements: HTMLCollectionOf<HTMLElement>
            = cardContainer.getElementsByTagName('a.hide-mobile') as HTMLCollectionOf<HTMLElement>;
          if (closePopupMobileButtonElements) {
            for (const [_, closeNode] of Object.entries(closePopupMobileButtonElements)) {
              // Register click event to dismiss popup
              closeNode.addEventListener('click', async () => {
                const popupElement: HTMLCollectionOf<HTMLElement>
                  = cardContainer.getElementsByTagName('popup-wrapper-photo') as HTMLCollectionOf<HTMLElement>;
                if (popupElement) {
                  for (const [_, popupNode] of Object.entries(popupElement)) {
                    popupNode.classList.remove('lightbox-display-force');
                  }
                }
              });
            }
          }

          const imgElements: HTMLCollectionOf<HTMLElement>
            = cardContainer.getElementsByClassName('open-popup-button') as HTMLCollectionOf<HTMLElement>;
          if (imgElements) {
            for (const [_, imageNode] of Object.entries(imgElements)) {
              // Register click event to open popup
              imageNode.addEventListener('click', async () => {
                const popupElement: HTMLCollectionOf<HTMLElement>
                  = imageNode.parentElement.getElementsByTagName('popup-wrapper-photo') as HTMLCollectionOf<HTMLElement>;
                if (popupElement) {
                  for (const [_, popupNode] of Object.entries(popupElement)) {
                    popupNode.classList.add('lightbox-display-force');
                  }
                }
              });
            }
          }

          // Init close button in popup
          const closePopupButtonElements: HTMLCollectionOf<HTMLElement>
            = cardContainer.getElementsByTagName('a.close-button-popup-module') as HTMLCollectionOf<HTMLElement>;
          if (closePopupButtonElements) {
            for (const [_, closeNode] of Object.entries(closePopupButtonElements)) {
              // Register click event to dismiss popup
              closeNode.addEventListener('click', async () => {
                const popupElement: HTMLCollectionOf<HTMLElement>
                  = cardContainer.getElementsByTagName('popup-wrapper-photo') as HTMLCollectionOf<HTMLElement>;
                if (popupElement) {
                  for (const [_, popupNode] of Object.entries(popupElement)) {
                    popupNode.classList.remove('lightbox-display-force');
                  }
                }
              });
            }
          }

          // Register click event to add to cart
          const addElements: HTMLCollectionOf<HTMLElement>
            = cardContainer.getElementsByClassName('product-add-button') as HTMLCollectionOf<HTMLElement>;
          if (addElements) {
            for (const [_, addNode] of Object.entries(addElements)) {
              addNode.addEventListener('click', async () => {
                const productId = addNode.getAttribute('data-target');
                if (productId) {
                  addNode.classList.add('disabled');
                  addNode.textContent = 'Adding...';
                  const companyId = addNode.getAttribute('data-company');
                  const itemId = addNode.getAttribute('data-item');
                  add(productId, companyId, itemId).then(async () => {
                    addNode.textContent = 'Added';
                    // Get updated items from cart for checking via API
                    await getCartItems().then(async (updatedData: CartItem[]) => {
                      // Update cart count badges in header
                      updateCartItems(updatedData);
                    }).catch((error) => {
                      alert(error);
                      addNode.classList.remove('disabled');
                      addNode.textContent = 'Add to Cart';
                    });
                  }).catch((error) => {
                    alert(error);
                    addNode.classList.remove('disabled');
                    addNode.textContent = 'Add to Cart';
                  });
                } else {
                  addNode.classList.remove('disabled');
                  addNode.textContent = 'Add to Cart';
                }
              });
            }
          }

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
    const imgeId = url.searchParams.get("mid");
    if (boatId) {
      load(boatId);
    }
  }

}