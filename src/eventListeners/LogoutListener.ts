import { EL_ID_LOGOUT_BTN } from "../constants/elements";

import { signout } from "../api/user";

export const LogoutListener = (): void => {
	const element = document.getElementById(EL_ID_LOGOUT_BTN) as HTMLElement;
	element?.addEventListener('click', async () => {
		await signout().catch((message?) => {
			alert(message || '');
		});
		location.href = './log-in';
	});
};