import { authen, retrieveProfile, signout } from './api/user';

import { LoginListener } from './eventListeners/LoginListener';
import { LogoutListener } from './eventListeners/LogoutListener';
import { ScanListener } from './eventListeners/ScanListener';

import { Profile } from './models/user';
import { SearchListener } from './eventListeners/SearchListener';
import { CartListener } from './eventListeners/CartListener';

const publicUrls = [
  '/',
  '/log-in',
];

var profile: Profile = null;

const setProfile = (data: Profile) => {
  profile = data;
  console.log(profile);
}

const checkAuthen = () => {
  return new Promise(async (resolve) => {
    let result: boolean = false;
    const path: string = window.location.pathname;
    await authen().then(async () => {
      if (path === '/log-in') {
        location.href = './finder';
      } else {
        await retrieveProfile().then((data: Profile) => {
          setProfile(data);
          result = true;
        }).catch((message) => {
          alert(message);
        });
      }
    }).catch(async () => {
      await signout().catch((message?) => {
        alert(message || '');
      });
      setProfile(null);
      if (!publicUrls.includes(path)) {
        location.href = './log-in';
      }
    });
    resolve(result);
  });
}

const initialize = () => {
  LoginListener(setProfile);
  LogoutListener(setProfile);
  ScanListener();
  checkAuthen().then((result: boolean) => {
    if (result) {
      CartListener();
      SearchListener();
    }
  })
}

document.addEventListener("DOMContentLoaded", () => {
  initialize();
});
