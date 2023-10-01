import { EL_ID_LOGIN_FORM } from "../constants/elements";

import { getElementValueByID } from "../utils/form";
import { signin } from "../api/user";

import { Session } from "../models/user";

export const LoginListener = (): void => {
	const form = document.getElementById(EL_ID_LOGIN_FORM) as HTMLFormElement;
	form?.addEventListener('submit', (event) => {
		let formData = new FormData(form);
		console.log(formData.get('username'));
		console.log(formData.get('password_input'));

		event.preventDefault();
		event.stopPropagation();

		let username = getElementValueByID('username');
		let password = getElementValueByID('password');

		signin(username, password).then((data: Session) => {
			location.href = '/finder';
		}).catch((message) => {
			alert(message);
		});

	});
};