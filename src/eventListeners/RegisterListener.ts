import { EL_ID_REGISTER_FORM } from "../constants/elements";
import { URL_LOGIN } from "../constants/urls";

import { register } from "../api/user";
import { MSG_SUCCESS } from "../constants/messages";

export const RgisterListener = (): void => {
	const formElement = document.getElementById(EL_ID_REGISTER_FORM) as HTMLFormElement;
	formElement?.addEventListener('submit', (event) => {

		const msgSuccess: string = formElement.getAttribute('data-success') || MSG_SUCCESS;

		event.preventDefault();
		event.stopPropagation();
		
		const formData = new FormData(formElement);

		const name = formData.get('name') as string || '';
		const email = formData.get('email') as string || '';
		const password = formData.get('password_input') as string || '';

		register(name, email, password).then(() => {
			alert(msgSuccess);
			location.href = `./${URL_LOGIN}`;
		}).catch((message) => {
			alert(message);
		});

	});
};