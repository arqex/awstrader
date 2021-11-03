import { ArrayCandle, CandleAttribute } from "../../lambda.types";
import { sma } from "./sma";

const attributeIndex = {
	open: 1,
	close: 2,
	high: 3,
	low: 4,
	volume: 5
}

export function ema(data: ArrayCandle[], period: number, attr: CandleAttribute = 'close') {
	return calculateEMA(data, (c:ArrayCandle) => c[attributeIndex[attr]], period);
}

export function emaArray(data: number[], period: number){
	return calculateEMA(data, (v:number) => v, period);
}

function calculateEMA(data: any, accessor: any, period: number ){
	const results = sma( data.slice(0,period), period );
	const exponent = (2/(period+1));
	for(let i = period; i < data.length; i++){
		results.push(
			accessor(data[i]) * exponent +
			results[i-1] * ( 1 - exponent )
		)
	}
	return results;
}