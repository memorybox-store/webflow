import { EL_ID_LOGIN_FORM } from "../constants/elements";

import { getElementValueByName } from "../utils/form";
import { retrieveProfile, signin } from "../api/user";

import { Profile, Session } from "../models/user";

export const LoginListener = (
	setProfile = (profile: Profile | null) => {}
): void => {
	const form: HTMLFormElement
		= document.getElementById(EL_ID_LOGIN_FORM) as HTMLFormElement;
	if (form) {
		form.addEventListener('submit', (event) => {

			event.preventDefault();
			event.stopPropagation();

			let username = getElementValueByName('username');
			let password = getElementValueByName('password');

			signin(username, password).then((data: Session) => {
				retrieveProfile().then((data: Profile) => {
					setProfile(data);
					location.href = '/finder';
				}).catch((message) => {
					alert(message);
				});
			}).catch((message) => {
				alert(message);
			});

		});
	}
};