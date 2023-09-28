import {
  compareFaces,
  detectFace,
  drawFaceDetections,
  loadFaceModels
} from "../common/faceScan";
import { EL_ID_FACESCAN_UPLOADER } from "../constants/elements";

export const ScanListener = (): void => {

  // recognition, landmark, ageGender, expression
  const options: Array<any> = [
    'recognition',
    'landmark',
    'ageGender',
    // 'expression'
  ];

  const element = document.getElementById(EL_ID_FACESCAN_UPLOADER) as HTMLInputElement;
  if (element) {

    loadFaceModels(options).then(() => {
      detectFace('myImg', options).then((resultSource: any) => {
        console.log(resultSource);
        drawFaceDetections(
          'myCanvas',
          resultSource.detections,
          resultSource.source,
          options
        ).then((outputSource) => {
          console.log(outputSource);
          detectFace('myImg2', options).then((resultTarget: any) => {
            console.log(resultTarget);
            drawFaceDetections(
              'myCanvas2',
              resultTarget.detections,
              resultTarget.source,
              options
            ).then(async (outputTarget) => {
              console.log(outputTarget);
              compareFaces(resultSource.detections[0], resultTarget.detections[0]).then((recognitionResult) => {
                console.log(recognitionResult);
              });
            }).catch(() => {
  
            });
          }).catch(() => {
  
          });
        }).catch(() => {
  
        });
      }).catch(() => {
  
      });
    }).catch((error) => {
      console.log(error);
    });
    
  }
};
