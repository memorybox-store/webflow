import {
  EL_ID_PAYMENT_PROCESS,
  EL_ID_PAYMENT_PROCESS_AUTHORIZE,
  EL_ID_PAYMENT_PROCESS_SCANNABLE,
  EL_ID_PAYMENT_PROCESS_SCANNABLE_HELPER
} from "../constants/elements";

export const ProcessPaymentListener = async (): Promise<void> => {

  const element = document.getElementById(EL_ID_PAYMENT_PROCESS) as HTMLElement;
  if (element) {
    const url = new URL(window.location.href);
    const authorizeUri = url.searchParams.get("authorize_uri");
    const authorizeElement = document.getElementById(EL_ID_PAYMENT_PROCESS_AUTHORIZE) as HTMLElement;
    if (authorizeElement) {
      if (authorizeUri) {
        authorizeElement.addEventListener('click', async () => {
          location.href = decodeURIComponent(authorizeUri);
        });
        authorizeElement.classList.remove('hidden-force');
      } else {
        authorizeElement.classList.add('hidden-force');
      }
    }
    const scannable = url.searchParams.get("scannable");
    const imgElement = document.getElementById(EL_ID_PAYMENT_PROCESS_SCANNABLE) as HTMLImageElement;
    if (imgElement) {
      const helperElement = document.getElementById(EL_ID_PAYMENT_PROCESS_SCANNABLE_HELPER) as HTMLImageElement;
      if (scannable) {
        imgElement.src = decodeURIComponent(scannable);
        imgElement.classList.remove('hidden-force');
        if (helperElement) {
          helperElement.classList.remove('hidden-force');
        }
      } else {
        imgElement.classList.add('hidden-force');
        if (helperElement) {
          helperElement.classList.add('hidden-force');
        }
      }
    }
  }

}