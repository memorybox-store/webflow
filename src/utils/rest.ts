import { API_KEY } from '../constants/configs';

import { getStorage } from './storage';

import { Session } from '../models/user';
import { MSG_ERR_API_NOT_PERMIT, MSG_ERR_UNKNOWN } from '../constants/messages';

export const createRequestHeader = async (
  requireSession: boolean = false,
  requireKey: boolean = false,
  contentType: string = 'application/json'
) => {
  const getAccessToken = async () => {
    const session: Session = await getStorage('session', true) as Session || null;
    return session?.accessToken || null;
  }
  let headers: any = {};
  if (requireKey) {
    headers['Authenticate'] = API_KEY;
  }
  if (contentType) {
    headers['Content-Type'] = contentType;
  } else {
    headers['Content-Type'] = 'text/plain';
  }
  if (requireSession) {
    const loginToken = await getAccessToken();
    if (loginToken) {
      headers['Authorization'] = `Bearer ${loginToken}`;
    }
  }
  return headers;
}

export const handleResponseError = (error: any) => {
  let message = error.message;
  if (error.response.data) {
    if (error.response.data.Message) {
      message = error.response.data.Message;
    } else if (error.response.data.error) {
      if (error.response.data.error_description) {
        message = error.response.data.error_description;
      } else {
        if (error.response.data.error === 'invalid_client') {
          message = MSG_ERR_API_NOT_PERMIT;
        } else {
          message = error.response.data.error;
        }
      }
    } else {
      message = error.response.statusText || MSG_ERR_UNKNOWN;
    }
  }
  return message;
}

export const createFormData = async (values: any = null) => {
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