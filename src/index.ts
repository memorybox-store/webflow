import { authen, retrieveProfile, signout } from './api/user';

import { LoginListener } from './eventListeners/LoginListener';
import { LogoutListener } from './eventListeners/LogoutListener';
import { ScanListener } from './eventListeners/ScanListener';

import { Profile } from './models/user';
import { SearchListener } from './eventListeners/SearchListener';
import { CartListener } from './eventListeners/CartListener';
import { ProductListener } from './eventListeners/ProductListener';
import { CartItem } from './models/cart';

const publicUrls = [
  '/',
  '/log-in',
];

var profile: Profile = null;

const setProfile = (data: Profile) => {
  profile = { ...data };
  console.log(profile);
}

const checkAuthen = () => {
  return new Promise(async (resolve) => {
    let result: boolean = false;
    const path: string = window.location.pathname;
    console.log(path);
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
      ProductListener();
    }
  })
}

const playgroundElement: HTMLElement = document.getElementById('memorybox-dev');
if (playgroundElement) {
  const path: string = window.location.pathname;
  // const url = `https://memorybox.webflow.io${path}`;
  const url = `https://memorybox.webflow.io/log-in`;
  // Fetch HTML source code from the URL
  fetch(url).then(response => response.text())
    .then(html => {
      // Render the HTML by injecting it into the 'result' div
      document.documentElement.innerHTML = html;
      console.log(html);
    }).catch(error => console.error('Error fetching HTML:', error));
}

document.addEventListener("DOMContentLoaded", () => {
  initialize();
});
