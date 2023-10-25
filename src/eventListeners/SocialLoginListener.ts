import {
	EL_ID_FB_BTN,
	EL_ID_GOOGLE_BTN,
	EL_ID_LINE_BTN,
	EL_ID_LOGIN_FORM,
	EL_ID_REGISTER_FORM
} from "../constants/elements";
import {
	LINE_CHANNEL_ID,
	SOCIAL_LOGIN_REDIRECT
} from "../constants/configs";
import { DATA_ATT_REDIRECT_URI } from "../constants/attributes";
import { URL_FINDER } from "../constants/urls";

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

import * as tingle from 'tingle.js';
import { MSG_ERR_UNKNOWN } from "../constants/messages";

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
modal.addFooterBtn('OK', 'tingle-btn tingle-btn--primary', () => modal.close());

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
						let formElement = document.getElementById(EL_ID_LOGIN_FORM) as HTMLFormElement;
						if (!formElement) {
							formElement = document.getElementById(EL_ID_REGISTER_FORM) as HTMLFormElement;
						}
						const redirect = formElement?.getAttribute(DATA_ATT_REDIRECT_URI) || '';
						if (redirect) {
							location.href = redirect;
						} else {
							location.href = `./${URL_FINDER}`;
						}
					}).catch((message) => {
						modal.setContent(message || MSG_ERR_UNKNOWN);
						modal.open();
					});
				}).catch((message) => {
					modal.setContent(message || MSG_ERR_UNKNOWN);
					modal.open();
				});
			} else {
				register(socialName, socialId, password, 'line').then(() => {
					signin(socialId, password).then(() => {
						saveSocialAuthen(platform, socialId).then(() => {
							let formElement = document.getElementById(EL_ID_LOGIN_FORM) as HTMLFormElement;
							if (!formElement) {
								formElement = document.getElementById(EL_ID_REGISTER_FORM) as HTMLFormElement;
							}
							const redirect = formElement?.getAttribute(DATA_ATT_REDIRECT_URI) || '';
							if (redirect) {
								location.href = redirect;
							} else {
								location.href = `./${URL_FINDER}`;
							}
						}).catch((message) => {
							modal.setContent(message || MSG_ERR_UNKNOWN);
							modal.open();
						});
					}).catch((message) => {
						modal.setContent(message || MSG_ERR_UNKNOWN);
						modal.open();
					});
				}).catch((message) => {
					modal.setContent(message || MSG_ERR_UNKNOWN);
					modal.open();
				});
			}
		}, (e) => {
			modal.setContent(e.error.message || MSG_ERR_UNKNOWN);
			modal.open();
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
						modal.setContent(e.error.message || MSG_ERR_UNKNOWN);
						modal.open();
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
						modal.setContent(e.error.message || MSG_ERR_UNKNOWN);
						modal.open();
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
					modal.setContent(message || MSG_ERR_UNKNOWN);
					modal.open();
				});
			}).catch((message) => {
				modal.setContent(message || MSG_ERR_UNKNOWN);
				modal.open();
			});
		}
	}

};