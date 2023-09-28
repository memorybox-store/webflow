import { EL_ID_LOGIN_FORM } from "../constants/elements";

import { getElementValueByName } from "../utils/form";
import { signin } from "../api/user";

import { Session } from "../models/user";

export const LoginListener = (): void => {
	const form = document.getElementById(EL_ID_LOGIN_FORM) as HTMLFormElement;
	form?.addEventListener('submit', (event) => {

		event.preventDefault();
		event.stopPropagation();

		let username = getElementValueByName('username');
		let password = getElementValueByName('password');

		signin(username, password).then((data: Session) => {
			location.href = '/finder';
		}).catch((message) => {
			alert(message);
		});

	});
};