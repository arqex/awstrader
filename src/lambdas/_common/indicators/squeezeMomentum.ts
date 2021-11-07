import { ArrayCandle } from "../../lambda.types";
import { bollinger } from "./bollinger";
import { keltner } from "./keltner";

interface SqueezeMomentumOptions {
	bbLength: number
	bbFactor: number
	kcLength: number
	kcFactor: number
}

const defaultOptions: SqueezeMomentumOptions = {
	bbLength: 20,
	bbFactor: 2,
	kcLength: 20,
	kcFactor: 1.5
};

export function squeezeMomentum(data: ArrayCandle[], options: SqueezeMomentumOptions){
	const {bbLength, bbFactor, kcLength, kcFactor} = {
		...defaultOptions,
		...(options || {} )
	};

	const bollingerData = bollinger(data, {period: bbLength, stdDev: bbFactor} )
	const keltnerData = keltner(data, {maPeriod: kcLength, atrPeriod: kcLength, bandMultiplier: kcFactor});

	let results = [];
	bollingerData.forEach( (bb, i) => {
		let kc = keltnerData[i];
		let squeezing = bb.lower <= kc.lower || bb.upper >= kc.upper;

	})
}

export function donchianMidline( data: ArrayCandle[], period: number): number[] {
	let max = -Infinity;
	let min = +Infinity;
	let maxIndex = -1;
	let minIndex = -1;
	
	let results: number[] = [];
	data.forEach( (candle,i) => {
		let nextIndex = i + 1;
		//Max
		if( candle[3] > max ){
			max = candle[3];
			maxIndex = i; 
		}

		// The max is out of the window
		if( maxIndex < nextIndex - period){
			let {localMax, localIndex} = getLocalMax( data.slice(nextIndex-period, nextIndex) );
			max = localMax;
			maxIndex = nextIndex - period + localIndex;
		}

		// Min
		if( candle[4] < min ){
			min = candle[4]
			minIndex = i;
		}

		// The min is out of the window
		if( minIndex < nextIndex - period ){
			let {localMin, localIndex} = getLocalMin( data.slice(nextIndex-period, nextIndex) );
			min = localMin;
			minIndex = nextIndex - period + localIndex;
		}
		
		results.push((max+min)/2);
	});

	return results;
}

function getLocalMax( candles: ArrayCandle[] ){
	let localMax = -Infinity;
	let localIndex = -1;
	
	candles.forEach( (c,i) => {
		if( c[3] > localMax ){
			localMax = c[3];
			localIndex = i;
		}
	});

	return {localMax, localIndex};
}
	
function getLocalMin( candles: ArrayCandle[] ){
	let localMin = Infinity;
	let localIndex = -1;
	
	candles.forEach( (c,i) => {
		if( c[4] < localMin ){
			localMin = c[4];
			localIndex = i;
		}
	});

	return {localMin, localIndex};
}

