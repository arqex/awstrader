import { donchianMidline } from "./squeezeMomentum";

describe('donchianMidline', () => {
	it('should return the correct value', () => {
		const highs = [3,4,6,3,4,7,6,5,4,3];
		const lows = [0,1,2,2,3,1,4,0,1,2];
		const candles = getFakeCandles(highs, lows);

		const actual = donchianMidline(candles, 3);
		expect(actual).toEqual([1.5, 2, 3, 3.5, 4, 4, 4, 3.5, 3, 2.5]);
	})
})


function getFakeCandles( highs, lows ){
	return highs.map( (h,i) => ([0,0,0,h,lows[i],0]));
}