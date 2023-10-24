import { EL_ID_LOGIN_FORM } from "../constants/elements";

import { signin } from "../api/user";

import { Session } from "../models/user";
import { URL_FINDER } from "../constants/urls";

export const LoginListener = (): void => {
	const formElement = document.getElementById(EL_ID_LOGIN_FORM) as HTMLFormElement;
	formElement?.addEventListener('submit', (event) => {

		event.preventDefault();
		event.stopPropagation();

		const formData = new FormData(formElement);

		const username = formData.get('username') as string || '';
		const password = formData.get('password') as string || '';

		signin(username, password).then((data: Session) => {
			const redirect = formElement.getAttribute('data-redirect-uri') || '';
			if (redirect) {
				location.href = redirect;
			} else {
				location.href = `./${URL_FINDER}`;
			}
		}).catch((message) => {
			alert(message);
		});

	});
};