import { EL_ID_LOGOUT_BTN } from "../constants/elements";

import { signout } from "../api/user";

import { Profile } from "../models/user";

export const LogoutListener = (
	setProfile = (profile?: Profile | null) => { }
): void => {
	try {
		let button: HTMLButtonElement
			= document.getElementById(EL_ID_LOGOUT_BTN) as HTMLButtonElement;
		if (button) {
			button.addEventListener('click', async () => {
				await signout().catch((message?) => {
					alert(message || '');
				});
				setProfile(null);
				location.href = './log-in';
			});
		}
	} catch { }
};