import { LOGIN_FORM_ID } from "../contances/elements";
import FormService from "../services/FormService";
import UserService from "../services/UserService";

export const LoginEvent = () => {
	try {
		let form = document.getElementById(LOGIN_FORM_ID);
		if (form) {
			form.addEventListener('submit', (event) => {
	
				event.preventDefault();
				event.stopPropagation();

				document.getElementsByName('test');
	
				let username = FormService.getValueByName('username');
				let password = FormService.getValueByName('password');
	
				UserService.signin(username, password).catch((message) => {
					alert(message);
				});
		
			});
		}
	} catch {}
};

export const EEvent = () => {
  // var form = document.getElementById(LOGIN_FORM_ID);
	// form.addEventListener('submit', function(event) {
	// 	event.preventDefault();
	// 	event.stopPropagation();
  // });
};

