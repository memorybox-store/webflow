import { authen, retrieveProfile, signout } from './api/user';

import { LoginListener } from './eventListeners/LoginListener';
import { LogoutListener } from './eventListeners/LogoutListener';
import { ScanListener } from './eventListeners/ScanListener';

import { SearchListener } from './eventListeners/SearchListener';
import { CartListener } from './eventListeners/CartListener';
import { ProductListener } from './eventListeners/ProductListener';
import { SocialLoginListener } from './eventListeners/SocialLoginListener';
import { PaymentListener } from './eventListeners/PaymentListener';
import { ProcessPaymentListener } from './eventListeners/ProcessPaymentListener';
import { OrderListener } from './eventListeners/OrderListener';
import { Profile } from './models/user';
import { EL_CLASS_USER_NAME, EL_CLASS_USER_AVATAR } from './constants/elements';

const publicUrls = [
  '/',
  '/log-in',
  '/sign-in',
];

const checkAuthen = () => {
  return new Promise(async (resolve) => {
    let result: boolean = false;
    const path: string = window.location.pathname;
    await authen().then(async () => {
      result = true;
      if (path === '/log-in') {
        location.href = './finder';
      } else {
        await retrieveProfile().then((profile: Profile) => {
          const nameElements = document.querySelectorAll(`.${EL_CLASS_USER_NAME}`) as NodeListOf<HTMLElement>;
          if (nameElements.length) {
            for (const [_, nameElement] of Object.entries(nameElements)) {
              nameElement.innerHTML = profile.name;
            }
          }
          const avatarElements = document.querySelectorAll(`.${EL_CLASS_USER_AVATAR}`) as NodeListOf<HTMLImageElement>;
          if (avatarElements.length) {
            for (const [_, avatarElement] of Object.entries(avatarElements)) {
              avatarElement.src = profile.image || '';
            }
          }
        }).catch((message) => {
          alert(message);
        });
      }
    }).catch(async () => {
      await signout().catch((message?) => {
        alert(message || '');
      });
      if (!publicUrls.includes(path)) {
        location.href = './log-in';
      }
    });
    resolve(result);
  });
}

const initialize = () => {
  LoginListener();
  LogoutListener();
  SocialLoginListener();
  ScanListener();
  checkAuthen().then((result: boolean) => {
    if (result) {
      CartListener();
      PaymentListener();
      SearchListener();
      ProductListener();
      ProcessPaymentListener();
      OrderListener();
    }
  })
}

document.addEventListener("DOMContentLoaded", async () => {
  initialize();
});
