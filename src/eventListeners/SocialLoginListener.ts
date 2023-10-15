import { 
	EL_ID_FB_BTN, 
	EL_ID_GOOGLE_BTN, 
	EL_ID_LINE_BTN 
} from "../constants/elements";
import { 
	LINE_CHANNEL_ID, 
	SOCIAL_LOGIN_REDIRECT 
} from "../constants/configs";

import hello from '../config/hellojs';
import { HelloJSLoginEventArguement } from "hellojs";

import { 
	checkSocialAuthen, 
	lineTokenFromCode, 
	register, 
	retrieveProfile, 
	saveSocialAuthen, 
	signin, 
	lineVerify 
} from "../api/user";
import { URL_FINDER } from "../constants/urls";

export const SocialLoginListener = (): void => {

	const password: string = '000000';

	const randomNumber = (length: number) => {
		let result = '';
		const characters =
			'0123456789';
		const charactersLength = characters.length;
		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	};

	const randomString = (length: number) => {
		let result = '';
		const characters =
			'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		const charactersLength = characters.length;
		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	};

	const afterSocial = (platform: string, socialId: string, socialName: string, password: string = '') => {
		checkSocialAuthen(platform, socialId).then((result) => {
			if (result) {
				signin(socialId, password).then(() => {
					retrieveProfile().then(() => {
						location.href = `./${URL_FINDER}`;
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
							location.href = `./${URL_FINDER}`;
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
	const url = new URL(window.location.href);
	const code = url.searchParams.get("code");
	const state = url.searchParams.get("state");

	const facebookElement = document.getElementById(EL_ID_FB_BTN) as HTMLElement;
	if (facebookElement) {
		facebookElement.addEventListener('click', () => {
			hello('facebook').login().then((response: HelloJSLoginEventArguement) => {
				if (state !== 'Line') {
					hello('facebook').api('me').then((json: any) => {
						afterSocial('fb', json.id, json.name, password);
					}, (e) => {
						alert('Signin error: ' + e.error.message);
					});
				}
			});
		});
	}

	const googleElement = document.getElementById(EL_ID_GOOGLE_BTN) as HTMLElement;
	if (googleElement) {
		googleElement.addEventListener('click', () => {
			hello('google').login().then((response: HelloJSLoginEventArguement) => {
				if (state !== 'Line') {
					hello('google').api('me').then((json: any) => {
						afterSocial('google', json.id, json.name, password);
					}, (e) => {
						alert('Signin error: ' + e.error.message);
					});
				}
			});
		});
	}

	const lineElement = document.getElementById(EL_ID_LINE_BTN) as HTMLElement;
	if (lineElement) {
		lineElement.addEventListener('click', () => {
			const loginUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${LINE_CHANNEL_ID}&redirect_uri=${encodeURI(SOCIAL_LOGIN_REDIRECT)}&state=Line&scope=${encodeURI(`profile openid`)}&nonce=${randomString(8)}`;
			location.href = loginUrl;
		});
		if (state === 'Line') {
			lineTokenFromCode(code).then((data: any) => {
				const idToken = data.id_token;
				lineVerify(idToken).then((data: any) => {
					afterSocial('line', data.sub, data.name, password);
				}).catch((message) => {
					alert(message);
				});
			}).catch((message) => {
				alert(message);
			});
		}
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