import {
  EL_CLASS_CARD_PHOTO,
  EL_ID_FACESCAN_BTN,
  EL_ID_FIND_FORM,
  EL_ID_PHOTO_SCANNING,
  EL_ID_PHOTO_SCANNING_STATUS,
  EL_ID_RESULT_SAMPLE,
  EL_ID_RESULT_SUM_MY_PIC
} from "../constants/elements";
import {
  MSG_ERR_EMPTY_BOAT,
  MSG_ERR_EMPTY_COMPANY,
  MSG_ERR_EMPTY_DATE,
  MSG_ERR_EMPTY_GUIDE,
  MSG_ERR_INVALID_IMAGE,
  MSG_ERR_NO_FACE,
  MSG_ERR_UNKNOWN,
  MSG_FACESCAN_INITIALIZING,
  MSG_INFO_NOT_AVAIL,
  MSG_INFO_SCANNING_STATUS
} from "../constants/messages";
import {
  NAME_OK,
  NAME_SCANNING
} from "../constants/names";
import {
  DATA_ATT_EMPTY,
  DATA_ATT_EMPTY_BOAT,
  DATA_ATT_EMPTY_COMPANY,
  DATA_ATT_EMPTY_DATE,
  DATA_ATT_EMPTY_GUIDE,
  DATA_ATT_REDIRECT_URI,
  DATA_ATT_RESULT_URI
} from "../constants/attributes";
import { URL_RESULT } from "../constants/urls";

import {
  detectFace,
  loadFaceModels,
  matchFaces
} from "../common/faceScan";

import { getProductsScan } from "../api/product";

import { Product } from "../models/product";
import { getStorage, setStorage } from "../utils/storage";

import * as tingle from 'tingle.js';
import { multiLanguageUrl } from "../utils/language";
import { Company } from "../models/sale";
import { getCompanies } from "../api/sale";

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

const modalNoFace = new tingle.modal({
  footer: true,
  stickyFooter: false,
  closeMethods: ['overlay', 'button', 'escape'],
  closeLabel: '',
  onClose: () => {
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
      const msgEmptyMyPic: string = resultMyPicElement.getAttribute(DATA_ATT_EMPTY) || MSG_INFO_NOT_AVAIL;
      resultMyPicElement.innerText = msgEmptyMyPic;
    }
  },
  beforeClose: () => {
    return true;
  }
});
modalNoFace.setContent('');
modalNoFace.addFooterBtn(NAME_OK, 'tingle-btn tingle-btn--primary', () => modalNoFace.close());

const modalInvalid = new tingle.modal({
  footer: true,
  stickyFooter: false,
  closeMethods: ['overlay', 'button', 'escape'],
  closeLabel: '',
  onClose: () => {
    const inputFileElement = document.getElementById('facescan-input') as HTMLInputElement;
    if (inputFileElement) {
      inputFileElement.value = '';
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
        const msgEmptyMyPic: string = resultMyPicElement.getAttribute(DATA_ATT_EMPTY) || MSG_INFO_NOT_AVAIL;
        resultMyPicElement.innerText = msgEmptyMyPic;
      }
    }
  },
  beforeClose: () => {
    return true;
  }
});
modalInvalid.setContent('');
modalInvalid.addFooterBtn(NAME_OK, 'tingle-btn tingle-btn--primary', () => modalInvalid.close());

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
              if (imgTargetElement) {
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
              }

              const countElements = document.querySelectorAll('.found-face') as NodeListOf<HTMLElement>;
              if (countElements) {
                const countAvailable = Object.entries(countElements).length || 0;
                // Init result of image includes my picture
                const resultMyPicElement = document.getElementById(EL_ID_RESULT_SUM_MY_PIC) as HTMLElement;
                if (resultMyPicElement) {
                  resultMyPicElement.innerText = countAvailable.toString();
                  setStorage('status-mypic', countAvailable.toString());
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

      const scan = (src: string) => {
        setStorage('face', src).then(async () => {
          const path: string = window.location.pathname;
          if (!multiLanguageUrl(URL_RESULT, true).includes(path)) {

            const formElement = document.getElementById(EL_ID_FIND_FORM) as HTMLFormElement;
            if (formElement) {

              const msgEmptyCompany: string = formElement.getAttribute(DATA_ATT_EMPTY_COMPANY) || MSG_ERR_EMPTY_COMPANY;
              const msgEmptyDate: string = formElement.getAttribute(DATA_ATT_EMPTY_DATE) || MSG_ERR_EMPTY_DATE;
              const msgEmptyBoat: string = formElement.getAttribute(DATA_ATT_EMPTY_BOAT) || MSG_ERR_EMPTY_BOAT;
              const msgEmptyGuide: string = formElement.getAttribute(DATA_ATT_EMPTY_GUIDE) || MSG_ERR_EMPTY_GUIDE;

              const formData = new FormData(formElement);

              let company = '';

              const boatValue = formData.get('boat') as string || '';
              const companyValue = formData.get('company') as string || '';
              const dateValue = formData.get('date') as string || '';
              if (companyValue) {
                company = companyValue;
              }

              await getCompanies().then(async (companies: Array<any>) => {

                const url = new URL(window.location.href);
                let companyParam = url.searchParams.get("company");
                if (companyParam) {
                  const companySelected: Company = companies.find((data: Company) => data.shortname === companyParam);
                  if (companySelected) {
                    company = companySelected.id.toString();
                  }
                }

                if (company && dateValue && boatValue) {
                  const companyName = companies.find((data: Company) => data.id.toString() === company)?.name || '';
                  await setStorage('result-fid', boatValue);
                  await setStorage('result-date', dateValue);
                  await setStorage('result-company', companyName);
                  const result = element.getAttribute(DATA_ATT_RESULT_URI) || '';
                  if (result) {
                    location.href = `${result}?fid=${boatValue}&date=${dateValue}&mid=&company=${encodeURI(companyName)}&run=true`;
                  } else {
                    location.href = `./${URL_RESULT}?fid=${boatValue}&date=${dateValue}&mid=&company=${encodeURI(companyName)}&run=true`;
                  }
                } else {
                  if (!company) {
                    modal.setContent(msgEmptyCompany || MSG_ERR_UNKNOWN);
                    modal.open();
                  } else if (!dateValue) {
                    modal.setContent(msgEmptyDate || MSG_ERR_UNKNOWN);
                    modal.open();
                  } else if (!boatValue) {
                    modal.setContent(msgEmptyBoat || MSG_ERR_UNKNOWN);
                    modal.open();
                  }
                }
              }).catch((message) => {
                modal.setContent(message || MSG_ERR_UNKNOWN);
                modal.open();
              });
            }

          } else {
            
            const img = new Image();

            img.onload = () => {

              const scanningElement = document.getElementById(EL_ID_PHOTO_SCANNING) as HTMLImageElement;
              scanningElement?.classList.add('popup-display-force');

              detectFace(img, options).then(async (resultSource: any) => {
                if (resultSource && resultSource.detections.length) {

                  const resultBox = resultSource.detections[0].alignedRect._box;

                  const canvasElement = document.createElement('canvas');
                  canvasElement.width = resultBox.width; // Set the width of the canvas
                  canvasElement.height = resultBox.height;
                  const ctx = canvasElement.getContext('2d');

                  ctx.drawImage(
                    img,
                    resultBox.left,
                    resultBox.top,
                    resultBox.width,
                    resultBox.height,
                    0,
                    0,
                    resultBox.width,
                    resultBox.height
                  );

                  const imgElement = document.getElementById('facescan-preview') as HTMLImageElement;
                  imgElement.src = canvasElement.toDataURL('image/jpeg');
                  imgElement.alt = "My picture preview";
                  imgElement.style.objectFit = 'cover';

                  await getStorage('result-fid').then(async (boat: string) => {
                    if (boat && boat !== 'null') {
                      await getProductsScan(boat).then(async (data: Product[]) => {
                        if (data.length) {
                          const chunkSize = 1;
                          defer(0, data, resultSource.detections[0], chunkSize, () => {
                            const scanningElement = document.getElementById(EL_ID_PHOTO_SCANNING) as HTMLImageElement;
                            scanningElement?.classList.remove('popup-display-force');
                            const resultRealtimeElement = document.getElementById(EL_ID_PHOTO_SCANNING_STATUS) as HTMLElement;
                            if (resultRealtimeElement) {
                              resultRealtimeElement.innerText = '';
                            }
                          });
                        } else {
                          const scanningElement = document.getElementById(EL_ID_PHOTO_SCANNING) as HTMLImageElement;
                          scanningElement?.classList.remove('popup-display-force');
                        }
                      });
                    }
                  });
                } else {
                  modalNoFace.setContent(msgNoFace || MSG_ERR_UNKNOWN);
                  modalNoFace.open();
                }
              }).catch((message) => {
                modal.setContent(message || MSG_ERR_UNKNOWN);
                modal.open();
              });

            };

            img.src = src;

          }
        });
      }

      const inputFileElement = document.createElement('input') as HTMLInputElement;
      inputFileElement.id = 'facescan-input';
      inputFileElement.type = 'file';
      inputFileElement.style.display = 'none';
      element.parentElement.appendChild(inputFileElement);
      inputFileElement.addEventListener('change', async (event) => {

        const resultMyPicElement = document.getElementById(EL_ID_RESULT_SUM_MY_PIC) as HTMLElement;
        if (resultMyPicElement) {
          const msgEmptyMyPic: string = resultMyPicElement.getAttribute(DATA_ATT_EMPTY) || MSG_INFO_NOT_AVAIL;
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

            reader.onload = async (e) => {
              if (e.target && e.target.result) {
                const src = e.target.result as string;
                scan(src);
              }
            };

            reader.readAsDataURL(selectedFile);

          } else {
            modalInvalid.setContent(msgInvalidImage || MSG_ERR_UNKNOWN);
            modalInvalid.open();
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

      const url = new URL(window.location.href);
      let run = url.searchParams.get("run");
      if (run) {
        getStorage('face').then((face: string) => {
          if (face) {
            scan(face);
          }
        });
      }

    }).catch((error) => {
      console.log(error);
    });

  }
};
