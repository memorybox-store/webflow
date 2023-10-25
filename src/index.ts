import { 
  EL_CLASS_USER_NAME, 
  EL_CLASS_USER_AVATAR, 
  EL_ID_CHECKOUT_OMISE_FORM, 
  EL_ID_RESULT_SUM_BOAT,
  EL_ID_RESULT_SUM_TOTAL,
  EL_ID_RESULT_SUM_MY_PIC
} from './constants/elements';
import { MSG_INFO_OMISE } from './constants/messages';
import { 
  URL_FINDER, 
  URL_HELP_CENTER, 
  URL_LOGIN, 
  URL_PRIVACY_POLICY, 
  URL_SIGNIN, 
  URL_SIGNUP, 
  URL_TERMS 
} from './constants/urls';
import { PAYMENT_REDIRECT } from './constants/configs';
import { LANG_PREF_CN, LANG_PREF_TH } from './constants/languages';

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

const publicUrls = [
  `/`,
  `/${URL_LOGIN}`,
  `/${LANG_PREF_TH}${URL_LOGIN}`,
  `/${LANG_PREF_CN}${URL_LOGIN}`,
  `/${URL_SIGNUP}`,
  `/${LANG_PREF_TH}${URL_SIGNUP}`,
  `/${LANG_PREF_CN}${URL_SIGNUP}`,
  `/${URL_SIGNIN}`,
  `/${LANG_PREF_TH}${URL_SIGNIN}`,
  `/${LANG_PREF_CN}${URL_SIGNIN}`,
  `/${URL_PRIVACY_POLICY}`,
  `/${LANG_PREF_TH}${URL_PRIVACY_POLICY}`,
  `/${LANG_PREF_CN}${URL_PRIVACY_POLICY}`,
  `/${URL_TERMS}`,
  `/${LANG_PREF_TH}${URL_TERMS}`,
  `/${LANG_PREF_CN}${URL_TERMS}`,
  `/${URL_HELP_CENTER}`,
  `/${LANG_PREF_TH}${URL_HELP_CENTER}`,
  `/${LANG_PREF_CN}${URL_HELP_CENTER}`,
];

const checkAuthen = () => {
  return new Promise(async (resolve) => {
    let result: boolean = false;
    const path: string = window.location.pathname;
    await authen().then(async () => {
      result = true;
      if (path === `/${URL_LOGIN}` || path === `/${LANG_PREF_TH}${URL_LOGIN}` || path === `/${LANG_PREF_CN}${URL_LOGIN}`) {
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
      
      UserListener();
      CartListener();
      PaymentListener();
      SearchListener();
      ProductListener();
      ProcessPaymentListener();
      OrderListener();
      DownloadListener();

      // Init result of image includes my picture
      const resultMyPicElement = document.getElementById(EL_ID_RESULT_SUM_MY_PIC) as HTMLElement;
      if (resultMyPicElement) {
        getStorage('status-mypic').then((data: string) => {
          if (data) {
            resultMyPicElement.innerText = data;
          }
        });
      }

      // Init result of total image
      const resultTotalElement = document.getElementById(EL_ID_RESULT_SUM_TOTAL) as HTMLElement;
      if (resultTotalElement) {
        getStorage('status-total').then((data: string) => {
          if (data) {
            resultTotalElement.innerText = data;
          }
        });
      }

      // Init result of boat name
      const resultBoatElement = document.getElementById(EL_ID_RESULT_SUM_BOAT) as HTMLElement;
      if (resultBoatElement) {
        getStorage('status-boat').then((data: string) => {
          if (data) {
            resultBoatElement.innerText = data;
          }
        });
      }

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
