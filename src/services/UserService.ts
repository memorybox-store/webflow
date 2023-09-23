import axios, { AxiosResponse } from 'axios';

import { SERVER } from '../contances/configs';

import { Profile, Session } from '../models/UserModel';

import moment from '../configs/moment';

import RestService from './RestService';
import StorageService from './StorageService';

axios.defaults.withCredentials = true;

const UserService = {
  authen: async () => {
    return new Promise(async (resolve, reject) => {
      const session: Session = await StorageService.get('session', true) as Session || null;
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
  },
  signin: async (username: string, password: string) => {
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
            headers: await RestService.retrieveHeader(false, true, true)
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
          await StorageService.set('session', session, true);
          resolve(session);
        } else {
          reject('Empty Response');
        }
      }).catch((error) => {
        reject(RestService.handleResponseError(error));
      });
    });
  },
  signout: async () => {
    return new Promise(async (resolve, reject) => {
      StorageService.remove('session').then(() => {
        StorageService.remove('profile').then(() => {
          resolve(true);
        }).catch(() =>{
          reject();
        });
      }).catch(() =>{
        reject();
      });
    });
  },
  profile: async () => {
    return new Promise(async (resolve, reject) => {
      let stored: Profile = await StorageService.get('profile', true) as Profile || null;
      const payload = {}
      await axios.post(
        `${SERVER}/api/Main/Profile`, 
        payload,
        {
          withCredentials: true,
          ...{ 
            headers: await RestService.retrieveHeader(true)
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
            await StorageService.set('profile', profile, true);
            console.log(profile);
            stored = profile;
          } else {
            reject('Empty Data');
          }
        } else {
          reject('Empty Response');
        }
      }).catch((error) => {
        reject(RestService.handleResponseError(error));
      });
      resolve(stored);
    });
  },
  test: async (username: string, password: string) => {
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
            headers: await RestService.retrieveHeader(true)
          }
        }
      ).then(async (response: AxiosResponse<any, any>) => {
        if (response.data) {
          const data = response.data;
          resolve(data);
        } else {
          reject('Empty Response');
        }
      }).catch((error) => {
        reject(RestService.handleResponseError(error));
      });
    });
  },
};

export default UserService;