import {
  nets,
  SsdMobilenetv1Options,
  detectAllFaces,
  resizeResults,
  draw,
  utils,
  euclideanDistance
} from 'face-api.js';

import { FACE_MODEL_PATH } from '../constants/configs';

// SsdMobilenetv1Options
const minConfidence = 0.2;
const recognitionTreshold = 0.5;

export const loadFaceModels = (options?: Array<any>) => {
  return new Promise(async (resolve, reject) => {

    const MODEL_URL = FACE_MODEL_PATH;

    const models = [
      nets.ssdMobilenetv1,
      ...options.filter(
        (option) => option === 'recognition'
          || option === 'landmark'
          || option === 'ageGender'
          || option === 'expression'
      ).map((option) => {
        if (option === 'recognition') {
          return nets.faceRecognitionNet;
        } else if (option === 'landmark') {
          return nets.faceLandmark68Net;
        } else if (option === 'ageGender') {
          return nets.ageGenderNet;
        } else if (option === 'expression') {
          return nets.faceExpressionNet;
        }
      })
    ];

    const defer = async (startIndex: number, items: Array<any>, chunkSize: number, callback: any) => {

      const endIndex = Math.min(startIndex + chunkSize, items.length);

      for (let i = startIndex; i < endIndex; i++) {
        await items[i].loadFromUri(MODEL_URL);
      }

      if (endIndex < items.length) {
        setTimeout(() => {
          defer(endIndex, items, chunkSize, callback);
        }, 0);
      } else {
        callback();
      }

    }

    const chunkSize = 1;
    defer(0, models, chunkSize, () => {
      resolve(true);
    });

  });
}

export const detectFace = async (image: string | HTMLImageElement, options?: Array<any>) => {
  return new Promise(async (resolve, reject) => {
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

export const matchFaces = (source: any, target: any) => {
  const sourceDescriptor = source.descriptor;
  const targetDescriptor = target.descriptor;
  const distance = euclideanDistance(sourceDescriptor, targetDescriptor);
  return (distance < recognitionTreshold) ? true : false;
}