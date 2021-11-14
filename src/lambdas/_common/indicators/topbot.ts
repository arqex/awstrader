import { ArrayCandle } from "../../lambda.types";

export function topbot(data: ArrayCandle[]){
	let tops = [0];
	let bottoms = [0];

	for(let i = 2; i<data.length; i++){
		let current = data[i];
		let prev = data[i-1];
		let pprev = data[i-2];

		if( prev[3] > current[3] && prev[3] > pprev[3] ){
			let value = Math.max(pprev[3], getTop(prev));
			tops.push( value );
			bottoms.push(0);
		}
		else if( prev[4] < current[4] && prev[4] < pprev[4] ){
			let value = Math.min(pprev[4], getBottom(prev));
			bottoms.push( value );
			tops.push(0);
		}
		else {
			tops.push(0);
			bottoms.push(0);
		}
	}

	removeDoubles( tops, bottoms );

	// console.log( 'Before cleaning noise', tops.map( (t,i) => [t, bottoms[i]]) );
	removeNoise( tops, bottoms, getNoiseThreshold(tops, bottoms) );

	// console.log( 'After cleaning noise', tops.map( (t,i) => [t, bottoms[i]]) );
	// console.log( 'Returning tops and bottoms')
	return {tops, bottoms};
}


function getTop( prev ){
	// (high + max(open,close)) / 2
	return (prev[3] + prev[ prev[1] > prev[2] ? 1 : 2]) / 2;
}

function getBottom( prev ){
	// (low + min(open,close)) / 2
	return (prev[4] + prev[ prev[1] > prev[2] ? 2 : 1]) / 2;
}


// Cleans consecutive tops/bottoms
// Cleans shakes (consecutive top,bottom,top or bottom,top,bottom )
function removeDoubles( tops, bottoms ){
	let lastAngleType = '';
	let lastAngleValue = 0;
	let lastAngleIndex = 0;
	
	tops.forEach( (top, i) => {
		if( top ){
			if( lastAngleType === 't' ){
				// console.log('Replacing a top', lastAngleIndex);
				if( lastAngleValue > top ){
					tops[i] = 0;
				}
				else {
					tops[lastAngleIndex] = 0;
					lastAngleIndex = i;
					lastAngleValue = top;
				}
			}
			else {
				lastAngleIndex = i;
				lastAngleValue = top;
			}
			lastAngleType = 't'
		}
		if( bottoms[i] ){
			if( lastAngleType === 'b') {
				// console.log('Replacing a bottom', lastAngleIndex, lastAngleValue, bottoms);
				if( lastAngleValue < bottoms[i] ){
					bottoms[i] = 0;
				}
				else {
					bottoms[lastAngleIndex] = 0;
					lastAngleIndex = i;
					lastAngleValue = bottoms[i];
				}
			}
			else {
				lastAngleIndex = i;
				lastAngleValue = bottoms[i];
			}
			lastAngleType = 'b';
		}
	});
}

function getNoiseThreshold( tops: number[], bottoms: number[] ){
	let lastValue = 0;
	let variations: number[] = [];
	let sum = 0;

	tops.forEach( (top,i) => {
		if( top ){
			if( !lastValue )
				return (lastValue = top);
			let v = top/lastValue;
			sum += v;
			variations.push( v );
			lastValue = top;
		}
		else if( bottoms[i] ){
			if( !lastValue )
				return (lastValue = bottoms[i]);
			let v = lastValue/bottoms[i];
			sum += v;
			variations.push( v );
			lastValue = bottoms[i];
		}
	});

	let avg = sum / variations.length;
	let sdSum = 0;
	variations.forEach( v => {
		sdSum += Math.pow(v - avg, 2);
	});
	let sd = Math.sqrt( sdSum / variations.length );
	return avg - sd;
} 

function removeNoise( tops, bottoms, threshold ){
	let i = tops.length;
	let lastValueIndex = 0;
	while( i-- > 0 ){
		if( tops[i] ){
			if( lastValueIndex ){
				if( tops[i] / bottoms[lastValueIndex] < threshold ){
					bottoms[lastValueIndex] = 0;
				}
			}
			lastValueIndex = i;
		}
		else if( bottoms[i] ){
			if( lastValueIndex ){
				if( tops[lastValueIndex] / bottoms[i] < threshold ){
					tops[lastValueIndex] = 0;
				}
			}
			lastValueIndex = i;
		}
	}

	return removeDoubles(tops, bottoms);
}