import { ArrayCandle } from "../../lambda.types";
import { atr, trueRange } from "./atr";
import { wildersSmoothing, wildersSmoothing2 } from "./wildersSmoothing";

export function adx(data: ArrayCandle[], period){
	let {positiveDx, negativeDx} = calculateDx(data);
	let tr = data.map( (candle,i) => trueRange(candle, data[i-1]));

	// console.log('positiveDX', positiveDx);

	let smoothPositiveDx = [0, ...wildersSmoothing(positiveDx.slice(1), period)];
	let smoothNegativeDx = [0, ...wildersSmoothing(negativeDx.slice(1), period)];
	let atrData = [0, ...wildersSmoothing(tr.slice(1), period)];

	// console.log( 'ATR', atrData);
	const results: any = [
		{positiveDI: 0, negativeDI: 0, adx: 0}
	];

	// console.log( smoothPositiveDx, positiveDx);
	const dx: number[] = [];
	atrData.forEach( (atr, i) => {
		if( i === 0 ) return;
		let positiveDI = smoothPositiveDx[i]/atr*100;
		let negativeDI = smoothNegativeDx[i]/atr*100;
		if( i >= period ){
			dx.push( Math.abs( positiveDI - negativeDI ) / (positiveDI + negativeDI) * 100 );
		}
		results.push({positiveDI,negativeDI,adx: 0});
	});

	//console.log('DX', dx);
	let adxData = wildersSmoothing2(dx, period);
	//console.log( 'adx', adxData );
	for(let i = (period * 2) - 1; i < results.length; i++){
		results[i].adx = adxData[i - (period*2) + 1];
	}
	
	return results;
}

function calculateDx(data){
	let p_dx = [0];
	let n_dx = [0];
	data.forEach( (c,i) => {
		if( i === 0 ) return;

		let h_pl = c[3] - data[i-1][3];
		let pl_l = data[i-1][4] - c[4];
		if( h_pl < 0 && pl_l < 0 ){
			p_dx.push(0);
			n_dx.push(0);
		}
		else if( h_pl > pl_l ){
			p_dx.push( h_pl );
			n_dx.push(0);
		}
		else {
			p_dx.push(0);
			n_dx.push(pl_l);
		}
	});
	return {positiveDx: p_dx, negativeDx: n_dx};
}