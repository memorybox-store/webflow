import {
	EL_ID_DROPDOWN_BOAT,
	EL_ID_DROPDOWN_COMPANY,
	EL_ID_FIND_FORM,
	EL_ID_SELECT_BOAT,
	EL_ID_SELECT_COMPANY,
	EL_ID_SELECT_TRIP_DATE
} from "../constants/elements";
import { 
	MSG_ERR_EMPTY_BOAT, 
	MSG_ERR_EMPTY_COMPANY, 
	MSG_ERR_EMPTY_DATE, 
	MSG_ERR_EMPTY_GUIDE, 
	MSG_ERR_UNKNOWN
} from "../constants/messages";
import { 
	DATA_ATT_EMPTY_BOAT, 
	DATA_ATT_EMPTY_COMPANY, 
	DATA_ATT_EMPTY_DATE, 
	DATA_ATT_EMPTY_GUIDE, 
	DATA_ATT_RESULT_URI 
} from "../constants/attributes";
import { URL_RESULT } from "../constants/urls";
import { NAME_OK } from "../constants/names";

import moment from '../config/moment';

import { getCompanies, getBoats } from "../api/sale";

import { Company } from "../models/sale";

import * as tingle from 'tingle.js';
import { setStorage } from "../utils/storage";

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

export const SearchListener = (): void => {

	let companyOptions: Array<any> = [
		{
			value: '',
			text: 'Select Company...'
		}
	];

	let boatOptions: Array<any> = [
		{
			value: '',
			text: 'Select Boat...'
		}
	];

	let company: string = '';
	let companies: Company[] = [];

	let date: string = moment().format();

	let boat: string = '';

	const setCompanies = (data: Company[]) => {
		companies = [...data];
		companyOptions = [
			{
				value: '',
				subvalue: '',
				text: 'Select Company...'
			},
			...data.map((item: Company) => (
				{
					value: item.id,
					subvalue: item.shortname,
					text: item.name
				}
			))
		];
		const element = document.getElementById(EL_ID_SELECT_COMPANY) as HTMLSelectElement;
		if (element) {
			if (element.hasChildNodes()) {
				const nodes: Array<any> = Object.entries(element.childNodes).map(
					([_, node]) => node
				);
				const commonNodes = nodes.filter(
					(node) => node.nodeType !== 3
				);
				for (const node of nodes) {
					element.removeChild(node);
				}
				if (commonNodes.length) {
					const optionElementTemplate = commonNodes[0];
					for (const option of companyOptions) {
						const selectOptionElement: any = optionElementTemplate.cloneNode(true);
						selectOptionElement.setAttribute('value', option.value);
						selectOptionElement.setAttribute('date-shortname', option.subvalue);
						selectOptionElement.innerText = option.text;
						element.appendChild(selectOptionElement);
					};
				}
			}
			const url = new URL(window.location.href);
			const companyShortname = url.searchParams.get("company");
			if (companyShortname) {
				const select: any = companyOptions.find((item: any) => item.subvalue === companyShortname);
				if (select) {
					element.value = select.value.toString();
				}
			}
		}
		const dropdownElement = document.getElementById(EL_ID_DROPDOWN_COMPANY) as HTMLSelectElement;
		if (dropdownElement) {
			const dropdownLabel = dropdownElement.querySelector('[fs-selectcustom-element="label"]');
			if (dropdownLabel) {
				dropdownLabel.innerHTML = 'Select Company...';
			}
			const dropdownSelect = dropdownElement.parentElement.querySelector('select');
			dropdownSelect.value = '';
			if (dropdownElement.hasChildNodes()) {
				const dropdownSelect = dropdownElement.parentElement.querySelector('select');
				if (dropdownSelect) {
					if (dropdownSelect.hasChildNodes()) {
						const nodes: Array<any> = Object.entries(dropdownSelect.childNodes).map(
							([_, node]) => node
						);
						const commonNodes = nodes.filter(
							(node) => node.nodeType !== 3
						);
						for (const node of nodes) {
							dropdownSelect.removeChild(node);
						}
						const optionElementTemplate = commonNodes[0];
						for (const option of companyOptions) {
							const selectOptionElement: any = optionElementTemplate.cloneNode(true);
							selectOptionElement.setAttribute('value', option.value);
							selectOptionElement.innerText = option.text;
							dropdownSelect.appendChild(selectOptionElement);
						};
					}
				}
				const dropdownLink = dropdownElement.parentElement.querySelector('nav');
				if (dropdownLink) {
					if (dropdownLink.hasChildNodes()) {
						const nodes: Array<any> = Object.entries(dropdownLink.childNodes).map(
							([_, node]) => node
						);
						const commonNodes = nodes.filter(
							(node) => node.tagName === 'A'
						);
						for (const node of commonNodes) {
							dropdownLink.removeChild(node);
						}
						const optionElementTemplate = commonNodes[0];
						for (const option of companyOptions) {
							const selectOptionElement: any = optionElementTemplate.cloneNode(true);
							selectOptionElement.innerText = option.text;
							selectOptionElement.addEventListener("click", () => {
								dropdownElement.classList.remove('w--open');
								dropdownLink.classList.remove('w--open');
								const dropdownArrow = dropdownElement.querySelector('.w-icon-dropdown-toggle');
								dropdownArrow?.setAttribute(
									'style', 
									'transform: translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg); transform-style: preserve-3d;'
								);
								const dropdownLabel = dropdownElement.querySelector('[fs-selectcustom-element="label"]');
								if (dropdownLabel) {
									dropdownLabel.innerHTML = option.text;
								}
								const dropdownSelect = dropdownElement.parentElement.querySelector('select');
								dropdownSelect.value = option.value;
								loadBoats(option.value, date);
							});
							dropdownLink.appendChild(selectOptionElement);
						};
					}
				}
			}
		}

    const url = new URL(window.location.href);
    let companyParam = url.searchParams.get("company");
		if (companyParam) {
			const companySelected: Company = companies.find((data: Company) => data.shortname === companyParam);
			if (companySelected) {
				company = companySelected.id.toString();
			}
		}

	}

	const setBoats = (data: Company[]) => {
		boatOptions = [
			{
				value: '',
				text: 'Select Boat...'
			},
			...data.map((item: Company) => (
				{
					value: item.id,
					text: item.name
				}
			))
		];
		const element = document.getElementById(EL_ID_SELECT_BOAT) as HTMLSelectElement;
		if (element) {
			if (element.hasChildNodes()) {
				const nodes: Array<any> = Object.entries(element.childNodes).map(
					([_, node]) => node
				);
				const commonNodes = nodes.filter(
					(node) => node.nodeType !== 3
				);
				for (const node of nodes) {
					element.removeChild(node);
				}
				if (commonNodes.length) {
					const optionElementTemplate = commonNodes[0];
					for (const option of boatOptions) {
						const selectOptionElement: any = optionElementTemplate.cloneNode(true);
						selectOptionElement.setAttribute('value', option.value);
						selectOptionElement.innerText = option.text;
						element.appendChild(selectOptionElement);
					};
				}
			}
		}
		const dropdownElement = document.getElementById(EL_ID_DROPDOWN_BOAT) as HTMLSelectElement;
		if (dropdownElement) {
			const dropdownLabel = dropdownElement.querySelector('[fs-selectcustom-element="label"]');
			if (dropdownLabel) {
				dropdownLabel.innerHTML = 'Select Boat...';
			}
			const dropdownSelect = dropdownElement.parentElement.querySelector('select');
			dropdownSelect.value = '';
			if (dropdownElement.hasChildNodes()) {
				const dropdownSelect = dropdownElement.parentElement.querySelector('select');
				if (dropdownSelect) {
					if (dropdownSelect.hasChildNodes()) {
						const nodes: Array<any> = Object.entries(dropdownSelect.childNodes).map(
							([_, node]) => node
						);
						const commonNodes = nodes.filter(
							(node) => node.nodeType !== 3
						);
						for (const node of nodes) {
							dropdownSelect.removeChild(node);
						}
						const optionElementTemplate = commonNodes[0];
						for (const option of boatOptions) {
							const selectOptionElement: any = optionElementTemplate.cloneNode(true);
							selectOptionElement.setAttribute('value', option.value);
							selectOptionElement.innerText = option.text;
							dropdownSelect.appendChild(selectOptionElement);
						};
					}
				}
				const dropdownLink = dropdownElement.parentElement.querySelector('nav');
				if (dropdownLink) {
					if (dropdownLink.hasChildNodes()) {
						const nodes: Array<any> = Object.entries(dropdownLink.childNodes).map(
							([_, node]) => node
						);
						const commonNodes = nodes.filter(
							(node) => node.tagName === 'A'
						);
						for (const node of commonNodes) {
							dropdownLink.removeChild(node);
						}
						const optionElementTemplate = commonNodes[0];
						for (const option of boatOptions) {
							const selectOptionElement: any = optionElementTemplate.cloneNode(true);
							selectOptionElement.innerText = option.text;
							selectOptionElement.addEventListener("click", () => {
								dropdownElement.classList.remove('w--open');
								dropdownLink.classList.remove('w--open');
								const dropdownArrow = dropdownElement.querySelector('.w-icon-dropdown-toggle');
								dropdownArrow?.setAttribute(
									'style', 
									'transform: translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg); transform-style: preserve-3d;'
								);
								const dropdownLabel = dropdownElement.querySelector('[fs-selectcustom-element="label"]');
								if (dropdownLabel) {
									dropdownLabel.innerHTML = option.text;
								}
								const dropdownSelect = dropdownElement.parentElement.querySelector('select');
								dropdownSelect.value = option.value;
							});
							dropdownLink.appendChild(selectOptionElement);
						};
					}
				}
			}
		}
	}

	const loadCompanies = () => {
		return new Promise(async (resolve) => {
			await getCompanies().then(async (data: Array<any>) => {
				setCompanies(data);
				resolve(data);
			}).catch((message) => {
        modal.setContent(message || MSG_ERR_UNKNOWN);
        modal.open();
			});
		});
	}

	const loadBoats = (companyId: string, tripDate: string) => {
		return new Promise(async (resolve) => {
			await getBoats(companyId, tripDate).then(async (data: Array<any>) => {
				setBoats(data);
				resolve(data);
			}).catch((message) => {
        modal.setContent(message || MSG_ERR_UNKNOWN);
        modal.open();
			});
		});
	}

	loadCompanies();

	const companyElement = document.getElementById(EL_ID_SELECT_COMPANY) as HTMLSelectElement;
	if (companyElement) {
		companyElement.addEventListener("change", (event: any) => {
			const value = event.target.value;
			company = value;
			loadBoats(value, date);
		});
	}

	// const companyDropdownElement = document.getElementById(EL_ID_DROPDOWN_COMPANY) as HTMLElement;
	// if (companyDropdownElement) {
	// 	companyDropdownElement.addEventListener("change", (event: any) => {
	// 		const value = event.target.value;
	// 		company = value;
	// 		loadBoats(value, date);
	// 	});
	// }

	// if (companyElement || companyDropdownElement) {
	// 	loadCompanies();
	// }

	const dateElement = document.getElementById(EL_ID_SELECT_TRIP_DATE) as HTMLInputElement;
	if (dateElement) {
		
		// Create a MutationObserver
		const observer = new MutationObserver(function (mutationsList) {
			for (const mutation of mutationsList) {
				if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
					// The value attribute of the input element has changed
					const value = dateElement.value;
					if (moment(value, 'YYYY-MM-DD', true).isValid()) {
						date = value;
						loadBoats(company, value);
					}
				}
			}
		});
		observer.observe(dateElement, { attributes: true, attributeFilter: ['value'] });

		dateElement.addEventListener("change", (event: any) => {
			const value = event.target.value;
			if (moment(value, 'YYYY-MM-DD', true).isValid() && value !== date) {
				date = value;
				dateElement.setAttribute('value', value);
			}
		});

		dateElement.addEventListener("input", (event: any) => {
			const value = event.target.value;
			if (moment(value, 'YYYY-MM-DD', true).isValid() && value !== date) {
				date = value;
				dateElement.setAttribute('value', value);
			}
		});

		dateElement.setAttribute('value', moment().format('YYYY-MM-DD'));

	}

	const boatElement = document.getElementById(EL_ID_SELECT_BOAT) as HTMLSelectElement;
	if (boatElement) {
		boatElement.addEventListener("change", (event: any) => {
			const value = event.target.value;
			boat = value;
		});
	}

	const formElement = document.getElementById(EL_ID_FIND_FORM) as HTMLFormElement;
	if (formElement) {
		formElement.addEventListener('submit', async (event) => {

			const msgEmptyCompany: string = formElement.getAttribute(DATA_ATT_EMPTY_COMPANY) || MSG_ERR_EMPTY_COMPANY;
			const msgEmptyDate: string = formElement.getAttribute(DATA_ATT_EMPTY_DATE) || MSG_ERR_EMPTY_DATE;
			const msgEmptyBoat: string = formElement.getAttribute(DATA_ATT_EMPTY_BOAT) || MSG_ERR_EMPTY_BOAT;
			const msgEmptyGuide: string = formElement.getAttribute(DATA_ATT_EMPTY_GUIDE) || MSG_ERR_EMPTY_GUIDE;

			event.preventDefault();
			event.stopPropagation();

			const formData = new FormData(formElement);

			const boat = formData.get('boat') as string || '';
			const company = formData.get('company') as string || '';
			const date = formData.get('date') as string || '';

			if (company && date && boat) {
				const companyName = companies.find((data: Company) => data.id.toString() === company)?.name || '';
				await setStorage('result-fid', boat);
				await setStorage('result-date', date);
				await setStorage('result-company', companyName);
				const result = formElement.getAttribute(DATA_ATT_RESULT_URI) || '';
				if (result) {
					location.href = `${result}?fid=${boat}&date=${date}&mid=&company=${encodeURI(companyName)}`;
				} else {
					location.href = `./${URL_RESULT}?fid=${boat}&date=${date}&mid=&company=${encodeURI(companyName)}`;
				}
			} else {
				if (!company) {
					modal.setContent(msgEmptyCompany || MSG_ERR_UNKNOWN);
					modal.open();
				} else if (!date) {
					modal.setContent(msgEmptyDate || MSG_ERR_UNKNOWN);
					modal.open();
				} else if (!boat) {
					modal.setContent(msgEmptyBoat || MSG_ERR_UNKNOWN);
					modal.open();
				}
			}

		});
	}
};