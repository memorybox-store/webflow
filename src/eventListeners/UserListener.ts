import { 
	EL_ID_USER_TAB_CART, 
	EL_ID_USER_TAB_DOWNLOAD, 
	EL_ID_USER_TAB_PAYMENT 
} from "../constants/elements";

export const UserListener = (): void => {

	// Load on specific page
  const path: string = window.location.pathname;
  if (path === '/user') {
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
    const status = url.searchParams.get("status");
    const message = url.searchParams.get("message");
		if (status === 'error' && message) {
			alert(decodeURIComponent(message));
		}

  }

};