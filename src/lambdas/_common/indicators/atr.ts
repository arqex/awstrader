import { ArrayCandle } from "../../lambda.types";

export function atr(data: ArrayCandle[], period: number) {
	let result: number[] = [];
	let sum:number = 0;
	for(let i = 0; i<period; i++){
		sum += trueRange(data[i], data[i-1]);
		result.push( sum / (i+1) );
	}

	for( let i = period; i<data.length; i++ ){
		result.push(( 
			result[i-1] * (period-1) +
			trueRange(data[i],data[i-1])
		) / period );
	}

	return result;
}


function trueRange(currentCandle, prevCandle?) {
	if( prevCandle ){
		return Math.max(prevCandle[2], currentCandle[3]) - Math.min(prevCandle[2], currentCandle[4]);
	}
	return currentCandle[3] - currentCandle[4];
}