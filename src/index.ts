import {
  EL_ID_CART_BADGE
} from './constants/elements';

import { getCartItems } from './api/cart';
import { authen, retrieveProfile, signout } from './api/user';

import { LoginListener } from './eventListeners/LoginListener';
import { LogoutListener } from './eventListeners/LogoutListener';
import { ScanListener } from './eventListeners/ScanListener';

import { Profile } from './models/user';
import { SearchListener } from './eventListeners/SearchListener';

const publicUrls = [
  '/',
  '/log-in',
];

var profile: Profile = null;
var cartItems: Array<any> = [];

const setProfile = (data: Profile) => {
  profile = data;
  console.log(profile);
}

const setCartItems = (data: Array<any>) => {
  cartItems = data;
  const element = document.getElementById(EL_ID_CART_BADGE);
  if (element) {
    element.textContent = data.length.toString();
    if (data.length <= 0) {
      element.style.display = 'none';
    } else {
      element.style.display = '';
    }
  }
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

const loadCart = () => {
  return new Promise(async (resolve) => {
    const path: string = window.location.pathname;
    await getCartItems().then(async (data: Array<any>) => {
      console.log(data);
      setCartItems(data);
      resolve(data);
    }).catch((error) => {
      alert(error);
    });
  });
}

const initialize = () => {
  LoginListener(setProfile);
  LogoutListener(setProfile);
  ScanListener();
  checkAuthen().then((result: boolean) => {
    if (result) {
      loadCart();
      SearchListener();
    }
  })
}

document.addEventListener("DOMContentLoaded", () => {
  initialize();
});
