import { atr } from "./atr";

describe('atr', () => {
	it('calculate atr from candles', () => {
		// @ts-ignore
		const result = atr(testCandles, 14);
		
		
		expect( result.length ).toBe( testCandles.length );
		expect( truncate(result[13]) ).toBe('0.554');
		expect( truncate(result[14]) ).toBe('0.593');
		expect( truncate(result[15]) ).toBe('0.585');
		expect( truncate(result[16]) ).toBe('0.568');
		expect( truncate(result[17]) ).toBe('0.614');
		expect( truncate(result[18]) ).toBe('0.617');
		expect( truncate(result[19]) ).toBe('0.641');
		expect( truncate(result[20]) ).toBe('0.673');
		expect( truncate(result[21]) ).toBe('0.692');
		expect( truncate(result[22]) ).toBe('0.774');
		expect( truncate(result[23]) ).toBe('0.78');
		expect( truncate(result[24]) ).toBe('1.208');
	})
})


const testCandles = [[0,0,48.16,48.7,47.79],[0,0,48.61,48.72,48.14],[0,0,48.75,48.9,48.39],[0,0,48.63,48.87,48.37],[0,0,48.74,48.82,48.24],[0,0,49.03,49.05,48.64],[0,0,49.07,49.2,48.94],[0,0,49.32,49.35,48.86],[0,0,49.91,49.92,49.5],[0,0,50.13,50.19,49.87],[0,0,49.53,50.12,49.2],[0,0,49.5,49.66,48.9],[0,0,49.75,49.88,49.43],[0,0,50.03,50.19,49.73],[0,0,50.31,50.36,49.26],[0,0,50.52,50.57,50.09],[0,0,50.41,50.65,50.3],[0,0,49.34,50.43,49.21],[0,0,49.37,49.63,48.98],[0,0,50.23,50.33,49.61],[0,0,49.24,50.29,49.2],[0,0,49.93,50.17,49.43],[0,0,48.43,49.32,48.08],[0,0,48.18,48.5,47.64],[0,0,46.57,48.32,41.55],[0,0,45.41,46.8,44.28],[0,0,47.77,47.8,47.31],[0,0,47.72,48.39,47.2],[0,0,48.62,48.66,47.9],[0,0,47.85,48.79,47.73]];
function truncate( n: number) {
	return (Math.floor(n * 1000) / 1000).toString();
}