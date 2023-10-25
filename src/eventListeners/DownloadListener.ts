import {
  EL_ID_DOWNLOAD_ITEM_SAMPLE,
  EL_ID_DOWNLOAD_LIST,
  EL_CLASS_DOWNLOAD_BUTTON,
  EL_ID_DOWNLOAD_COUNT
} from "../constants/elements";

import { loadImageAsBase64 } from "../utils/image";

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

              console.log(item);

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
              }

              const downloadButtonElement = cardElement.querySelector(`.${EL_CLASS_DOWNLOAD_BUTTON}`) as HTMLElement;
              if (downloadButtonElement) {

                downloadButtonElement.style.cursor = 'pointer';

                downloadButtonElement.addEventListener('click', () => {

                  // Split the URL by dot
                  
                  const names = item.product.image.unmarked.split('/');
                  const nameFull = names[names.length - 1];

                  const parts = nameFull.split('.');
                  const name = parts[0];

                  // Get the last part (file extension)
                  const extension = parts[parts.length - 1];
                  const lowercaseExtension = extension.toLowerCase();

                  // Create an image element to load the image
                  const img = new Image();

                  img.crossOrigin = 'anonymous';
                  img.setAttribute('crossorigin', 'anonymous');

                  img.src = item.product.image.unmarked;

                  img.onload = function () {
                    // Create a canvas to draw the image
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);

                    // Convert the canvas content to a data URL
                    const dataURL = canvas.toDataURL('image/jpeg'); // Change format if needed

                    // Create a link element to trigger the download
                    const a = document.createElement('a');
                    a.href = dataURL;
                    a.download = `${item.product.boat.name} - ${name}.${lowercaseExtension}`; // Set the filename for the download
                    a.style.display = 'none';

                    // Add the link to the DOM and trigger the click event
                    document.body.appendChild(a);
                    a.click();

                    // Remove the link element from the DOM
                    document.body.removeChild(a);
                  };

                });

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