import {
	EL_ID_USER_TAB_CART,
	EL_ID_USER_TAB_DOWNLOAD,
	EL_ID_USER_TAB_PAYMENT
} from "../constants/elements";
import { LANG_PREF_CN, LANG_PREF_TH } from "../constants/languages";
import { MSG_ERR_UNKNOWN } from "../constants/messages";
import { NAME_OK } from "../constants/names";
import { URL_USER } from "../constants/urls";

import { paymentAuthorize } from "../api/payment";

import * as tingle from 'tingle.js';
import { updateOrders } from "./OrderListener";

const modal = new tingle.modal({
  footer: true,
  stickyFooter: false,
  closeMethods: ['overlay', 'button', 'escape'],
  closeLabel: '',
  beforeClose: () => {
    return true;
  }
});
modal.setContent('');
modal.addFooterBtn(NAME_OK, 'tingle-btn tingle-btn--primary', () => modal.close());

export const UserListener = (): void => {

	// Load on specific page
	const path: string = window.location.pathname;
	if (path === `/${URL_USER}` || path === `/${LANG_PREF_TH}${URL_USER}` || path === `/${LANG_PREF_CN}${URL_USER}`) {
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
		const ref = url.searchParams.get("ref") || '';
		const status = url.searchParams.get("status") || 'successful';
		const code = url.searchParams.get("code") || '';
		const message = url.searchParams.get("message") || '';
		const type = url.searchParams.get("type") || '';
		const orders = url.searchParams.get("orders") || '';
		
		window.history.pushState(null, "", path);

		if (ref) {
			paymentAuthorize(
				status === 'successful' ? true : false,
				ref,
				type,
				code,
				message,
				orders
			).then(() => {
				if (status === 'error' && message) {
					modal.setContent(decodeURIComponent(message) || MSG_ERR_UNKNOWN);
					modal.open();
				} else {
					updateOrders();
					updateDownloads();
				}
			}).catch((message) => {
				modal.setContent(message || MSG_ERR_UNKNOWN);
				modal.open();
			});
		} else {
			modal.setContent(message || MSG_ERR_UNKNOWN);
			modal.open();
		}

	}

};

function updateDownloads() {
	throw new Error("Function not implemented.");
}
