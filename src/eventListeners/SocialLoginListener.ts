import { EL_ID_FB_BTN, EL_ID_GOOGLE_BTN, EL_ID_LOGIN_FORM } from "../constants/elements";

import hello from '../config/hellojs';

import { getElementValueByName } from "../utils/form";
import { checkSocialAuthen, register, retrieveProfile, saveSocialAuthen, signin } from "../api/user";

import { Profile, Session } from "../models/user";
import { HelloJSAuthResponse, HelloJSLoginEventArguement } from "hellojs";

export const SocialLoginListener = (): void => {

	const password: string = '000000';

	const afterSocial = (platform: string, socialId: string, socialName: string, password: string = '') => {
		checkSocialAuthen(platform, socialId).then((result) => {
			if (result) {
				signin(socialId, password).then(() => {
					retrieveProfile().then(() => {
						location.href = '/finder';
					}).catch((message) => {
						alert(message);
					});
				}).catch((message) => {
					alert(message);
				});
			} else {
				register(socialId, password, socialName).then(() => {
					signin(socialId, password).then(() => {
						saveSocialAuthen(platform, socialId).then(() => {
							location.href = '/finder';
						}).catch((message) => {
							alert(message);
						});
					}).catch((message) => {
						alert(message);
					});
				}).catch((message) => {
					alert(message);
				});
			}
		}, (e) => {
			alert(e.error.message);
		});
	}

	const facebookElement = document.getElementById(EL_ID_FB_BTN) as HTMLElement;
	if (facebookElement) {
		facebookElement.addEventListener('click', () => {
			hello('facebook').login().then((response: HelloJSLoginEventArguement) => {
				hello('facebook').api('me').then((json: any) => {
					afterSocial('fb', json.id, json.name, password);
				}, (e) => {
					alert('Signin error: ' + e.error.message);
				});
			});
		});
	}

	const googleElement = document.getElementById(EL_ID_GOOGLE_BTN) as HTMLElement;
	if (googleElement) {
		googleElement.addEventListener('click', () => {
			hello('google').login().then((response: HelloJSLoginEventArguement) => {
				hello('google').api('me').then((json: any) => {
					afterSocial('google', json.id, json.name, password);
				}, (e) => {
					alert('Signin error: ' + e.error.message);
				});
			});
		});
	}

	// var online = (session: HelloJSAuthResponse) => {
	// 	const currentTime = (new Date()).getTime() / 1000;
	// 	return session && session.access_token && session.expires > currentTime;
	// };

	// var fb: HelloJSAuthResponse = hello('facebook').getAuthResponse();

	// if (online(fb)) {
	// 	alert('Signed');
	// }

};