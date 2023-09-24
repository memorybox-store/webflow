import { EL_ID_LOGIN_FORM } from "../constants/elements";

import { getElementValueByName } from "../utils/form";
import { retrieveProfile, signin } from "../api/user";

import { Profile, Session } from "../models/user";

export const LoginListener = (
	setProfile = (profile?: Profile | null) => { }
): void => {
	try {
		const form = document.getElementById(EL_ID_LOGIN_FORM);
		if (form) {
			form.addEventListener('submit', (event) => {

				event.preventDefault();
				event.stopPropagation();

				document.getElementsByName('test');

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
	} catch { }
};