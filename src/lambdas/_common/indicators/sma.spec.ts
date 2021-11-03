import { sma, smaArray } from "./sma";


describe('sma', () => {
	it('calculate sma from array of values', () => {
		const values = [1,2,3,4,5,6,7,8,9,10,11,12,13];
		expect( smaArray(values, 8) ).toEqual([0,0,0,0,0,0,0,4.5, 5.5, 6.5, 7.5, 8.5, 9.5]);
	});

	it('calculate sma from array of candles', () => {
		const candles = [[0,0,1],[0,0,2],[0,0,3],[0,0,4],[0,0,5],[0,0,6],[0,0,7],[0,0,8],[0,0,9],[0,0,10],[0,0,11],[0,0,12],[0,0,13]];
		// @ts-ignore
		expect( sma(candles, 8) ).toEqual([0,0,0,0,0,0,0,4.5, 5.5, 6.5, 7.5, 8.5, 9.5]);
	})
})