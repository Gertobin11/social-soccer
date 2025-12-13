/**
 * Function that transforms a string value of the name in the form into a number
 * @param formData FormData
 * @param name string
 * @returns number
 */
export function getNumberFromFormData(formData: FormData, name: string) {
	const formValue = formData.get(name);

	if (!formValue) {
		throw new Error(`${name} is not in the request data`);
	}

	const formValueAsNumber = Number(formValue);
	if (isNaN(formValueAsNumber)) {
		throw new Error(`${name} is not a valid number`);
	}
	return formValueAsNumber;
}

export function getStringFromFormData(formData: FormData, name: string) {
	const formValue = formData.get(name);

	if (!formValue) {
		throw new Error(`${name} is not in the request data`);
	}

	return formValue.toString();
}
