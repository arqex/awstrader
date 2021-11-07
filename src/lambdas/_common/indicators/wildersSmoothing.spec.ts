import { wildersSmoothing } from "./wildersSmoothing";

describe('wildersSmoothing', () => {
	it('should return the smoothed values', () => {
		let actual = wildersSmoothing(testInput, 14).slice(13);
		expect(actual).toEqual(expectedResult);
	})
})
const testInput = [
	0.959399999999999,
	0.4847,
	1.3553,
	0.7911,
	0.880499999999998,
	0.7516,
	1.3057,
	1.1078,
	1.0187,
	1.2364,
	0.583400000000001,
	1.0484,
	0.731900000000003,
	1.0781,
	0.900100000000002,
	1.0882,
	1.1671,
	1.6322,
	0.722000000000001
];

const expectedResult = [
	13.333000000000002,
	13.280742857142862,
	13.420318367346944,
	13.628824198250733,
	14.287536755518538,
	13.988998415838644,
];