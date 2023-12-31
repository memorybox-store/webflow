import {
  LINE_CHANNEL_ID,
  LINE_CHANNEL_SECRET,
  SERVER,
  SOCIAL_LOGIN_REDIRECT
} from '../constants/configs';
import {
  MSG_ERR_EMAIL_EXIST,
  MSG_ERR_EMPTY_DATA,
  MSG_ERR_EMPTY_RES
} from '../constants/messages';

import axios from '../config/axios';
import moment from '../config/moment';
import { AxiosResponse } from 'axios';

import { createRequestHeader, handleResponseError } from '../utils/rest';
import { getStorage, removeStorage, setStorage } from '../utils/storage';

import { Profile, Session } from '../models/user';
import { CartItem } from '../models/cart';
import { addItemToCart } from './cart';

export const authen = async () => {
  return new Promise(async (resolve, reject) => {
    const session: Session = await getStorage('session', true) as Session || null;
    if (session) {
      if (session.expires && moment() <= moment(session.expires)) {
        resolve(true);
      } else {
        reject();
      }
    } else {
      reject();
    }
  });
};

export const register = async (
  name: string = '',
  email: string,
  password: string,
  social: string | false = false
) => {
  return new Promise(async (resolve, reject) => {
    if (!social) {
      await checkEmail(email).then(async (result) => {
        if (!result) {
          const payload = {
            PhoneNumber: '',
            UserName: email,
            Password: password,
            Email: email,
            User_Name: name
          }
          await axios.post(
            `${SERVER}/api/Main/Register`,
            payload,
            {
              ...{
                headers: await createRequestHeader(false, true)
              }
            }
          ).then(async (response: AxiosResponse<any, any>) => {
            if (response.data) {
              if (response.data.Status === 'Success') {
                resolve(true);
              } else {
                reject(response.data.Message);
              }
            } else {
              reject(MSG_ERR_EMPTY_RES);
            }
          }).catch((error) => {
            reject(handleResponseError(error));
          });
        } else {
          reject(MSG_ERR_EMAIL_EXIST);
        }
      }).catch((error) => {
        reject(handleResponseError(error));
      });
    } else {
      const payload = {
        User_Name: name,
        UserName: email,
        Password: password
      }
      await axios.post(
        `${SERVER}/api/Main/Register`,
        payload,
        {
          ...{
            headers: await createRequestHeader(false, true)
          }
        }
      ).then(async (response: AxiosResponse<any, any>) => {
        if (response.data) {
          if (response.data.Status === 'Success') {
            resolve(true);
          } else {
            reject(response.data.Message);
          }
        } else {
          reject(MSG_ERR_EMPTY_RES);
        }
      }).catch((error) => {
        reject(handleResponseError(error));
      });
    }
  });
}

export const checkEmail = async (email: string = '') => {
  return new Promise(async (resolve, reject) => {
    const payload = {
      Email: email
    }
    await axios.post(
      `${SERVER}/api/Main/CheckEmail`,
      payload,
      {
        ...{
          headers: await createRequestHeader(false, true)
        }
      }
    ).then(async (response: AxiosResponse<any, any>) => {
      if (response.data) {
        if (response.data.Status === 'Success') {
          if (response.data.Data === 'True') {
            resolve(true);
          } else {
            resolve(false);
          }
        } else {
          reject(response.data.Message);
        }
      } else {
        reject(MSG_ERR_EMPTY_RES);
      }
    }).catch((error) => {
      reject(handleResponseError(error));
    });
  });
}

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
        ...{
          headers: await createRequestHeader(false, true, 'application/x-www-form-urlencoded')
        }
      }
    ).then(async (response: any) => {
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
        await setStorage('session', session, true);
        await setStorage('auhv', data.auhv);
        await axios.post(
          `${SERVER}/api/Main/GetAuhv`,
          {
            auhv: data.auhv,
            AuthenticateEX: 'gQGllPkYcsOSd7pCJ7UJabLV9m6Ua3h7YJ5iikiVLAW643m70iqTV90WRHD394KjG92+TYi/h8zAqZS90zBgaw=='
          },
          {
            ...{
              headers: await createRequestHeader(true, false)
            }
          }
        ).then(async (response: any) => {
          await setStorage('cookie', response.data.Data);
          await retrieveProfile().then(async (profile: Profile) => {
            let storedProfile: Profile = await getStorage('profile', true) as Profile || null;
            if (storedProfile && profile && storedProfile.username !== profile.username) {
              await Promise.all([
                removeStorage('face'),
                removeStorage('status-mypic'),
                removeStorage('status-total'),
                removeStorage('status-boat'),
                removeStorage('result-fid'),
                removeStorage('result-date'),
                removeStorage('result-company'),
                removeStorage('cart-items')
              ]);
            }
            let cartItems: CartItem[] = [];
            await getStorage('cart-items', true).then(async (stored: [] | null) => {
              if (stored && stored.length) {
                cartItems = stored as CartItem[];
              }
            });
            for (let item of cartItems) {
              await addItemToCart(
                item.product.id,
                item.product.company?.id,
                item.product.details.id.toString() || '',
                1
              ).catch(() => { });
            }
            await removeStorage('cart-items');
          }).catch(() => { });
          resolve(session);
        }).catch((error) => {
          reject(handleResponseError(error));
        });
      } else {
        reject(MSG_ERR_EMPTY_RES);
      }
    }).catch((error) => {
      reject(handleResponseError(error));
    });
  });
}

export const signout = async () => {
  return new Promise(async (resolve, reject) => {
    removeStorage('session').then(() => {
      removeStorage('cookie').then(() => {
        removeStorage('auhv').then(() => {
          resolve(true);
        }).catch(() => {
          reject();
        });
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
        ...{
          headers: await createRequestHeader(true, true)
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
          stored = profile;
        } else {
          reject(MSG_ERR_EMPTY_DATA);
        }
      } else {
        reject(MSG_ERR_EMPTY_RES);
      }
    }).catch((error) => {
      reject(handleResponseError(error));
    });
    resolve(stored);
  });
}

export const checkSocialAuthen = async (platform: string, socialId: string) => {
  return new Promise(async (resolve, reject) => {
    const payload = {
      authen_code: socialId,
      platform_name: platform === 'fb'
        ? 'fbauthen'
        : platform === 'google'
          ? 'googleauthen'
          : platform === 'line'
            ? 'lineauthen'
            : ''
    }
    await axios.post(
      `${SERVER}/api/Main/CheckPlatform_Authencode`,
      payload,
      {
        ...{
          headers: await createRequestHeader(false, true)
        }
      }
    ).then(async (response: AxiosResponse<any, any>) => {
      if (response.data) {
        if (response.data.Status === 'Success') {
          if (response.data.Data === 'True') {
            resolve(true);
          } else {
            resolve(false);
          }
        } else {
          reject(response.data.Message);
        }
      } else {
        reject(MSG_ERR_EMPTY_RES);
      }
    }).catch((error) => {
      reject(handleResponseError(error));
    });
  });
}

export const saveSocialAuthen = async (platform: string, socialId: string) => {
  return new Promise(async (resolve, reject) => {
    const payload = {
      authen_code: socialId,
      platform_name: platform === 'fb'
        ? 'fbauthen'
        : platform === 'google'
          ? 'googleauthen'
          : platform === 'line'
            ? 'lineauthen'
            : ''
    }
    await axios.post(
      `${SERVER}/api/Main/SaveAuthenCode`,
      payload,
      {
        ...{
          headers: await createRequestHeader(true, true)
        }
      }
    ).then(async (response: AxiosResponse<any, any>) => {
      if (response.data) {
        if (response.data.Status === 'Success') {
          resolve(true);
        } else {
          reject(response.data.Message);
        }
      } else {
        reject(MSG_ERR_EMPTY_RES);
      }
    }).catch((error) => {
      reject(handleResponseError(error));
    });
  });
}

export const lineTokenFromCode = async (code: string) => {
  return new Promise(async (resolve, reject) => {
    const payload = {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: encodeURI(SOCIAL_LOGIN_REDIRECT),
      client_id: LINE_CHANNEL_ID,
      client_secret: LINE_CHANNEL_SECRET,
    }
    await axios.post(
      `https://api.line.me/oauth2/v2.1/token`,
      payload,
      {
        withCredentials: false,
        ...{
          headers: await createRequestHeader(false, false, 'application/x-www-form-urlencoded')
        }
      }
    ).then(async (response: AxiosResponse<any, any>) => {
      if (response.data) {
        resolve(response.data);
      } else {
        reject(MSG_ERR_EMPTY_RES);
      }
    }).catch((error) => {
      reject(handleResponseError(error));
    });
  });
}

export const lineVerify = async (idToken: string) => {
  return new Promise(async (resolve, reject) => {
    const payload = {
      id_token: idToken,
      client_id: LINE_CHANNEL_ID,
    }
    await axios.post(
      `https://api.line.me/oauth2/v2.1/verify`,
      payload,
      {
        withCredentials: false,
        ...{
          headers: await createRequestHeader(false, false, 'application/x-www-form-urlencoded')
        }
      }
    ).then(async (response: AxiosResponse<any, any>) => {
      if (response.data) {
        resolve(response.data);
      } else {
        reject(MSG_ERR_EMPTY_RES);
      }
    }).catch((error) => {
      reject(handleResponseError(error));
    });
  });
}

export const lineProfile = async (accessToken: string) => {
  return new Promise(async (resolve, reject) => {
    await axios.get(
      `https://api.line.me/oauth2/v2.1/userinfo`,
      {
        withCredentials: false,
        ...{
          headers: await createRequestHeader(accessToken)
        }
      }
    ).then(async (response: AxiosResponse<any, any>) => {
      if (response.data) {
        resolve(response.data);
      } else {
        reject(MSG_ERR_EMPTY_RES);
      }
    }).catch((error) => {
      reject(handleResponseError(error));
    });
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
        ...{
          headers: await createRequestHeader(true)
        }
      }
    ).then(async (response: AxiosResponse<any, any>) => {
      if (response.data) {
        const data = response.data;
        resolve(data);
      } else {
        reject(MSG_ERR_EMPTY_RES);
      }
    }).catch((error) => {
      reject(handleResponseError(error));
    });
  });
}