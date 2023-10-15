import { EL_ID_REGISTER_FORM } from "../constants/elements";

import { signin } from "../api/user";

import { Session } from "../models/user";

export const LoginListener = (): void => {
	const formElement = document.getElementById(EL_ID_REGISTER_FORM) as HTMLFormElement;
	formElement?.addEventListener('submit', (event) => {

		event.preventDefault();
		event.stopPropagation();
		
		const formData = new FormData(formElement);

		const name = formData.get('name') as string || '';
		const username = formData.get('username') as string || '';
		const password = formData.get('password_input') as string || '';

		signin(username, password).then((data: Session) => {
			location.href = './finder';
		}).catch((message) => {
			alert(message);
		});

	});
};