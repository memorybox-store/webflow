import * as faceapi from 'face-api.js';

// SsdMobilenetv1Options
const minConfidence = 0.1;

const loadModels = () => {
  return new Promise(async (resolve, reject) => {

    const MODEL_URL = './assets/models';

    Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ]).then(() => {
      resolve(true);
    }).catch((error) => {
      reject(error);
    });

  });
}

const detectFaceTest = async () => {

  const faceDetectionOptions = new faceapi.SsdMobilenetv1Options({ minConfidence });

  const input: any = document.getElementById('myImg');

  const detections = await faceapi.detectAllFaces(input, faceDetectionOptions)
    .withFaceLandmarks()
    .withAgeAndGender()
    .withFaceExpressions();
  console.log(detections);

  const detectionsForSize = faceapi.resizeResults(detections, { width: input.width, height: input.height });

  // draw them into a canvas
  const canvas: any = document.getElementById('myCanvas') as any
  canvas.width = input.width;
  canvas.height = input.height;
  faceapi.draw.drawDetections(canvas, detectionsForSize);
  // faceapi.draw.drawFaceExpressions(canvas, detectionsForSize);
  faceapi.draw.drawFaceLandmarks(canvas, detectionsForSize.map((res: any) => res.landmarks));
  faceapi.draw.drawDetections(canvas, detectionsForSize.map((res: any) => res.detection));

  detectionsForSize.forEach((res: any) => {
    const { age, gender, genderProbability } = res
    new faceapi.draw.DrawTextField(
      [
        `${faceapi.utils.round(age, 0)} years`,
        `${gender} (${faceapi.utils.round(genderProbability)})`
      ],
      res.detection.box.bottomLeft
    ).draw(canvas)
  })

  // faceapi.saveFile('faceDetection.jpg', canvas.toBuffer('image/jpeg'))

}

export const ScanEvent = (): void => {
  try {
    loadModels().then(() => {
      detectFaceTest();
    }).catch((error) => {
      console.log(error);
    });
  } catch { }
};
