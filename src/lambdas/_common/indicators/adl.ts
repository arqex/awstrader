// accumulation distribution line 

import { ArrayCandle } from "../../lambda.types";

export function adl( data: ArrayCandle[] ){
	// first candle
	let results: number[] = [
		getMFV(data[0])
	];

	for( let i = 1; i < data.length; i++ ){
		results.push( results[i-1] + getMFV(data[i]) );
	}

	return results;
}

// money flow volume
function getMFV( c: ArrayCandle ){
	return (((c[2] - c[4]) - (c[3] - c[2] )) / (c[3] - c[4])) * c[5];
}