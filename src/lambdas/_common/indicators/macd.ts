import { ArrayCandle, CandleAttribute } from "../../lambda.types";
import { ema, emaArray } from "./ema";

interface MACDOptions {
	quickLength?: number,
	slowLength?: number,
	attr?: CandleAttribute,
	signalSmoothing?: number
}

const defaultOptions = {
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

	let quickEma = ema(data, quickLength, attr);
	let slowEma = ema(data, slowLength, attr);

	let macdData = quickEma.map( (quick, i) => (
		quick - slowEma[i]
	));

	let signal = emaArray( macdData, signalSmoothing );

	return macdData.map( (m,i) => ({
		macd: m,
		signal: i < signalSmoothing ? 0 : signal[i-signalSmoothing]
	}));
}

const attributeIndex = {
	open: 1,
	close: 2,
	high: 3,
	low: 4,
	volume: 5
}