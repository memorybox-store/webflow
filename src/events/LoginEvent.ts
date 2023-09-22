import { LOGIN_FORM_ID } from "../contances/elements";

export const LoginEvent = () => {
  var form = document.getElementById(LOGIN_FORM_ID);
	form.addEventListener('submit', function(event) {
		event.preventDefault();
		event.stopPropagation();

    console.log(event);
  });
};

export const EEvent = () => {
  // var form = document.getElementById(LOGIN_FORM_ID);
	// form.addEventListener('submit', function(event) {
	// 	event.preventDefault();
	// 	event.stopPropagation();
  // });
};

