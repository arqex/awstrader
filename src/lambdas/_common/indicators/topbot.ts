import { ArrayCandle } from "../../lambda.types";

export interface TopbotChartOptions {
	candleGrouping: number
}


export function topbot(data: ArrayCandle[], options?: TopbotChartOptions){
	const {candleGrouping} = options || {candleGrouping: 1};
	const candles = candleGrouping > 1 ? groupCandles( data, candleGrouping ) : data;

	let tops = [0];
	let bottoms = [0];

	for(let i = 2; i<candles.length; i++){
		let current = candles[i];
		let prev = candles[i-1];
		let pprev = candles[i-2];

		// the prev candle need to be greater than pprev and current, or greater than pprev and equals than current but current is bearish
		if( (prev[3] > current[3] || (prev[3] === current[3] && current[2] < current[1])) && prev[3] > pprev[3] ){
			let value = Math.max(pprev[3], getTop(prev));
			tops.push( value );
			bottoms.push(0);
		}
		// the prev candle need to be smaller than pprev and current, or smaller than pprev and equals than current but current is bullish
		else if( (prev[4] < current[4] || (prev[4] === prev[3] && current[1] < current[2])) && prev[4] < pprev[4] ){
			let value = Math.min(pprev[4], getBottom(prev));
			bottoms.push( value );
			tops.push(0);
		}
		else {
			tops.push(0);
			bottoms.push(0);
		}
	}

	if( candleGrouping > 1 ){
		return locateGroupedTopbots(data, tops, bottoms, candleGrouping);
	}

	filterTops(tops);
	filterBottoms(bottoms);


	removeDoubles( tops, bottoms );

	// console.log( 'Before cleaning noise', tops.map( (t,i) => [t, bottoms[i]]) );
	// removeNoise( tops, bottoms, getNoiseThreshold(tops, bottoms) );

	// console.log( 'After cleaning noise', tops.map( (t,i) => [t, bottoms[i]]) );
	// console.log( 'Returning tops and bottoms')
	return {tops, bottoms};
}


function getTop( candle ){
	// (high + max(open,close)) / 2
	return (candle[3] + candle[ candle[1] > candle[2] ? 1 : 2]) / 2;
}

function getBottom( candle ){
	// (low + min(open,close)) / 2
	return (candle[4] + candle[ candle[1] > candle[2] ? 2 : 1]) / 2;
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
					// console.log(`1. Removing a top at ${top} keeping it at ${lastAngleValue}`);
					tops[i] = 0;
				}
				else {
					// console.log(`2. Removing a top at ${lastAngleValue} keeping it at ${top}`);
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
				if( lastAngleValue < bottoms[i] ){
					// console.log(`1. Removing a bottom at ${bottoms[i]} keeping it at ${lastAngleValue}`);
					bottoms[i] = 0;
				}
				else {
					// console.log(`2. Removing a bottom at ${lastAngleValue} keeping it at ${bottoms[i]}`);
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

function groupCandles( candles: ArrayCandle[], amount: number ){
	let grouped: ArrayCandle[] = [];
	let i = 0;
	while( i < candles.length ){
		grouped.push( groupCandle(candles, i, i+amount) );
		i += amount;
	}
	return grouped;
}

function groupCandle( candles: ArrayCandle[], startIndex, endIndex ): ArrayCandle {
	let low = Infinity;
	let high = -Infinity;
	let i = startIndex;
	let volume = 0;
	while( i < endIndex ){
		if( candles[i] ){
			if( candles[i][3] > high ){
				high = candles[i][3];
			}
			if( candles[i][4] < low ){
				low = candles[i][4];
			}
			volume += candles[i][5];
			i++;
		}
	}

	return [
		candles[startIndex][0], // time
		candles[startIndex][1], // open
		candles[endIndex-1][2], // close
		high,
		low,
		volume
	];
}

function locateGroupedTopbots( data: ArrayCandle[], tops, bottoms, groupSize ){
	let ungroupedTops: number[] = [];
	let ungroupedBottoms: number[] = [];

	tops.forEach( (top, i) => {
		if( top ){
			let j = i*groupSize;
			let max = -Infinity;
			let maxIndex = j;
			while( j < (i+1)*groupSize ){
				if( data[j] && data[j][3] > max ){
					max = data[j][3];
					maxIndex = j;
				}
				j++;
			}

			j = i*groupSize;
			while( j < (i+1)*groupSize ){
				if( j === maxIndex ){
					ungroupedTops.push( getTop(data[j]) )
				}
				else {
					ungroupedTops.push( 0 );
				}
				ungroupedBottoms.push( 0 );
				j++;
			}
		}
		else if( bottoms[i] ){
			let j = i*groupSize;
			let min = Infinity;
			let minIndex = j;
			while( j < (i+1)*groupSize ){
				if( data[j] && data[j][4] < min ){
					min = data[j][4];
					minIndex = j;
				}
				j++;
			}

			j = i*groupSize;
			while( j < (i+1)*groupSize ){
				if( j === minIndex ){
					ungroupedBottoms.push( getBottom(data[j]) )
				}
				else {
					ungroupedBottoms.push( 0 );
				}
				ungroupedTops.push( 0 );
				j++;
			}
		}
		else {
			let j = i*groupSize;
			while( j < (i+1)*groupSize ){
				ungroupedTops.push( 0 );
				ungroupedBottoms.push( 0 );
				j++;
			}
		}
	});

	return {
		tops: ungroupedTops,
		bottoms: ungroupedBottoms
	}
}


function filterTops( tops ){
	let prevValue = -Infinity;
	let prevIndex: number;

	tops.forEach( (top, i) => {
		if( top ){
			if( prevIndex === undefined ){
				prevIndex = i;
				prevValue = top
			}
			else {
				if( top > prevValue ){
					tops[prevIndex] = 0;
				}
				else {
					tops[i] = 0;
				}
				prevIndex = i;
				prevValue = top;
			}
		}
	})
}

function filterBottoms(bottoms: number[]){
	let prevValue = Infinity;
	let prevIndex: number;

	bottoms.forEach( (bottom, i) => {
		if( bottom ){
			if( prevIndex === undefined ){
				prevIndex = i;
				prevValue = bottom
			}
			else {
				if( bottom < prevValue ){
					bottoms[prevIndex] = 0;
				}
				else {
					bottoms[i] = 0;
				}
				prevIndex = i;
				prevValue = bottom;
			}
		}
	})

}