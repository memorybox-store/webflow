import { EL_ID_REGISTER_ACCEPT, EL_ID_REGISTER_FORM } from "../constants/elements";
import { MSG_ERR_ACCEPT_TERMS, MSG_ERR_UNKNOWN, MSG_SUCCESS } from "../constants/messages";
import { URL_LOGIN } from "../constants/urls";
import { DATA_ATT_REDIRECT_URI } from "../constants/attributes";

import { register } from "../api/user";

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
modal.addFooterBtn('OK', 'tingle-btn tingle-btn--primary', () => modal.close());

const modalSuccess = new tingle.modal({
  footer: true,
  stickyFooter: false,
  closeMethods: ['overlay', 'button', 'escape'],
  closeLabel: '',
	onClose: () => {
		const formElement = document.getElementById(EL_ID_REGISTER_FORM) as HTMLFormElement;
		if (formElement) {
			const redirect = formElement.getAttribute(DATA_ATT_REDIRECT_URI) || '';
			if (redirect) {
				location.href = redirect;
			} else {
				location.href = `./${URL_LOGIN}`;
			}
		}
	},
  beforeClose: () => {
    return true;
  }
});
modalSuccess.setContent('');
modalSuccess.addFooterBtn('OK', 'tingle-btn tingle-btn--primary', () => modalSuccess.close());

export const RgisterListener = (): void => {
	const formElement = document.getElementById(EL_ID_REGISTER_FORM) as HTMLFormElement;
	formElement?.addEventListener('submit', (event) => {

		const msgSuccess: string = formElement.getAttribute('data-success') || MSG_SUCCESS;
		const msgAccept: string = formElement.getAttribute('data-accept') || MSG_ERR_ACCEPT_TERMS;

		event.preventDefault();
		event.stopPropagation();
		
		const formData = new FormData(formElement);

		const acceptElement = document.querySelector(`.w-checkbox-input`) as HTMLInputElement;

		if (!acceptElement || acceptElement.classList.contains('w--redirected-checked')) {

			const name = formData.get('name') as string || '';
			const email = formData.get('email') as string || '';
			const password = formData.get('password_input') as string || '';
	
			register(name, email, password).then(() => {
        modalSuccess.setContent(msgSuccess || MSG_ERR_UNKNOWN);
        modalSuccess.open();
			}).catch((message) => {
        modal.setContent(message || MSG_ERR_UNKNOWN);
        modal.open();
			});

		} else {
			modal.setContent(msgAccept || MSG_ERR_UNKNOWN);
			modal.open();
		}

	});
};