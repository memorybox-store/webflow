export const loadImageAsBase64 = async (url: string): Promise<string> => {
  // Fetch the image
  const response = await fetch(url);
  const blob = await response.blob();

  // Convert the image to base64
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert image to base64.'));
      }
    };
    reader.onerror = () => {
      reject(new Error('Failed to read image.'));
    };
    reader.readAsDataURL(blob);
  });
}