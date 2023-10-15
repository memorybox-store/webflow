import { EL_ID_LOGOUT_BTN } from "../constants/elements";
import { URL_LOGIN } from "../constants/urls";

import { signout } from "../api/user";

export const LogoutListener = (): void => {
	const element = document.getElementById(EL_ID_LOGOUT_BTN) as HTMLElement;
	element?.addEventListener('click', async () => {
		await signout().catch((message?) => {
			alert(message || '');
		});
		location.href = `./${URL_LOGIN}`;
	});
};