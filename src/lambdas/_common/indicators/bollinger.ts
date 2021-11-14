import { ArrayCandle, CandleAttribute } from "../../lambda.types";
import { smaArray } from "./sma";

interface BollingerBandsOptions {
	period?: number,
	stdDev?: number,
	valueAttribute?: CandleAttribute | 'hlc3' | 'hl2'
}

export function bollinger(data: ArrayCandle[], options?: BollingerBandsOptions ) {
	const {period, stdDev, valueAttribute} = {
		...{period: 20, stdDev: 2, valueAttribute: 'close'},
		...(options || {})
	};

	const values = data.map( getAccesor(valueAttribute) );
	const smaData = smaArray(values, period);
	const sd = calculateStandardDeviation( values, smaData, period );
	
	return smaData.map( (ma,i) => ({
		middle: ma,
		upper: ma + (stdDev * sd[i]),
		lower: ma - (stdDev * sd[i])
	}));
}


export function calculateStandardDeviation(prices: number[], smaData: number[], period: number ) {
	let result: number[] = [];

	smaData.forEach( (avg, i) => {
		if( !avg ) return result.push(avg);

		let sum = 0;
		for(let j = i - period + 1; j<=i; j++ ){
			sum += Math.pow( prices[j] - avg, 2 );
		}
		result.push( Math.sqrt( sum / period) );
	});

	return result;
}


const accessors = {
	open: (c:ArrayCandle) => c[1],
	close: (c:ArrayCandle) => c[2],
	high: (c:ArrayCandle) => c[3],
	low: (c:ArrayCandle) => c[4],
	volume: (c:ArrayCandle) => c[5],
	hlc3: (c:ArrayCandle) => (c[2] + c[3] + c[4]) / 3,
	hl2: (c:ArrayCandle) => (c[3], c[4]) / 2
}
function getAccesor(key: string): (c:ArrayCandle) => number {
	return accessors[key];
}