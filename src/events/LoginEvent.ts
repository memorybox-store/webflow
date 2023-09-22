import { LOGIN_FORM_ID } from "../contances/elements";

export const LoginEvent = () => {
  let form = document.getElementById(LOGIN_FORM_ID);
	if (form) {
		form.addEventListener('submit', function(event) {
			event.preventDefault();
			event.stopPropagation();
	
			console.log(event);
		});
	}
};

export const EEvent = () => {
  // var form = document.getElementById(LOGIN_FORM_ID);
	// form.addEventListener('submit', function(event) {
	// 	event.preventDefault();
	// 	event.stopPropagation();
  // });
};

