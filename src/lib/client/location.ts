/**
 * Function the translates the data returned from reverse geo lookup into 
 * a structure useable in the database schema
 * @param components The address components returned from a Google Geocode reverse look up
 * @returns an object that mirrors the structure of the address schema in the database
 */
export function parseGeocodeAddress(components: AddressComponent[]): StructuredAddress {
	const tempComponents: { [key: string]: string } = {};
    tempComponents.line_two_raw = ""

	for (const component of components) {

		const primaryType = component.types[0];
		const longName = component.long_name;

		switch (primaryType) {
			case 'street_number':
				tempComponents.street_number = longName;
				break;
			case 'route':
				tempComponents.route = longName;
				break;
			case 'premise':
			case 'subpremise':
			case 'sublocality':
			case 'neighborhood':
				tempComponents.line_two_raw +=  " " + longName;
				break;
			case 'locality':
				tempComponents.city = longName;
				break;
			case 'administrative_area_level_1':
				tempComponents.county = longName;
				break;
			case 'country':
				tempComponents.country = longName;
				break;
			case 'postal_code':
				tempComponents.eircode = longName;
				break;
		}
	}

	const streetNumber = tempComponents.street_number || '';
	const route = tempComponents.route || '';

	const lineOne = [streetNumber, route].filter(Boolean).join(' ').trim();

	const lineTwo = tempComponents.line_two_raw || '';

	return {
		lineOne: lineOne,
		lineTwo: lineTwo,
		city: tempComponents.city || '',
		county: tempComponents.county || '',
		country: tempComponents.country || '',
		eircode: tempComponents.eircode || ''
	};
}
