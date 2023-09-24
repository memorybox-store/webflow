import {
	EL_ID_FIND_FORM,
	EL_ID_SELECT_BOAT,
	EL_ID_SELECT_COMPANY,
	EL_ID_SELECT_TRIP_DATE
} from "../constants/elements";

import moment from '../config/moment';

import { getCompanies, getProducts } from "../api/product";

import { Company } from "../models/product";

export const ProductListener = (): void => {

	let companyOptions: Array<any> = [
		{
			value: '',
			text: 'Select company...'
		}
	];

	let company: string = '';
	const setCompany = (data: string = '') => {
		company = data;
	}

	let date: string = moment().format();
	const setDate = (data: string = moment().format()) => {
		date = data;
	}

	let boat: string = '';
	const setBoat = (data: string = '') => {
		boat = data;
	}

	const setCompanies = (data: Company[]) => {
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
		const element = document.getElementById(EL_ID_SELECT_COMPANY);
		if (element) {
			if (element.hasChildNodes()) {
				const nodes: Array<any> = Object.entries(element.childNodes).map(([_, node]) => node);
				const commonNodes = nodes.filter(
					(node) => node.nodeType !== 3
				);
				for (const node of nodes) {
					element.removeChild(node);
				}
				if (commonNodes.length) {
					const optionElementTemplate = commonNodes[0];
					for (const option of companyOptions) {
						const clonedElement: any = optionElementTemplate.cloneNode(true);
						clonedElement.setAttribute('value', option.value);
						clonedElement.textContent = option.text;
						element.appendChild(clonedElement);
					};
				}
			}
		}
	}

	const setProducts = (data: Company[]) => {
		companyOptions = [
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
		const element = document.getElementById(EL_ID_SELECT_BOAT);
		if (element) {
			if (element.hasChildNodes()) {
				const nodes: Array<any> = Object.entries(element.childNodes).map(([_, node]) => node);
				const commonNodes = nodes.filter(
					(node) => node.nodeType !== 3
				);
				for (const node of nodes) {
					element.removeChild(node);
				}
				if (commonNodes.length) {
					const optionElementTemplate = commonNodes[0];
					for (const option of companyOptions) {
						const clonedElement: any = optionElementTemplate.cloneNode(true);
						clonedElement.setAttribute('value', option.value);
						clonedElement.textContent = option.text;
						element.appendChild(clonedElement);
					};
				}
			}
		}
	}

	const loadCompanies = () => {
		return new Promise(async (resolve) => {
			await getCompanies().then(async (data: Array<any>) => {
				console.log(data);
				setCompanies(data);
				resolve(data);
			}).catch((error) => {
				alert(error);
			});
		});
	}

	const loadProducts = (companyId: string, tripDate: string) => {
		return new Promise(async (resolve) => {
			await getProducts(companyId, tripDate).then(async (data: Array<any>) => {
				console.log(data);
				setProducts(data);
				resolve(data);
			}).catch((error) => {
				alert(error);
			});
		});
	}

	const companyElement: any = document.getElementById(EL_ID_SELECT_COMPANY);
	if (companyElement) {
		loadCompanies();
		companyElement.addEventListener("change", (event: any) => {
			const value = event.target.value;
			setCompany(value);
			loadProducts(value, date);
		});
	}

	const dateElement: any = document.getElementById(EL_ID_SELECT_TRIP_DATE);
	if (dateElement) {
		// Create a MutationObserver
		const observer = new MutationObserver(function (mutationsList) {
			for (const mutation of mutationsList) {
				if (mutation.type === 'attributes' && mutation.attributeName === 'value') {
					// The value attribute of the input element has changed
					const value = dateElement.value;
					if (moment(value, 'YYYY-MM-DD', true).isValid()) {
						setDate(value);
						loadProducts(company, value);
					}
				}
			}
		});

		observer.observe(dateElement, { attributes: true, attributeFilter: ['value'] });

		dateElement.setAttribute('value', moment().format('YYYY-MM-DD'));

	}

	const boatElement: any = document.getElementById(EL_ID_SELECT_BOAT);
	if (boatElement) {
		boatElement.addEventListener("change", (event: any) => {
			const value = event.target.value;
			setBoat(value);
		});
	}

	const form = document.getElementById(EL_ID_FIND_FORM);
	if (form) {
		form.addEventListener('submit', (event) => {

			event.preventDefault();
			event.stopPropagation();

			if (boat) {
				location.href = './result' + "?fid=" + boat + "&mid=";
			} else {
				alert('Please select boat');
			}

		});
	}
};