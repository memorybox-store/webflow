import {
  EL_CLASS_CARD_PHOTO,
  EL_ID_FACESCAN_BTN,
  EL_ID_PHOTO_SCANNING,
  EL_ID_PHOTO_SCANNING_STATUS,
  EL_ID_RESULT_SAMPLE,
  EL_ID_RESULT_SUM_MY_PIC
} from "../constants/elements";
import { 
  MSG_ERR_INVALID_IMAGE, 
  MSG_ERR_NO_FACE, 
  MSG_FACESCAN_INITIALIZING, 
  MSG_INFO_NOT_AVAIL, 
  MSG_INFO_SCANNING_STATUS 
} from "../constants/messages";
import { NAME_SCANNING } from "../constants/names";

import {
  detectFace,
  loadFaceModels,
  matchFaces
} from "../common/faceScan";

import { getProductsScan } from "../api/product";

import { Product } from "../models/product";

export const ScanListener = (): void => {

  // recognition, landmark, ageGender, expression
  const options: Array<any> = [
    'recognition',
    'landmark',
    // 'expression'
  ];

  const element = document.getElementById(EL_ID_FACESCAN_BTN) as HTMLElement;
  if (element) {

    const msgNoFace: string = element.getAttribute('data-noface') || MSG_ERR_NO_FACE;
    const msgInvalidImage: string = element.getAttribute('data-invalid') || MSG_ERR_INVALID_IMAGE;
    const msgInitializing: string = element.getAttribute('data-initializing') || MSG_FACESCAN_INITIALIZING;
    const msgScanning: string = element.getAttribute('data-scanning') || NAME_SCANNING;
    const msgScanningStatus: string = element.getAttribute('data-scanning-status') || MSG_INFO_SCANNING_STATUS;

    const scanningElement = document.getElementById(EL_ID_PHOTO_SCANNING) as HTMLImageElement;
    scanningElement?.classList.remove('popup-display-force');

    const name = element.innerHTML;
    element.innerHTML = msgInitializing;
    element.style.pointerEvents = 'none';
    element.style.opacity = '0.5';

    loadFaceModels(options).then(() => {

      element.innerHTML = name;
      element.style.pointerEvents = 'all';
      element.style.opacity = '1';

      const inputFileElement = document.createElement('input') as HTMLInputElement;
      inputFileElement.type = 'file';
      inputFileElement.style.display = 'none';
      element.parentElement.appendChild(inputFileElement);
      inputFileElement.addEventListener('change', async (event) => {

        const resultMyPicElement = document.getElementById(EL_ID_RESULT_SUM_MY_PIC) as HTMLElement;
        if (resultMyPicElement) {
          const msgEmptyMyPic: string = resultMyPicElement.getAttribute('data-empty') || MSG_INFO_NOT_AVAIL;
          resultMyPicElement.innerText = msgEmptyMyPic;
        }

        const resultRealtimeElement = document.getElementById(EL_ID_PHOTO_SCANNING_STATUS) as HTMLElement;
        if (resultRealtimeElement) {
          resultRealtimeElement.innerText = msgScanning;
        }

        const imageMarkElements = document.querySelectorAll(`.${EL_CLASS_CARD_PHOTO}`) as NodeListOf<HTMLElement>;
        if (imageMarkElements) {
          for (const [_, imageMarkElement] of Object.entries(imageMarkElements)) {
            imageMarkElement.classList.remove('found-face');
            imageMarkElement.classList.remove('scanned');
          }
        }

        const input = event.target as HTMLInputElement;
        const files = input.files;

        if (files && files.length > 0) {

          const imageMarkElements = document.querySelectorAll(`.${EL_CLASS_CARD_PHOTO}`) as NodeListOf<HTMLElement>;
          if (imageMarkElements) {
            for (const [_, imageMarkElement] of Object.entries(imageMarkElements)) {
              imageMarkElement.classList.remove('flex-force');
              imageMarkElement.classList.add('hidden-force');
            }
          }

          const selectedFile: File = files[0];

          if (selectedFile.type.startsWith("image/")) {

            const reader = new FileReader();

            const defer = async (startIndex: number, items: Product[], sourceDetections: any, chunkSize: number, callback: any) => {

              const endIndex = Math.min(startIndex + chunkSize, items.length);

              for (let i = startIndex; i < endIndex; i++) {
                const item: Product = items[i];
                if (item.image.unmarked) {
                  const imgElement: HTMLImageElement = document.createElement("img");
                  imgElement.crossOrigin = 'anonymous';
                  imgElement.setAttribute('crossorigin', 'anonymous');
                  imgElement.setAttribute('data-target', item.id);
                  imgElement.src = item.image.unmarked;
                  imgElement.style.display = 'none';
                  const width = imgElement.width;
                  const height = imgElement.height;
                  imgElement.width = width;
                  imgElement.height = height;
                  const id: string = imgElement.getAttribute('data-target');
                  await detectFace(imgElement, options).then(async (resultTarget: any) => {
                    const imgTargetElement = document.getElementById(`product-${id}`) as HTMLImageElement;
                    imgTargetElement.classList.remove('flex-force');
                    imgTargetElement.classList.add('hidden-force');
                    imgTargetElement.classList.remove('found-face');
                    if (!resultTarget || !resultTarget.detections.length) {
                      const scanningElement = document.getElementById(EL_ID_PHOTO_SCANNING) as HTMLImageElement;
                      scanningElement?.classList.remove('popup-display-force');
                    }
                    if (imgTargetElement && imgTargetElement.id !== EL_ID_RESULT_SAMPLE) {
                      const results = resultTarget.detections.map((detection: any) => {
                        return matchFaces(sourceDetections, detection);
                      });
                      imgTargetElement.classList.add('scanned');
                      if (results.includes(true)) {
                        imgTargetElement.classList.remove('hidden-force');
                        imgTargetElement.classList.add('flex-force');
                        imgTargetElement.classList.add('found-face');
                      }
                    }

                    const countElements = document.querySelectorAll('.found-face') as NodeListOf<HTMLElement>;
                    if (countElements) {
                      const countAvailable = Object.entries(countElements).length || 0;
                      // Init result of image includes my picture
                      const resultMyPicElement = document.getElementById(EL_ID_RESULT_SUM_MY_PIC) as HTMLElement;
                      if (resultMyPicElement) {
                        resultMyPicElement.innerText = countAvailable.toString();
                      }
                      const scannedElements = document.querySelectorAll('.scanned') as NodeListOf<HTMLElement>;
                      if (scannedElements) {
                        const countScanned = Object.entries(scannedElements).length || 0;
                        const resultRealtimeElement = document.getElementById(EL_ID_PHOTO_SCANNING_STATUS) as HTMLElement;
                        if (resultRealtimeElement) {
                          resultRealtimeElement.innerText = msgScanningStatus
                            .replace('{{scanned}}', countScanned.toString())
                            .replace('{{total}}', items.length.toString())
                            .replace('{{found}}', countAvailable.toString());
                        }
                      }
                    }
                  });
                }
              }

              if (endIndex < items.length) {
                setTimeout(() => {
                  defer(endIndex, items, sourceDetections, chunkSize, callback);
                }, 0);
              } else {
                callback();
              }

            }

            reader.onload = async (e) => {

              const imgElement = document.getElementById('facescan-preview') as HTMLImageElement;
              imgElement.src = e.target?.result as string;
              imgElement.alt = "My picture preview";
              imgElement.style.objectFit = 'cover';

              const scanningElement = document.getElementById(EL_ID_PHOTO_SCANNING) as HTMLImageElement;
              scanningElement?.classList.add('popup-display-force');

              detectFace('facescan-preview', options).then(async (resultSource: any) => {
                if (resultSource && resultSource.detections.length) {

                  const url = new URL(window.location.href);
                  const boatId = url.searchParams.get("fid");
                  if (boatId) {

                    await getProductsScan(boatId).then(async (data: Product[]) => {
                      const chunkSize = 1;
                      defer(0, data, resultSource.detections[0], chunkSize, () => {
                        const scanningElement = document.getElementById(EL_ID_PHOTO_SCANNING) as HTMLImageElement;
                        scanningElement?.classList.remove('popup-display-force');
                        const resultRealtimeElement = document.getElementById(EL_ID_PHOTO_SCANNING_STATUS) as HTMLElement;
                        if (resultRealtimeElement) {
                          resultRealtimeElement.innerText = '';
                        }
                      });
                    });
                  }
                } else {
                  alert(msgNoFace);
                  const scanningElement = document.getElementById(EL_ID_PHOTO_SCANNING) as HTMLImageElement;
                  scanningElement?.classList.remove('popup-display-force');
                  const imageMarkElements = document.querySelectorAll(`.${EL_CLASS_CARD_PHOTO}`) as NodeListOf<HTMLElement>;
                  if (imageMarkElements) {
                    for (const [_, imageMarkElement] of Object.entries(imageMarkElements)) {
                      if (imageMarkElement.id !== EL_ID_RESULT_SAMPLE) {
                        imageMarkElement.classList.remove('hidden-force');
                        imageMarkElement.classList.add('flex-force');
                      }
                    }
                  }
                  const resultMyPicElement = document.getElementById(EL_ID_RESULT_SUM_MY_PIC) as HTMLElement;
                  if (resultMyPicElement) {
                    const msgEmptyMyPic: string = resultMyPicElement.getAttribute('data-empty') || MSG_INFO_NOT_AVAIL;
                    resultMyPicElement.innerText = msgEmptyMyPic;
                  }
                }
              }).catch((message) => {
                alert(message);
              });

            };

            reader.readAsDataURL(selectedFile);

          } else {
            alert(msgInvalidImage);
            input.value = '';
            const imageMarkElements = document.querySelectorAll(`.${EL_CLASS_CARD_PHOTO}`) as NodeListOf<HTMLElement>;
            if (imageMarkElements) {
              for (const [_, imageMarkElement] of Object.entries(imageMarkElements)) {
                if (imageMarkElement.id !== EL_ID_RESULT_SAMPLE) {
                  imageMarkElement.classList.remove('hidden-force');
                  imageMarkElement.classList.add('flex-force');
                }
              }
            }
            const resultMyPicElement = document.getElementById(EL_ID_RESULT_SUM_MY_PIC) as HTMLElement;
            if (resultMyPicElement) {
              const msgEmptyMyPic: string = resultMyPicElement.getAttribute('data-empty') || MSG_INFO_NOT_AVAIL;
              resultMyPicElement.innerText = msgEmptyMyPic;
            }
          }
        }
      });

      const selectButtonElement = document.getElementById(EL_ID_FACESCAN_BTN) as HTMLInputElement;
      if (selectButtonElement) {
        const fileSelectElement: any = selectButtonElement.cloneNode(true);
        fileSelectElement.addEventListener('click', async () => {
          inputFileElement.click();
        });
        selectButtonElement.parentElement.replaceChild(fileSelectElement, selectButtonElement);
      }

    }).catch((error) => {
      console.log(error);
    });

  }
};
