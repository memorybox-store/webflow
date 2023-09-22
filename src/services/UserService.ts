import axios, { AxiosResponse } from 'axios';
import { SERVER } from '../contances/configs';
import RestService from './RestService';

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
        if (response.data.data.length) {
          const data = response.data.data[0];
          console.log(data);
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