import { getProductsScan } from "../api/product";
import {
  compareFaces,
  detectFace,
  drawFaceDetections,
  loadFaceModels
} from "../common/faceScan";
import {
  EL_CLASS_CARD_PHOTO,
  EL_ID_FACESCAN_BTN,
  EL_ID_FACESCAN_UPLOADER,
  EL_ID_PHOTO_SCANNING,
  EL_ID_RESULT_SUM_MY_PIC
} from "../constants/elements";
import { MSG_ERR_NO_FACE } from "../constants/messages";
import { Product } from "../models/product";

export const ScanListener = (): void => {

  // recognition, landmark, ageGender, expression
  const options: Array<any> = [
    'recognition',
    'landmark',
    'ageGender',
    // 'expression'
  ];

  const element = document.getElementById(EL_ID_FACESCAN_UPLOADER) as HTMLElement;
  if (element) {

    const scanningElement = document.getElementById(EL_ID_PHOTO_SCANNING) as HTMLImageElement;
    scanningElement?.classList.remove('popup-display-force');

    loadFaceModels(options).then(() => {

      const inputFileElement = document.createElement('input') as HTMLInputElement;
      inputFileElement.type = 'file';
      inputFileElement.style.display = 'none';
      element.appendChild(inputFileElement);
      inputFileElement.addEventListener('change', async (event) => {

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
                      let index: number = 0;
                      for (let item of data) {
                        index += 1;
                        if (item.imageNoMark) {
                          const imgElement: HTMLImageElement = document.createElement("img");
                          imgElement.crossOrigin = 'anonymous';
                          imgElement.setAttribute('crossorigin', 'anonymous');
                          imgElement.setAttribute('data-target', item.id);
                          imgElement.setAttribute('data-index', `${index}`);
                          imgElement.setAttribute('data-total', `${data.length}`);
                          imgElement.src = item.imageNoMark;
                          imgElement.style.display = 'none';
                          imgElement.onload = async () => {
                            const width = imgElement.width;
                            const height = imgElement.height;
                            imgElement.width = width;
                            imgElement.height = height;
                            const id: string = imgElement.getAttribute('data-target');
                            const index: string = imgElement.getAttribute('data-index');
                            const total: string = imgElement.getAttribute('data-total');
                            detectFace(imgElement, options).then(async (resultTarget: any) => {
                              const imgTargetElement = document.getElementById(`product-${id}`) as HTMLImageElement;
                              imgTargetElement.classList.remove('flex-force');
                              imgTargetElement.classList.add('hidden-force');
                              imgTargetElement.classList.remove('found-face');
                              if (!resultTarget || !resultTarget.detections.length) {
                                const scanningElement = document.getElementById(EL_ID_PHOTO_SCANNING) as HTMLImageElement;
                                scanningElement?.classList.remove('popup-display-force');
                              }
                              if (imgTargetElement) {
                                if (imgTargetElement.id !== 'result-sample') {
                                  for (let detection of resultTarget.detections) {
                                    compareFaces(resultSource.detections[0], detection).then((recognitionResult) => {
                                      if (recognitionResult) {
                                        imgTargetElement.classList.remove('hidden-force');
                                        imgTargetElement.classList.add('flex-force');
                                        imgTargetElement.classList.add('found-face');
                                        const countElements = document.querySelectorAll('.found-face') as NodeListOf<HTMLElement>;
                                        if (countElements) {
                                          const countAvailable = Object.entries(countElements).length || 0;
                                          // Init result of image includes my picture
                                          const resultMyPicElement = document.getElementById(EL_ID_RESULT_SUM_MY_PIC) as HTMLElement;
                                          if (resultMyPicElement) {
                                            resultMyPicElement.innerText = countAvailable.toString();
                                          }
                                        }
                                      }
                                      if (parseInt(index) === parseInt(total)) {
                                        const scanningElement = document.getElementById(EL_ID_PHOTO_SCANNING) as HTMLImageElement;
                                        scanningElement?.classList.remove('popup-display-force');
                                      }
                                    });
                                  }
                                }
                              }
                            });
                            imgElement.parentElement.removeChild(imgElement);
                          };
                          document.body.append(imgElement);
                        }
                      }
                    });
                  }
                } else {
                  alert(MSG_ERR_NO_FACE);
                  const scanningElement = document.getElementById(EL_ID_PHOTO_SCANNING) as HTMLImageElement;
                  scanningElement?.classList.remove('popup-display-force');
                  const imageMarkElements = document.querySelectorAll(`.${EL_CLASS_CARD_PHOTO}`) as NodeListOf<HTMLElement>;
                  if (imageMarkElements) {
                    for (const [_, imageMarkElement] of Object.entries(imageMarkElements)) {
                      if (imageMarkElement.id !== 'result-sample') {
                        imageMarkElement.classList.remove('hidden-force');
                        imageMarkElement.classList.add('flex-force');
                      }
                    }
                  }
                  const resultMyPicElement = document.getElementById(EL_ID_RESULT_SUM_MY_PIC) as HTMLElement;
                  if (resultMyPicElement) {
                    resultMyPicElement.innerText = 'N/A';
                  }
                }
              }).catch((message) => {
                alert(message);
              });

            };

            reader.readAsDataURL(selectedFile);

          } else {
            alert("Please select a valid image file.");
            input.value = '';
            const imageMarkElements = document.querySelectorAll(`.${EL_CLASS_CARD_PHOTO}`) as NodeListOf<HTMLElement>;
            if (imageMarkElements) {
              for (const [_, imageMarkElement] of Object.entries(imageMarkElements)) {
                if (imageMarkElement.id !== 'result-sample') {
                  imageMarkElement.classList.remove('hidden-force');
                  imageMarkElement.classList.add('flex-force');
                }
              }
            }
            const resultMyPicElement = document.getElementById(EL_ID_RESULT_SUM_MY_PIC) as HTMLElement;
            if (resultMyPicElement) {
              resultMyPicElement.innerText = 'N/A';
            }
          }
        }
      });

      const selectButtonElement = document.getElementById(EL_ID_FACESCAN_BTN) as HTMLInputElement;
      if (selectButtonElement) {
        const clonedElement: any = selectButtonElement.cloneNode(true);
        clonedElement.addEventListener('click', async () => {
          inputFileElement.click();
        });
        selectButtonElement.parentElement.replaceChild(clonedElement, selectButtonElement);
      }

    }).catch((error) => {
      console.log(error);
    });

  }
};
