import { EL_ID_LOGOUT_BTN } from "../constants/elements";
import { URL_LOGIN } from "../constants/urls";
import { MSG_ERR_UNKNOWN } from "../constants/messages";

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
modal.addFooterBtn('OK', 'tingle-btn tingle-btn--primary', () => modal.close());

export const LogoutListener = (): void => {
	const element = document.getElementById(EL_ID_LOGOUT_BTN) as HTMLElement;
	element?.addEventListener('click', async () => {
		await signout().catch((message?) => {
			modal.setContent(message || MSG_ERR_UNKNOWN);
			modal.open();
		});
		location.href = `./${URL_LOGIN}`;
	});
};