import { SERVER } from '../constants/configs';
import { MSG_ERR_EMP_DATA, MSG_ERR_EMP_RES } from '../constants/messages';

import axios, { AxiosResponse } from 'axios';
axios.defaults.withCredentials = true;
import moment from '../config/moment';

import { createRequestHeader, handleResponseError } from '../utils/rest';
import { getStorage, removeStorage, setStorage } from '../utils/storage';

import { Profile, Session } from '../models/user';

export const authen = async () => {
  return new Promise(async (resolve, reject) => {
    const session: Session = await getStorage('session', true) as Session || null;
    if (session) {
      if (session.expires && moment(session.expires) < moment()) {
        reject();
      } else {
        resolve(true);
      }
    } else {
      reject();
    }
  });
};

export const signin = async (username: string, password: string) => {
  return new Promise(async (resolve, reject) => {
    const payload = {
      grant_type: 'password',
      username: username,
      password: password
    }
    await axios.post(
      `${SERVER}/token`,
      payload,
      {
        withCredentials: true,
        ...{
          headers: await createRequestHeader(false, true, 'application/x-www-form-urlencoded')
        }
      }
    ).then(async (response: AxiosResponse<any, any>) => {
      if (response.data) {
        const data = response.data;
        const session: Session = {
          accessToken: data.access_token,
          tokenType: data.token_type,
          refreshToken: data.refresh_token,
          expiresIn: data.expires_in,
          expires: data['.expires'] ? moment(data['.expires']).format() : null,
          issued: data['.issued'] ? moment(data['.issued']).format() : null,
        };
        console.log(session);
        await setStorage('session', session, true);
        resolve(session);
      } else {
        reject(MSG_ERR_EMP_RES);
      }
    }).catch((error) => {
      reject(handleResponseError(error));
    });
  });
}

export const signout = async () => {
  return new Promise(async (resolve, reject) => {
    removeStorage('session').then(() => {
      removeStorage('profile').then(() => {
        resolve(true);
      }).catch(() => {
        reject();
      });
    }).catch(() => {
      reject();
    });
  });
}

export const retrieveProfile = async () => {
  return new Promise(async (resolve, reject) => {
    let stored: Profile = await getStorage('profile', true) as Profile || null;
    const payload = {}
    await axios.post(
      `${SERVER}/api/Main/Profile`,
      payload,
      {
        withCredentials: true,
        ...{
          headers: await createRequestHeader(true)
        }
      }
    ).then(async (response: AxiosResponse<any, any>) => {
      if (response.data) {
        if (response.data.Data && response.data.Data.length) {
          const data = response.data.Data[0];
          const profile: Profile = {
            name: data.user_name,
            username: data.user_username,
            email: data.user_email,
            tel: data.tel,
            image: data.user_img,
            type: data.user_type,
            verification: {
              email: data.email_verify,
              tel: data.tel_verify,
              nationalId: data.id_verify,
            },
            settings: {
              hasPin: data.haspin,
            }
          };
          await setStorage('profile', profile, true);
          console.log(profile);
          stored = profile;
        } else {
          reject(MSG_ERR_EMP_DATA);
        }
      } else {
        reject(MSG_ERR_EMP_RES);
      }
    }).catch((error) => {
      reject(handleResponseError(error));
    });
    resolve(stored);
  });
}

export const test = async (username: string, password: string) => {
  return new Promise(async (resolve, reject) => {
    const payload = {
      grant_type: 'password',
      username: username,
      password: password
    }
    const params = new URLSearchParams({
      test: '1'
    } as any);
    await axios.get(
      `${SERVER}/token`,
      {
        params,
        withCredentials: true,
        ...{
          headers: await createRequestHeader(true)
        }
      }
    ).then(async (response: AxiosResponse<any, any>) => {
      if (response.data) {
        const data = response.data;
        resolve(data);
      } else {
        reject(MSG_ERR_EMP_RES);
      }
    }).catch((error) => {
      reject(handleResponseError(error));
    });
  });
}