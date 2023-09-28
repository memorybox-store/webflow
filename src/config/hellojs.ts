import hello from 'hellojs';
import { 
  FB_CLIENT_ID, 
  GOOGLE_CLIENT_ID, 
  SOCIAL_LOGIN_REDIRECT 
} from '../constants/configs';

hello.init({
	facebook: FB_CLIENT_ID,
  google : GOOGLE_CLIENT_ID
}, {
  redirect_uri: SOCIAL_LOGIN_REDIRECT
});

export default hello;