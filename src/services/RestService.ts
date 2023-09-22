import { API_KEY } from '../contances/configs';

import StorageService from './StorageService';

const RestService = {
  retrieveHeader: async (
    requireSession: boolean = false,
    encodedFormData: boolean = false
  ) => {
    const getLoginToken = async () => {
      return await StorageService.get('token', true);
    }
    let headers: any = {};
    headers['Authenticate'] = API_KEY;
    if (encodedFormData) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    if (requireSession) {
      const loginToken = await getLoginToken();
      if (loginToken) {
        headers['Authorization'] = `Bearer ${loginToken}`;
      }
    }
    return headers;
  },
  async createFormData(values: any = null) {
    let formData = new FormData();
    if (values !== null && typeof values === 'object') {
      for (const key in values) {
        await formData.append(
          (values instanceof FileList) ? 
          key.endsWith("[]") ? key : `${key}[]`
          : key
          , 
          (
            values[key] !== null 
            && typeof values[key] === 'object' 
            && !(values[key] instanceof FileList)
            && !(values[key] instanceof Blob || values[key] instanceof File)
          ) ? 
          JSON.stringify(values[key]) 
          : values[key]
        );
      }
    }
    return formData;
  }
}

export default RestService;