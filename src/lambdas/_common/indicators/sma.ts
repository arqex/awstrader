import { ArrayCandle, CandleAttribute } from "../../lambda.types";

const attributeIndex = {
	open: 1,
	close: 2,
	high: 3,
	low: 4,
	volume: 5
}

export function sma(data: ArrayCandle[], period: number, attr: CandleAttribute = 'close') {
	return calculateSMA(data, (candle:ArrayCandle) => candle[attributeIndex[attr]], period );
}

export function smaArray( data: number[], period: number ){
	return calculateSMA( data, (value:number) => value, period );
}

export function calculateSMA( data: any, accessor: any, period: number ){
	let sum = 0;
	let length = data.length;
	let values = new Array<number>(length);

	for( let i = 0; i<period; i++ ){
		sum += accessor(data[i]);
		values[i] = 0;
	}

  values[period-1] = sum / period;

	for( let i = period; i<length; i++){
		sum += accessor(data[i]) - accessor(data[i-period]);
		values[i] = sum / period;
	}

	return values;
}