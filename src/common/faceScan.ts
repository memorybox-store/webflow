import {
  nets,
  SsdMobilenetv1Options,
  detectSingleFace,
  detectAllFaces,
  resizeResults,
  draw,
  utils,
  euclideanDistance
} from 'face-api.js';

import * as canvas from '@napi-rs/canvas';
import { FACE_MODEL_PATH } from '../constants/configs';

// SsdMobilenetv1Options
const minConfidence = 0.2;
const recognitionTreshold = 0.5;

export const loadFaceModels = (options?: Array<any>) => {
  return new Promise(async (resolve, reject) => {

    // const MODEL_URL = './assets/models';
    const MODEL_URL = FACE_MODEL_PATH;

    const models: Array<any> = [nets.ssdMobilenetv1.loadFromUri(MODEL_URL)];
    if (options && options.length) {
      if (options.includes('recognition')) {
        await models.push(nets.faceRecognitionNet.loadFromUri(MODEL_URL));
      }
      if (options.includes('landmark')) {
        await models.push(nets.faceLandmark68Net.loadFromUri(MODEL_URL));
      }
      if (options.includes('ageGender')) {
        await models.push(nets.ageGenderNet.loadFromUri(MODEL_URL));
      }
      if (options.includes('expression')) {
        await models.push(nets.faceExpressionNet.loadFromUri(MODEL_URL));
      }
    }

    Promise.all(models).then(() => {
      resolve(true);
    }).catch((error) => {
      reject(error);
    });

  });
}

export const detectFace = async (image: string | HTMLImageElement, options?: Array<any>) => {
  return await new Promise(async (resolve, reject) => {
    try {
      const faceDetectionOptions = new SsdMobilenetv1Options({ minConfidence });
      const inputElement: HTMLImageElement | undefined | null = (typeof image === 'string')
        ? document.getElementById(image) as HTMLImageElement
        : image;
      let detections = null;
      if (inputElement) {
        if (options && options.length) {
          if (
            options.includes('landmark')
            && options.includes('ageGender')
            && options.includes('expression')
          ) {
            detections = await detectAllFaces(inputElement, faceDetectionOptions)
              .withFaceLandmarks()
              .withFaceDescriptors()
              .withAgeAndGender()
              .withFaceExpressions();
          } else if (
            options.includes('landmark')
            && options.includes('ageGender')
          ) {
            detections = await detectAllFaces(inputElement, faceDetectionOptions)
              .withFaceLandmarks()
              .withFaceDescriptors()
              .withAgeAndGender();
          } else if (
            options.includes('landmark')
            && options.includes('expression')
          ) {
            detections = await detectAllFaces(inputElement, faceDetectionOptions)
              .withFaceLandmarks()
              .withFaceDescriptors()
              .withFaceExpressions();
          } else if (
            options.includes('ageGender')
            && options.includes('expression')
          ) {
            detections = await detectAllFaces(inputElement, faceDetectionOptions)
              .withAgeAndGender()
              .withFaceExpressions();
          } else if (options.includes('landmark')) {
            detections = await detectAllFaces(inputElement, faceDetectionOptions)
              .withFaceLandmarks()
              .withFaceDescriptors();
          } else if (options.includes('ageGender')) {
            detections = await detectAllFaces(inputElement, faceDetectionOptions)
              .withAgeAndGender();
          } else if (options.includes('expression')) {
            detections = await detectAllFaces(inputElement, faceDetectionOptions)
              .withFaceExpressions();
          } else {
            detections = await detectAllFaces(inputElement, faceDetectionOptions);
          }
        }
      }
      resolve(
        {
          source: inputElement,
          detections: detections
        }
      );
    } catch (error) {
      reject(error);
    }
  });
}

export const drawFaceDetections = async (
  outputId: string,
  detections: string,
  inputElement: any,
  options?: Array<any>
) => {
  return new Promise(async (resolve, reject) => {

    try {

      if (typeof inputElement === 'string') {
        inputElement = document.getElementById(inputElement);
      }

      const detectionsForSize: any = resizeResults(
        detections,
        {
          width: inputElement.width,
          height: inputElement.height
        }
      );

      // draw them into a canvas
      const canvas: any = document.getElementById(outputId) as any;
      canvas.width = inputElement.width;
      canvas.height = inputElement.height;

      const draws: Array<any> = [draw.drawDetections(canvas, detectionsForSize)];
      if (options && options.length) {
        if (options.includes('landmark')) {
          await draws.push(draw.drawFaceLandmarks(canvas, detectionsForSize.map((res: any) => res.landmarks)));
        }
        if (options.includes('ageGender')) {
          await draws.push(
            detectionsForSize.forEach(async (res: any) => {
              const { age, gender, genderProbability } = res
              await new draw.DrawTextField(
                [
                  `${utils.round(age, 0)} years`,
                  `${gender} (${utils.round(genderProbability)})`
                ],
                res.detection.box.bottomLeft
              ).draw(canvas)
            })
          );
        }
        if (options.includes('expression')) {
          await draws.push(draw.drawFaceExpressions(canvas, detectionsForSize));
        }
      }

      Promise.all(draws).then(() => {
        resolve(canvas);
      }).catch((error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }

  });
}

export const compareFaces = (source: any, target: any) => {
  return new Promise(async (resolve) => {
    const sourceDescriptor = source.descriptor;
    const targetDescriptor = target.descriptor;
    const distance = euclideanDistance(sourceDescriptor, targetDescriptor);
    if (distance < recognitionTreshold) {
      resolve(true);
    } else {
      resolve(false);
    }
  });
}

export const saveResultToImage = async (targetFile: string, canvas: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      // saveFile('faceDetection.jpg', canvas.toBuffer('image/jpeg'));
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
}