import { API_KEY } from '../contances/configs';

import { Session } from '../models/UserModel';

import StorageService from './StorageService';

const RestService = {
  retrieveHeader: async (
    requireSession: boolean = false,
    requireKey: boolean = false,
    encodedFormData: boolean = false
  ) => {
    const getAccessToken = async () => {
      const session: Session = await StorageService.get('session', true) as Session || null;
      return session?.accessToken || null;
    }
    let headers: any = {};
    if (requireKey) {
      headers['Authenticate'] = API_KEY;
    }
    if (encodedFormData) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    if (requireSession) {
      const loginToken = await getAccessToken();
      if (loginToken) {
        headers['Authorization'] = `Bearer ${loginToken}`;
      }
    }
    return headers;
  },
  handleResponseError: (error: any) => {
    let message = error.message;
    if (error.response.data) {
      if (error.response.data.Message) {
        message = error.response.data.Message;
      } else if (error.response.data.error) {
        if (error.response.data.error_description) {
          message = error.response.data.error_description;
        } else {
          if (error.response.data.error === 'invalid_client') {
            message = 'Access Denied - Unauthorized API Usage';
          } else {
            message = error.response.data.error;
          }
        }
      } else {
        message = error.response.statusText || 'Unknown Error';
      }
    }
    return message;
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