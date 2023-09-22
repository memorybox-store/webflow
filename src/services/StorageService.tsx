import { STORAGE_PREFIX } from "../contances/configs";

const StorageService = {
  set: async (keyName = '', data: any, isObject = false) => {
    return new Promise(async (resolve, reject) => {
      let dataToSet: any = data;
      if (isObject) {
        dataToSet = JSON.stringify(data);
      }
      try {
        const prefix = STORAGE_PREFIX;
        const key = `${prefix}${keyName}`;
        await localStorage.setItem(key, dataToSet);
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  },
  get: async (keyName = '', isObject = false) => {
    return new Promise(async (resolve, reject) => {
      try {
        const prefix = STORAGE_PREFIX;
        const key = `${prefix}${keyName}`;
        let dataToGet: any = '';
        dataToGet = await localStorage.getItem(key);
        if (isObject) {
          dataToGet = JSON.parse(dataToGet);
        }
        resolve(dataToGet);
      } catch (error) {
        reject(error);
      }
    });
  },
  remove: async (keyName = '') => {
    return new Promise(async (resolve, reject) => {
      try {
        const prefix = STORAGE_PREFIX;
        const key = `${prefix}${keyName}`;
        await localStorage.removeItem(key);
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  }
};

export default StorageService;