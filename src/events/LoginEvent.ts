import { LOGIN_FORM_ID } from "../contances/elements";
import { Profile, Session } from "../models/UserModel";
import FormService from "../services/FormService";
import UserService from "../services/UserService";

export const LoginEvent = (
	setProfile = (profile?: Profile | null) => { }
): void => {
	try {
		const form = document.getElementById(LOGIN_FORM_ID);
		if (form) {
			form.addEventListener('submit', (event) => {

				event.preventDefault();
				event.stopPropagation();

				document.getElementsByName('test');

				let username = FormService.getValueByName('username');
				let password = FormService.getValueByName('password');

				UserService.signin(username, password).then((data: Session) => {
					UserService.profile().then((data: Profile) => {
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