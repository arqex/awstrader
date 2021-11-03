import { ArrayCandle } from "../../lambda.types";
import { sma, smaArray } from "./sma";

interface BollingerBandsOptions {
	period: number,
	stdDev: number
}

export function bollinger(data: ArrayCandle[], options?: BollingerBandsOptions ) {
	const {period, stdDev} = {
		...{period: 20, stdDev: 2},
		...(options || {})
	};

	const typicalPrices = data.map( candle => (candle[2] + candle[3] + candle[4]) / 3);
	console.log('Typical', typicalPrices, typicalPrices.length);
	const smaData = smaArray(typicalPrices, period);
	const sd = calculateStandardDeviation( typicalPrices, smaData, period );
	
	return smaData.map( (ma,i) => ({
		middle: ma,
		upper: ma + (stdDev * sd[i]),
		lower: ma - (stdDev * sd[i])
	}));
}


export function calculateStandardDeviation(prices: number[], smaData: number[], period: number ) {
	let result: number[] = [];

	console.log('SMA', smaData);
	smaData.forEach( (avg, i) => {
		if( !avg ) return result.push(avg);

		let sum = 0;
		for(let j = i - period + 1; j<=i; j++ ){
			console.log(prices[j],avg);
			sum += Math.pow( prices[j] - avg, 2 );
			result.push( Math.sqrt( sum / period) );
		}
	});

	return result;
}