import { EL_ID_LOGOUT_BTN } from "../constants/elements";
import { URL_LOGIN } from "../constants/urls";
import { MSG_ERR_UNKNOWN } from "../constants/messages";
import { NAME_OK } from "../constants/names";
import { DATA_ATT_REDIRECT_URI } from "../constants/attributes";

import * as tingle from 'tingle.js';

import { signout } from "../api/user";

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

export const LogoutListener = (): void => {
	const element = document.getElementById(EL_ID_LOGOUT_BTN) as HTMLElement;
	element?.addEventListener('click', async () => {
		await signout().catch((message?) => {
			modal.setContent(message || MSG_ERR_UNKNOWN);
			modal.open();
		});
		const redirect = element.getAttribute(DATA_ATT_REDIRECT_URI) || '';
		if (redirect) {
			location.href = redirect;
		} else {
			location.href = `./${URL_LOGIN}`;
		}
	});
};