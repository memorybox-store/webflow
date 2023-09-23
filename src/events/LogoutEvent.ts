import { LOGOUT_BUTTON_ID } from "../contances/elements";
import { Profile, Session } from "../models/UserModel";
import FormService from "../services/FormService";
import UserService from "../services/UserService";

export const LogoutEvent = (
	setProfile = (profile?: Profile | null) => { }
): void => {
	try {
		let button = document.getElementById(LOGOUT_BUTTON_ID);
		if (button) {
			button.addEventListener('click', async () => {
				await UserService.signout().catch((message?) => {
					alert(message || '');
				});
				setProfile(null);
				location.href = './log-in';
			});
		}
	} catch { }
};