// Not working reliable yet see tests

import { ArrayCandle } from "../../lambda.types";
import { windowedLinearRegresion } from "../utils/linearRegresion";
import { bollinger } from "./bollinger";
import { keltner } from "./keltner";
import { sma } from "./sma";

interface SqueezeMomentumOptions {
	bbLength?: number
	bbFactor?: number
	kcLength?: number
	kcFactor?: number
}

const defaultOptions: SqueezeMomentumOptions = {
	bbLength: 20,
	bbFactor: 2,
	kcLength: 20,
	kcFactor: 1.5
};

export function squeezeMomentum(data: ArrayCandle[], options: SqueezeMomentumOptions = defaultOptions){
	const {bbLength, bbFactor, kcLength, kcFactor} = {
		...defaultOptions,
		...(options || {} )
	};

	if( !bbLength ){
		throw new Error('No bbLength initialized');
	} 

	if( data.length < bbLength ){
		throw new Error('Data length is smaller than the period');
	}
	const bollingerData = bollinger(data, {period: bbLength, stdDev: bbFactor} );
	const smaData = sma(data, bbLength, 'close');
	const keltnerData = keltner(data, {maPeriod: kcLength, atrPeriod: kcLength, bandMultiplier: kcFactor});
	const midline = donchianMidline(data, bbLength);
	
	let squeeze: boolean[] = [];
	let delta: number[] = [];

	bollingerData.forEach( (bb, i) => {
		let kc = keltnerData[i];
		squeeze.push(bb.lower <= kc.lower || bb.upper >= kc.upper);
		
		if( bb.middle ){
			delta.push( data[i][3] - ((midline[i] + smaData[i])/ 2) );
		}
	});

	const momentum = windowedLinearRegresion(delta, bbLength);
	return squeeze.map((sq, i) => ({
		squeeze: sq,
		momentum: momentum[i - bbLength] || 0
	}));
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

