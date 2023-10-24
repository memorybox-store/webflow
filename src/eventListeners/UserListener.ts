import {
	EL_ID_USER_TAB_CART,
	EL_ID_USER_TAB_DOWNLOAD,
	EL_ID_USER_TAB_PAYMENT
} from "../constants/elements";
import { URL_USER } from "../constants/urls";

export const UserListener = (): void => {

	// Load on specific page
	const path: string = window.location.pathname;
	if (path === `/${URL_USER}` || path === `/th-${URL_USER}` || path === `/cn-${URL_USER}`) {
		const hash: string = window.location.hash;
		if (hash === '#cart') {
			const tabElement = document.getElementById(EL_ID_USER_TAB_CART) as HTMLElement;
			tabElement?.click();
		} else if (hash === '#payment') {
			const tabElement = document.getElementById(EL_ID_USER_TAB_PAYMENT) as HTMLElement;
			tabElement?.click();
		} else if (hash === '#download') {
			const tabElement = document.getElementById(EL_ID_USER_TAB_DOWNLOAD) as HTMLElement;
			tabElement?.click();
		} else {
			const url = new URL(window.location.href);
			const status = url.searchParams.get("status");
			if (status === 'error') {
				const tabElement = document.getElementById(EL_ID_USER_TAB_PAYMENT) as HTMLElement;
				tabElement?.click();
			} else {
				const tabElement = document.getElementById(EL_ID_USER_TAB_DOWNLOAD) as HTMLElement;
				tabElement?.click();
			}
		}

		const url = new URL(window.location.href);
		const status = url.searchParams.get("status") || '';
		const code = url.searchParams.get("code") || '';
		const message = url.searchParams.get("message") || '';
		const ref = url.searchParams.get("ref") || '';
		const type = url.searchParams.get("type") || '';
		const orders = url.searchParams.get("orders") || '';

		window.history.pushState(null, "", path);
		if (status === 'error' && message) {
			alert(decodeURIComponent(message));
		} else {

		}

	}

};