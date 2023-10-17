import {
  EL_ID_RESULT_CONTAINER,
  EL_ID_RESULT_SAMPLE,
  EL_ID_RESULT_SUM_MY_PIC,
  EL_ID_RESULT_SUM_TOTAL,
  EL_ID_RESULT_SUM_BOAT,
  EL_ID_RESULT_HEADER_COMPANY,
  EL_CLASS_ADD_TO_CART_POPUP_BTN,
  EL_ID_DOWNLOAD_ITEM_SAMPLE,
  EL_ID_DOWNLOAD_LIST,
  EL_CLASS_DOWNLOAD_BUTTON,
  EL_ID_DOWNLOAD_COUNT
} from "../constants/elements";
import {
  NAME_CART_ADD,
  NAME_CART_ADDED,
  NAME_CART_ADDING
} from "../constants/names";
import { MSG_INFO_NOT_AVAIL } from "../constants/messages";

import moment from '../config/moment';

import { updateCartItems } from "./CartListener";

import { loadImageAsBase64 } from "../utils/image";

import { addItemToCart, getCartItems } from "../api/cart";
import { getProducts } from "../api/product";

import { Product } from "../models/product";
import { CartItem } from "../models/cart";
import { getOrder } from "../api/order";
import { Order } from "../models/order";

export const DownloadListener = async (): Promise<void> => {

  const load = async () => {
    const element = document.getElementById(EL_ID_DOWNLOAD_LIST) as HTMLElement;
    if (element) {

      // Clear list
      if (element.hasChildNodes()) {
        const childNodes: Array<any> = Object.entries(element.childNodes).map(
          ([_, childNode]) => childNode
        );
        for (const childNode of childNodes) {
          if (childNode.id !== EL_ID_DOWNLOAD_ITEM_SAMPLE) {
            element.removeChild(childNode);
          }
        }
      }

      const sampleElement = document.getElementById(EL_ID_DOWNLOAD_ITEM_SAMPLE) as HTMLFormElement;
      if (sampleElement) {

        sampleElement.classList.add('hidden-force');


        await getOrder(true).then(async (orders: Order[]) => {

          for (let order of orders) {
  
            for (let item of order.items) {
  
              const downloadCountElement = document.getElementById(EL_ID_DOWNLOAD_COUNT) as HTMLElement;
              if (downloadCountElement) {
                if (downloadCountElement.innerText && downloadCountElement.innerText !== '0') {
                  const count = parseInt(downloadCountElement.innerText) - 1;
                  downloadCountElement.innerHTML = count.toString();
                }
              }
  
              // Init card (Cloned from sample element)
              const cardElement = sampleElement.cloneNode(true) as HTMLElement;
              cardElement.removeAttribute("id");
              cardElement.classList.remove("hidden-force");
  
              // Init image
              const imgElement: HTMLImageElement = cardElement.querySelector('img');
              if (imgElement) {
                imgElement.crossOrigin = 'anonymous';
                imgElement.setAttribute('crossorigin', 'anonymous');
  
                imgElement.src = '';
                imgElement.srcset = '';
                loadImageAsBase64(item.product.image.unmarked).then((base64Data) => {
                  // Use the base64Data in the src attribute of the img element
                  imgElement.src = base64Data;
                  imgElement.srcset = base64Data;
                }).catch((error) => {
                  console.error(error.message);
                });
  
                imgElement.setAttribute('alt', item.product.name);
              }
  
              const downloadButtonElement = cardElement.querySelector(`.${EL_CLASS_DOWNLOAD_BUTTON}`) as HTMLElement;
              if (downloadButtonElement) {
                console.log(downloadButtonElement);
  
                // Split the URL by dot
                const parts = item.product.image.unmarked.split('.');
  
                // Get the last part (file extension)
                const extension = parts[parts.length - 1];
  
                // Optionally, convert to lowercase
                const lowercaseExtension = extension.toLowerCase();
  
                const linkElement: HTMLElement = document.createElement("a");
                linkElement.setAttribute('href', item.product.image.unmarked);
                linkElement.setAttribute('download', `${item.product.boat.name} - ${item.product.name}.${lowercaseExtension}`);
  
                linkElement.addEventListener('click', async () => {
  
                });
  
                linkElement.appendChild(downloadButtonElement);
  
                cardElement.appendChild(linkElement);
  
              }
  
              element.appendChild(cardElement);
  
            }
  
          }
        }).catch((error) => {
          alert(error);
        });

      }

    }
  }

  load();

}