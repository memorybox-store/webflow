import { EL_CLASS_USER_NAME, EL_CLASS_USER_AVATAR, EL_ID_CHECKOUT_OMISE_FORM } from './constants/elements';
import { MSG_INFO_OMISE } from './constants/messages';
import { URL_FINDER, URL_LOGIN, URL_SIGNIN, URL_SIGNUP } from './constants/urls';

import { authen, retrieveProfile, signout } from './api/user';
import { getStorage } from './utils/storage';

import { Profile, Session } from './models/user';

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
import { UserListener } from './eventListeners/UserListener';
import { RgisterListener } from './eventListeners/RegisterListener';
import { DownloadListener } from './eventListeners/DownloadListener';
import { getOrder } from './api/order';
import { Order } from './models/order';
import { PAYMENT_REDIRECT } from './constants/configs';

const publicUrls = [
  `/`,
  `/${URL_LOGIN}`,
  `/th-${URL_LOGIN}`,
  `/cn-${URL_LOGIN}`,
  `/${URL_SIGNUP}`,
  `/th-${URL_SIGNUP}`,
  `/cn-${URL_SIGNUP}`,
  `/${URL_SIGNIN}`,
  `/th-${URL_SIGNIN}`,
  `/cn-${URL_SIGNIN}`,
];

const checkAuthen = () => {
  return new Promise(async (resolve) => {
    let result: boolean = false;
    const path: string = window.location.pathname;
    await authen().then(async () => {
      result = true;
      if (path === `/${URL_LOGIN}` || path === `/th-${URL_LOGIN}`) {
        const url = new URL(window.location.href);
        const redirect: string = decodeURIComponent(url.searchParams.get("redirect"));
        if (redirect) {
          location.href = redirect;
        } else {
          location.href = `./${URL_FINDER}`;
        }
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
              if (profile.image) {
                avatarElement.src = profile.image;
              }
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
        const redirect: string = encodeURIComponent(window.location.href);
        location.href = `./${URL_LOGIN}?redirect=${redirect}`;
      }
    });
    resolve(result);
  });
}

const initialize = () => {
  RgisterListener();
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
      UserListener();
      DownloadListener();
      getOrder(false).then(async (orders: Order[]) => {
      });
    }
  })
}

const initalizeOmise = async () => {
  const omiseFormElement = document.getElementById(EL_ID_CHECKOUT_OMISE_FORM) as HTMLFormElement;
  if (omiseFormElement) {
    omiseFormElement.style.display = '';
    omiseFormElement.classList.add('hidden-force');
    const omiseScriptElement = omiseFormElement.querySelector('script') as HTMLElement;
    if (omiseScriptElement) {
      omiseScriptElement.setAttribute('data-amount', '0');
      omiseScriptElement.setAttribute(
        'data-button-label',
        `Checkout 0 THB`
      );
      omiseScriptElement.setAttribute('data-currency', 'THB');
    }
    let omiseAuthorizationElement = omiseFormElement.querySelector('input[name="authorization"]') as HTMLInputElement;
    if (!omiseAuthorizationElement) {
      omiseAuthorizationElement = document.createElement('input') as HTMLInputElement;
      omiseAuthorizationElement.setAttribute('type', 'hidden');
      omiseAuthorizationElement.setAttribute('name', 'authorization');
      omiseFormElement.appendChild(omiseAuthorizationElement);
    }
    const getAccessToken = async () => {
      const session = await getStorage('session', true) as Session | null;
      if (session) {
        return session?.accessToken || '';
      } else {
        return '';
      }
    }
    const loginToken = await getAccessToken();
    omiseAuthorizationElement.value = loginToken;
    let omiseAuhvElement = omiseFormElement.querySelector('input[name="auhv"]') as HTMLInputElement;
    if (!omiseAuhvElement) {
      omiseAuhvElement = document.createElement('input') as HTMLInputElement;
      omiseAuhvElement.setAttribute('type', 'hidden');
      omiseAuhvElement.setAttribute('name', 'auhv');
      omiseFormElement.appendChild(omiseAuhvElement);
    }
    const auhv = await getStorage('auhv') as string | '';
    omiseAuhvElement.value = auhv;
    let omiseOrderIdsElement = omiseFormElement.querySelector('input[name="orders"]') as HTMLInputElement;
    if (!omiseOrderIdsElement) {
      omiseOrderIdsElement = document.createElement('input') as HTMLInputElement;
      omiseOrderIdsElement.setAttribute('type', 'hidden');
      omiseOrderIdsElement.setAttribute('name', 'orders');
      omiseFormElement.appendChild(omiseOrderIdsElement);
    }
    let omiseDescriptionElement = omiseFormElement.querySelector('input[name="omiseDescription"]') as HTMLInputElement;
    if (!omiseDescriptionElement) {
      omiseDescriptionElement = document.createElement('input') as HTMLInputElement;
      omiseDescriptionElement.setAttribute('type', 'hidden');
      omiseDescriptionElement.setAttribute('name', 'omiseDescription');
      omiseFormElement.appendChild(omiseDescriptionElement);
    }
    omiseDescriptionElement.setAttribute('value', `${MSG_INFO_OMISE}`);
    let omiseReturnURIElement = omiseFormElement.querySelector('input[name="omiseReturnURI"]') as HTMLInputElement;
    if (!omiseReturnURIElement) {
      omiseReturnURIElement = document.createElement('input') as HTMLInputElement;
      omiseReturnURIElement.setAttribute('type', 'hidden');
      omiseReturnURIElement.setAttribute('name', 'omiseReturnURI');
      omiseFormElement.appendChild(omiseReturnURIElement);
    }
    omiseReturnURIElement.setAttribute('value', PAYMENT_REDIRECT);
  }
}

document.addEventListener("DOMContentLoaded", () => {

  initalizeOmise();

  initialize();

});
