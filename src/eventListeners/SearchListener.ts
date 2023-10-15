import {
	EL_ID_FIND_FORM,
	EL_ID_SELECT_BOAT,
	EL_ID_SELECT_COMPANY,
	EL_ID_SELECT_TRIP_DATE
} from "../constants/elements";
import { MSG_ERR_EMPTY_BOAT, MSG_ERR_EMPTY_COMPANY, MSG_ERR_EMPTY_DATE } from "../constants/messages";

import moment from '../config/moment';

import { getCompanies, getBoats } from "../api/sale";

import { Company } from "../models/sale";

export const SearchListener = (): void => {

	let companyOptions: Array<any> = [
		{
			value: '',
			text: 'Select company...'
		}
	];

	let boatOptions: Array<any> = [
		{
			value: '',
			text: 'Boat...'
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
				text: 'Select company...'
			},
			...data.map((item: Company) => (
				{
					value: item.id,
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
						selectOptionElement.innerText = option.text;
						element.appendChild(selectOptionElement);
					};
				}
			}
		}
	}

	const setBoats = (data: Company[]) => {
		boatOptions = [
			{
				value: '',
				text: 'Boat...'
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
	}

	const loadCompanies = () => {
		return new Promise(async (resolve) => {
			await getCompanies().then(async (data: Array<any>) => {
				setCompanies(data);
				resolve(data);
			}).catch((error) => {
				alert(error);
			});
		});
	}

	const loadBoats = (companyId: string, tripDate: string) => {
		return new Promise(async (resolve) => {
			await getBoats(companyId, tripDate).then(async (data: Array<any>) => {
				setBoats(data);
				resolve(data);
			}).catch((error) => {
				alert(error);
			});
		});
	}

	const companyElement = document.getElementById(EL_ID_SELECT_COMPANY) as HTMLSelectElement;
	if (companyElement) {
		loadCompanies();
		companyElement.addEventListener("change", (event: any) => {
			const value = event.target.value;
			company = value;
			loadBoats(value, date);
		});
	}

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
		formElement.addEventListener('submit', (event) => {

			const msgEmptyCompany: string = formElement.getAttribute('data-empty-company') || MSG_ERR_EMPTY_COMPANY;
			const msgEmptyDate: string = formElement.getAttribute('data-empty-date') || MSG_ERR_EMPTY_DATE;
			const msgEmptyBoat: string = formElement.getAttribute('data-empty-boat') || MSG_ERR_EMPTY_BOAT;

			event.preventDefault();
			event.stopPropagation();

			const formData = new FormData(formElement);

			const boat = formData.get('boat') as string || '';
			const company = formData.get('company') as string || '';
			const date = formData.get('date') as string || '';

			if (company && date && boat) {
				const companyName = companies.find((data: Company) => data.id.toString() === company)?.name || '';
				location.href = `./result?fid=${boat}&date=${date}&mid=&company=${encodeURI(companyName)}`;
			} else {
				if (!company) {
					alert(msgEmptyCompany);
				} else if (!date) {
					alert(msgEmptyDate);
				} else if (!boat) {
					alert(msgEmptyBoat);
				}
			}

		});
	}
};