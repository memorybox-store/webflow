import { LoginEvent } from './events/LoginEvent';
import RestService from './services/RestService';
import UserService from './services/UserService';


document.addEventListener("DOMContentLoaded", () => {
  LoginEvent();
  UserService.signin('test', 'test').catch((message) => {
    // alert(message);
  });
});
