import { ArrayCandle, CandleAttribute } from "../../lambda.types";
import { ema, emaArray } from "./ema";

interface MACDOptions {
	quickLength?: number,
	slowLength?: number,
	attr?: CandleAttribute,
	signalSmoothing?: number
}

const defaultOptions: MACDOptions = {
	quickLength: 12,
	slowLength: 26,
	attr: 'close',
	signalSmoothing: 9
}

export function macd( data: ArrayCandle[], options?: MACDOptions ){
	let {quickLength, slowLength, attr, signalSmoothing} = {
		...defaultOptions,
		...(options || {})
	};

	if( !attr || !quickLength || !slowLength || !signalSmoothing ) return;

	let quickEma = ema(data, quickLength, attr);
	let slowEma = ema(data, slowLength, attr);

	// console.log( quickEma.length, slowEma.length );
	let macdData = slowEma.map( (slow, i) => {
		if( slow ){
			return quickEma[i] - slow;
		}
		return 0;
	});

	let signal = emaArray( macdData.slice( slowLength ), signalSmoothing );
	console.log( 'SLOW', slowEma );

	return macdData.map( (m,i) => ({
		macd: m,
		// @ts-ignore
		signal: signal[i-slowLength] || 0
	}));
}

const attributeIndex = {
	open: 1,
	close: 2,
	high: 3,
	low: 4,
	volume: 5
}