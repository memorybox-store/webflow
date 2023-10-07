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
              imageMarkElement.classList.remove('display-force');
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
                console.log(resultSource);

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
                            for (let detection of resultTarget.detections) {
                              compareFaces(resultSource.detections[0], detection).then((recognitionResult) => {
                                const imgTargetElement = document.getElementById(`product-${id}`) as HTMLImageElement;
                                if (recognitionResult) {
                                  imgTargetElement.classList.remove('hidden-force');
                                  imgTargetElement.classList.add('display-force');
                                  imgTargetElement.classList.add('found-face');
                                  const countElements = document.querySelectorAll('.found-face') as NodeListOf<HTMLElement>;
                                  if (countElements) {
                                    const countAvailable = Object.entries(countElements).length.toString();
                                    // Init result of image includes my picture
                                    const resultMyPicElement = document.getElementById(EL_ID_RESULT_SUM_MY_PIC) as HTMLElement;
                                    if (resultMyPicElement) {
                                      resultMyPicElement.innerText = countAvailable;
                                    }
                                  }
                                } else {
                                  imgTargetElement.classList.remove('display-force');
                                  imgTargetElement.classList.add('hidden-force');
                                }
                                if (parseInt(index) === parseInt(total)) {
                                  const scanningElement = document.getElementById(EL_ID_PHOTO_SCANNING) as HTMLImageElement;
                                  scanningElement?.classList.remove('popup-display-force');
                                }
                              });
                            }
                          });
                          imgElement.parentElement.removeChild(imgElement);
                        };
                        document.body.append(imgElement);
                      }
                    }
                  });
                }
              }).catch((message) => {
                alert(message);
              });

              // detectFace('facescan-test', options).then((resultTarget: any) => {
              //   console.log(resultTarget);

              //   // compareFaces(resultSource.detections[0], resultTarget.detections[0]).then((recognitionResult) => {
              //   //   console.log(recognitionResult);
              //   // });
              //   // drawFaceDetections(
              //   //   'myCanvas2',
              //   //   resultTarget.detections,
              //   //   resultTarget.source,
              //   //   options
              //   // ).then(async (outputTarget) => {
              //   //   console.log(outputTarget);
              //   //   compareFaces(resultSource.detections[0], resultTarget.detections[0]).then((recognitionResult) => {
              //   //     console.log(recognitionResult);
              //   //   });
              //   // }).catch(() => {

              //   // });
              // }).catch(() => {

              // });

            };

            reader.readAsDataURL(selectedFile);

          } else {
            alert("Please select a valid image file.");
            input.value = '';
          }
        }

        console.log(event);
      });


      const selectButtonElement = document.getElementById(EL_ID_FACESCAN_BTN) as HTMLInputElement;
      if (selectButtonElement) {
        const clonedElement: any = selectButtonElement.cloneNode(true);
        selectButtonElement.addEventListener('click', async () => {
          inputFileElement.click();
        });
        selectButtonElement.parentElement.replaceChild(clonedElement, clonedElement);
      }

    }).catch((error) => {
      console.log(error);
    });

  }
};
