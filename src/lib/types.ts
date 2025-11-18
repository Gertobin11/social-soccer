// definition of the point stored in postgis
type GeoJSONPoint = {
	type: 'Point';
	coordinates: [number, number]; // [longitude, latitude]
};

// the type returned from the raw query from prisma
type CoordinateWithGeoJSON = {
	id: number;
	location: GeoJSONPoint;
};

// the initial type from the coordinates query, with coordinates as a string
type DatabaseCoordinateResult = {
	id: number;
	location: string; // ST_AsGeoJSON() returns a string
};

// represents the data tye returned from a Google revere goecode look up
interface AddressComponent {
	long_name: string;
	short_name: string;
	types: string[];
}

// used for converting the geocode data into data that can be inserted to rhe database
interface StructuredAddress {
    lineOne: string;
    lineTwo: string;
    city: string;
    county: string;
    country: string;
    eircode: string;
}


type AddressFields = {
    addressID?: number;
    lineOne: string;
    lineTwo: string;
    city: string;
    county: string;
    country: string;
    eircode: string;
};