import { EL_ID_REGISTER_ACCEPT, EL_ID_REGISTER_FORM } from "../constants/elements";
import { MSG_ERR_ACCEPT_TERMS, MSG_SUCCESS } from "../constants/messages";
import { URL_LOGIN } from "../constants/urls";

import { register } from "../api/user";

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
				alert(msgSuccess);
				const redirect = formElement.getAttribute('data-redirect-uri') || '';
				if (redirect) {
					location.href = redirect;
				} else {
					location.href = `./${URL_LOGIN}`;
				}
			}).catch((message) => {
				alert(message);
			});

		} else {
			alert(msgAccept);
		}

	});
};