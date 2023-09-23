import { LoginEvent } from './events/LoginEvent';
import { LogoutEvent } from './events/LogoutEvent';
import { ScanEvent } from './events/ScanEvent';
import { Profile } from './models/UserModel';
import UserService from './services/UserService';

var profile: Profile = null;

const publicUrls = [
  '/',
  '/log-in',
];

const setProfile = (data: Profile) => {
  profile = data;
  console.log(profile);
}

const initialize = () => {
  const path: string = window.location.pathname;
  UserService.authen().then(() => {
    if (path === '/log-in') {
      location.href = './finder';
    } else {
      UserService.profile().then((data: Profile) => {
        setProfile(data);
      }).catch((message) => {
        alert(message);
      });
    }
  }).catch(async () => {
    await UserService.signout().catch((message?) => {
      alert(message || '');
    });
    setProfile(null);
    if (!publicUrls.includes(path)) {
      location.href = './log-in';
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  LoginEvent(setProfile);
  LogoutEvent(setProfile);
  // ScanEvent();
  initialize();
});
