import { ema } from "./ema";

describe('ema', () => {
	it('calculate ema from array of candles', () => {
		const candles = [[0,0,1],[0,0,3],[0,0,4],[0,0,5],[0,0,6],[0,0,7],[0,0,8],[0,0,9],[0,0,10],[0,0,11],[0,0,12],[0,0,13],[0,0,14],[0,0,15]];
		// @ts-ignore
		const result = ema(candles, 8);

		expect( result.slice(0, 7) ).toEqual([0,0,0,0,0,0,0]);
		expect( result.length ).toBe(candles.length);
		
		
		expect( truncate(result[7]) ).toBe('5.375');
		expect( truncate(result[8]) ).toBe('6.402');
		expect( truncate(result[9]) ).toBe('7.424');
		expect( truncate(result[10]) ).toBe('8.441');
		expect( truncate(result[11]) ).toBe('9.454');
		expect( truncate(result[12]) ).toBe('10.464');
		expect( truncate(result[13]) ).toBe('11.472');
	})
})

function truncate( n: number) {
	return (Math.floor(n * 1000) / 1000).toString();
}