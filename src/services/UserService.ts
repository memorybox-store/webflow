import axios, { AxiosResponse } from 'axios';
import { SERVER } from '../contances/configs';
import RestService from './RestService';
import StorageService from './StorageService';

const UserService = {
  signin: async (username: string, password: string) => {
    return new Promise(async (resolve, reject) => {
      const payload = {
        username: username,
        password: password
      }
      const params = new URLSearchParams({
        grant_type: 'password'
      } as any);
      await axios.post(
        `${SERVER}/token`, 
        payload,
        {
          params,
          ...{ headers: await RestService.retrieveHeader(true) }
        }
      ).then(async (response: AxiosResponse<any, any>) => {
        if (response.data) {
          const data = response.data;
          console.log(data);

          await StorageService.set('token', data.token);
          await StorageService.set('refresh_token', data.refresh_token);


          resolve(data);
        } else {
          reject(404);
        }
      }).catch((error) => {
        if (error.response.status === 400) {
          reject('Access Denied - Unauthorized API Usage');
        } else {
          reject(error.message);
        }
      });

    });
  },
};

export default UserService;