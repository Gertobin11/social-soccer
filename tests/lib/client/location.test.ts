import { parseGeocodeAddress } from "$lib/client/location";
import { describe, expect, it } from "vitest";

describe("parseGeocodeAddress", () => {
    it("should correctly map address components to the structured address format", () => {
        const mockComponents = [
            { types: ['street_number'], long_name: '12' },
            { types: ['route'], long_name: 'High Street' },
            { types: ['locality'], long_name: 'Cork City' },
            { types: ['administrative_area_level_1'], long_name: 'Cork' },
            { types: ['country'], long_name: 'Ireland' },
            { types: ['postal_code'], long_name: 'T12 XY34' }
        ] as unknown as AddressComponent[]

        const result = parseGeocodeAddress(mockComponents);

        expect(result).toStrictEqual({
            lineOne: '12 High Street',
            lineTwo: '',
            city: 'Cork City',
            county: 'Cork',
            country: 'Ireland',
            eircode: 'T12 XY34'
        });
    });

    it("should combine premise and neighborhood into lineTwo", () => {
        const mockComponents = [
            { types: ['street_number'], long_name: '1' },
            { types: ['route'], long_name: 'Main St' },
            { types: ['premise'], long_name: 'Apt 4' },
            { types: ['neighborhood'], long_name: 'Historic District' }
        ] as unknown as AddressComponent[]

        const result = parseGeocodeAddress(mockComponents);

        expect(result.lineOne).toBe('1 Main St');
        expect(result.lineTwo.trim()).toBe('Apt 4 Historic District');
    });

    it("should handle missing components gracefully", () => {
        const mockComponents = [
            { types: ['country'], long_name: 'Ireland' }
        ] as unknown as AddressComponent[]

        const result = parseGeocodeAddress(mockComponents);

        expect(result).toStrictEqual({
            lineOne: '',
            lineTwo: '',
            city: '',
            county: '',
            country: 'Ireland',
            eircode: ''
        });
    });
});