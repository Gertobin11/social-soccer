import { buildMapCard, createMarkers, getAverageRating, getLevelColour } from '$lib/client/games';
import type { MapGameData } from '$lib/server/game';
import type { Rating } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockAdvancedMarkerElement = class {
        position: any;
        map: any;
        title: any;
        style = {};
        constructor(options: any) {
            this.position = options.position;
            this.map = options.map;
            this.title = options.title;
        }
        append = vi.fn();
        addListener = vi.fn();
    };

    const mockPinElement = class {
        constructor() {}
    };

vi.mock('@googlemaps/js-api-loader', () => ({
    importLibrary: vi.fn()
}));

describe('getAverageRating', () => {
	it('should return the correct average for multiple ratings', () => {
		const ratings = [{ rating: 5 }, { rating: 3 }, { rating: 4 }] as unknown as Rating[];
		const result = getAverageRating(ratings);

		expect(result).toBe(4);
	});

	it('should return undefined if the ratings array is empty', () => {
		const ratings = [] as unknown as Rating[];
		const result = getAverageRating(ratings);

		expect(result).toBeUndefined();
	});

	it('should handle floating point results', () => {
		const ratings = [{ rating: 5 }, { rating: 4 }] as unknown as Rating[];
		const result = getAverageRating(ratings);

		expect(result).toBe(4.5);
	});
});

describe("buildMapCard", () => {
    const mockGameData = {
        level: 'INTERMEDITE',
        day: 'Monday',
        time: '18:00',
        currentPlayerNumbers: 4,
        numberOfPlayers: 10,
        coordinates: { location: { coordinates: [0, 0] } }
    } as unknown as MapGameData;

    it("should display 'Register To View Details' when loggedIn is false", () => {
        const result = buildMapCard(mockGameData, false, '/game/view/123');

        expect(result).toContain('Register To View Details');
        expect(result).toContain('/auth/register');
        expect(result).not.toContain('View Game Details');
    });

    it("should display 'View Game Details' and the correct URL when loggedIn is true", () => {
        const viewUrl = '/game/view/123';
        const result = buildMapCard(mockGameData, true, viewUrl);

        expect(result).toContain('View Game Details');
        expect(result).toContain(viewUrl);
    });

    it("should render the correct game statistics", () => {
        const result = buildMapCard(mockGameData, true, '/');
        
        expect(result).toContain('INTERMEDITE');
        expect(result).toContain('Monday');
        expect(result).toContain('18:00'); 
        expect(result).toContain('4');
        expect(result).toContain('10');
    });
});

describe("createMarkers", () => {
    const mockAdvancedMarkerElement = class {
        position: any;
        map: any;
        title: any;
        style = {};
        constructor(options: any) {
            this.position = options.position;
            this.map = options.map;
            this.title = options.title;
        }
        append = vi.fn();
        addListener = vi.fn();
    };

    const mockPinElement = class {
        constructor() {}
    };

    beforeEach(async () => {
        const googleLoader = await import('@googlemaps/js-api-loader');

        // @ts-ignore - as import library is now being mocked
        googleLoader.importLibrary.mockResolvedValue({
            AdvancedMarkerElement: mockAdvancedMarkerElement,
            PinElement: mockPinElement
        });
    });

    it("should create markers for each game in the data", async () => {
        const currentGameData = [
            { 
                id: '1', 
                level: 'BEGINNER', 
                coordinates: { location: { coordinates: [-8.47, 51.89] } }
            },
            { 
                id: '2', 
                level: 'ADVANCED', 
                coordinates: { location: { coordinates: [-6.26, 53.34] } } 
            }
        ] as unknown as MapGameData[];

        const mockMap = {} as google.maps.Map;
        const mockInfoWindow = {} as google.maps.InfoWindow;

        const result = await createMarkers(currentGameData, mockMap, mockInfoWindow, true);

        if(result.length < 1 || !result[0].position) {
            throw new Error("No result return with position")
        }

        expect(result).toHaveLength(2);
        
        expect(result[0].position.lat).toBe(51.89); 
        expect(result[0].position.lng).toBe(-8.47);
        expect(result[0].title).toBe('BEGINNER');

        expect(result[0]).toBeInstanceOf(mockAdvancedMarkerElement);
    });
});

describe("getLevelColour", () => {
    it("should return green for BEGINNER", () => {
        expect(getLevelColour('BEGINNER')).toBe('green');
    });

    it("should return blue for RECREATIONAL", () => {
        expect(getLevelColour('RECREATIONAL')).toBe('blue');
    });

    it("should return orange for INTERMEDITE", () => {
        expect(getLevelColour('INTERMEDITE')).toBe('orange');
    });

    it("should return red for COMPETITIVE", () => {
        expect(getLevelColour('COMPETITIVE')).toBe('red');
    });

    it("should return black for ADVANCED", () => {
        expect(getLevelColour('ADVANCED')).toBe('black');
    });

    it("should return green as a default for unknown levels", () => {
        // @ts-ignore - testing default for edge cases
        expect(getLevelColour('UNKNOWN_LEVEL')).toBe('green');
    });
});