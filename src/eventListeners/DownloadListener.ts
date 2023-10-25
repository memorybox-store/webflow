import {
  EL_ID_DOWNLOAD_ITEM_SAMPLE,
  EL_ID_DOWNLOAD_LIST,
  EL_CLASS_DOWNLOAD_BUTTON,
  EL_ID_DOWNLOAD_COUNT
} from "../constants/elements";
import { NAME_OK } from "../constants/names";
import { MSG_ERR_UNKNOWN } from "../constants/messages";

import * as tingle from 'tingle.js';

import { loadImageAsBase64 } from "../utils/image";

import { getOrder } from "../api/order";
import { Order } from "../models/order";

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

export const DownloadListener = async (): Promise<void> => {

  const updateDownloads = async () => {
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
                let count = 0;
                if (downloadCountElement.innerText && downloadCountElement.innerText !== '0') {
                  count = parseInt(downloadCountElement.innerText);
                }
                count += 1;
                downloadCountElement.innerHTML = count.toString();
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

                imgElement.onload = () => {

                  // Split the URL by dot

                  const names = item.product.image.unmarked.split('/');
                  const nameFull = names[names.length - 1];

                  const parts = nameFull.split('.');
                  const name = parts[0];

                  // Get the last part (file extension)
                  const extension = parts[parts.length - 1];
                  const lowercaseExtension = extension.toLowerCase();

                  // Create a canvas to draw the image
                  const canvas = document.createElement('canvas');
                  canvas.width = imgElement.width;
                  canvas.height = imgElement.height;
                  const ctx = canvas.getContext('2d');
                  ctx.drawImage(imgElement, 0, 0);

                  // Convert the canvas content to a data URL
                  const dataURL = canvas.toDataURL('image/jpeg'); // Change format if needed

                  const downloadButtonElement = cardElement.querySelector(`.${EL_CLASS_DOWNLOAD_BUTTON}`) as HTMLElement;
                  if (downloadButtonElement) {

                    downloadButtonElement.style.cursor = 'pointer';

                    downloadButtonElement.addEventListener('click', () => {
                      const a = document.createElement('a');
                      a.href = dataURL;
                      a.download = `${item.product.boat.name} - ${name}.${lowercaseExtension}`;
                      a.style.display = 'none';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    });

                  }

                };
              }

              element.appendChild(cardElement);

            }

          }
        }).catch((message) => {
          modal.setContent(message || MSG_ERR_UNKNOWN);
          modal.open();
        });

      }

    }
  }

  updateDownloads();

}