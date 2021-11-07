import {adx} from './adx';

describe('adx', () => {
	it('should return the correct adx', () => {
		// @ts-ignore
		const actual = adx(testSet, 14);
		expect(testSet.length).toBe(actual.length);
		expect(actual.slice(27)).toEqual(result);
	})
	
});

const testSet = [[0,0,29.87,30.2,29.41],[0,0,30.24,30.28,29.32],[0,0,30.1,30.45,29.96],[0,0,28.9,29.35,28.74],[0,0,28.92,29.35,28.56],[0,0,28.48,29.29,28.41],[0,0,28.56,28.83,28.08],[0,0,27.56,28.73,27.43],[0,0,28.47,28.67,27.66],[0,0,28.28,28.85,27.83],[0,0,27.49,28.64,27.4],[0,0,27.23,27.68,27.09],[0,0,26.35,27.21,26.18],[0,0,26.33,26.87,26.13],[0,0,27.03,27.41,26.63],[0,0,26.22,26.94,26.13],[0,0,26.01,26.52,25.43],[0,0,25.46,26.52,25.35],[0,0,27.03,27.09,25.88],[0,0,27.45,27.69,26.96],[0,0,28.36,28.45,27.14],[0,0,28.43,28.53,28.01],[0,0,27.95,28.67,27.88],[0,0,29.01,29.01,27.99],[0,0,29.38,29.87,28.76],[0,0,29.36,29.8,29.14],[0,0,28.91,29.75,28.71],[0,0,30.61,30.65,28.93],[0,0,30.05,30.6,30.03],[0,0,30.19,30.76,29.39],[0,0,31.12,31.17,30.14],[0,0,30.54,30.89,30.43]];
const result = [ 
	{ positiveDI: 23.718186893672044,
		negativeDI: 18.116192555042613,
		adx: 33.70788849599704 },
	{ positiveDI: 22.72940203198124,
		negativeDI: 17.360948613749574,
		adx: 32.25667407943681 },
	{ positiveDI: 20.550126792049152,
		negativeDI: 20.175420948220747,
		adx: 30.01834561944435 },
	{ positiveDI: 21.93725089630091,
		negativeDI: 18.72204272969499,
		adx: 28.439012595686165 },
	{ positiveDI: 20.85349506942225,
		negativeDI: 17.79712633997546,
		adx: 26.972489073624992 }
]