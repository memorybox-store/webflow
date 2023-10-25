import { EL_ID_LOGIN_FORM, EL_ID_REGISTER_BTN } from "../constants/elements";
import { DATA_ATT_REDIRECT_URI } from "../constants/attributes";
import { MSG_ERR_UNKNOWN } from "../constants/messages";
import { URL_FINDER } from "../constants/urls";
import { NAME_OK } from "../constants/names";

import { signin } from "../api/user";

import { Session } from "../models/user";

import * as tingle from 'tingle.js';

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

export const LoginListener = (): void => {
	const formElement = document.getElementById(EL_ID_LOGIN_FORM) as HTMLFormElement;
	formElement?.addEventListener('submit', (event) => {

		event.preventDefault();
		event.stopPropagation();

		const formData = new FormData(formElement);

		const username = formData.get('username') as string || '';
		const password = formData.get('password') as string || '';

		signin(username, password).then((data: Session) => {
			const url = new URL(window.location.href);
      const redirectPrev = url.searchParams.get("redirect");
			const redirect = formElement.getAttribute(DATA_ATT_REDIRECT_URI) || '';
			if (redirectPrev) {
				location.href = decodeURIComponent(redirectPrev);
			} else if (redirect) {
				location.href = redirect;
			} else {
				location.href = `./${URL_FINDER}`;
			}
		}).catch((message) => {
			modal.setContent(message || MSG_ERR_UNKNOWN);
			modal.open();
		});

	});

	const registerElement = document.getElementById(EL_ID_REGISTER_BTN) as HTMLElement;
	if (registerElement) {
		const url = new URL(window.location.href);
		const redirectPrev = url.searchParams.get("redirect");
		if (redirectPrev) {
			const href: string = registerElement.getAttribute('href');
			registerElement.setAttribute('href', `${href}?redirect=${redirectPrev}`)
		}
	}

};