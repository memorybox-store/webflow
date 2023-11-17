import {
  EL_CLASS_USER_NAME,
  EL_CLASS_USER_AVATAR,
  EL_ID_CHECKOUT_OMISE_FORM,
  EL_ID_RESULT_SUM_BOAT,
  EL_ID_RESULT_SUM_TOTAL,
  EL_ID_RESULT_SUM_MY_PIC
} from './constants/elements';
import { 
  MSG_ERR_UNKNOWN, 
  MSG_INFO_OMISE 
} from './constants/messages';
import { PAYMENT_REDIRECT } from './constants/configs';
import {
  URL_FINDER,
  URL_FINDER_V2,
  URL_HELP_CENTER,
  URL_LOGIN,
  URL_PRIVACY_POLICY,
  URL_RESULT,
  URL_SIGNIN,
  URL_SIGNUP,
  URL_TERMS,
} from './constants/urls';
import { NAME_OK } from './constants/names';

import './style.css';

import * as tingle from 'tingle.js';

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
import { multiLanguageUrl } from './utils/language';

const publichUrls = [
  `/`,
  ...multiLanguageUrl(URL_LOGIN, true),
  ...multiLanguageUrl(URL_SIGNUP, true),
  ...multiLanguageUrl(URL_SIGNIN, true),
  ...multiLanguageUrl(URL_PRIVACY_POLICY, true),
  ...multiLanguageUrl(URL_TERMS, true),
  ...multiLanguageUrl(URL_HELP_CENTER, true),
  ...multiLanguageUrl(URL_FINDER, true),
  ...multiLanguageUrl(URL_FINDER_V2, true),
  ...multiLanguageUrl(URL_RESULT, true),
];

const modal = new tingle.modal({
  footer: true,
  stickyFooter: false,
  closeMethods: ['overlay', 'button', 'escape'],
  closeLabel: '',
  beforeClose: () => {
    return true;
  }
});
modal.setContent('');
modal.addFooterBtn(NAME_OK, 'tingle-btn tingle-btn--primary', () => modal.close());

const modalLoading = new tingle.modal({
  footer: true,
  stickyFooter: false,
  closeMethods: [],
  closeLabel: '',
  cssClass: ['modal-loading'],
  beforeClose: () => {
    return true;
  }
});
modalLoading.setContent('<div class="lds-ripple"><div></div><div></div></div>');

const checkAuthen = () => {
  return new Promise(async (resolve) => {
    let result: boolean = false;
    const path: string = window.location.pathname;
    await authen().then(async () => {
      result = true;
      if (
        path === `/`
        || multiLanguageUrl(URL_LOGIN, true).includes(path)
      ) {
        const url = new URL(window.location.href);
        const redirectPrev: string = url.searchParams.get("redirect");
        if (redirectPrev) {
          location.href = decodeURIComponent(redirectPrev);
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
          modal.setContent(message || MSG_ERR_UNKNOWN);
          modal.open();
        });
      }
    }).catch(async () => {
      await signout().catch((message?) => {
        modal.setContent(message || MSG_ERR_UNKNOWN);
        modal.open();
      });
      if (!publichUrls.includes(path)) {
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
  SearchListener();
  ProductListener();
  checkAuthen().then((result: boolean) => {
    if (result) {

      UserListener();
      CartListener();
      PaymentListener();
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

    window.addEventListener("beforeunload", async () => {
      const omiseFormIFrameElement = document.getElementById('omise-checkout-iframe-app') as HTMLElement;
      if (omiseFormIFrameElement) {
        if (
          omiseFormIFrameElement.style.display === 'block'
          && omiseFormIFrameElement.style.visibility === 'visible'
        ) {
          modalLoading.open();
        }
      }
    });

  }
}

document.addEventListener("DOMContentLoaded", () => {

  initalizeOmise();

  initialize();

});
