// This script will parse data from csv exported by trading view charts
// this way we can test out our indicators to be close to the ones given by trading view

const fs = require('fs');

const file = fs.readFileSync('./KRAKEN_XBTUSDEMACD.csv', 'utf-8');

const [keys, ...lines] = file.split('\n');

const indexes = keys.split(',');
const candleIndexes = {};
const indicatorIndexes = {};
indexes.forEach( (key, i) => {
	if( ['time', 'open', 'high', 'low', 'close', 'Volume'].includes(key) ){
		candleIndexes[key] = i;
	}
	else {
		indicatorIndexes[key] = i;
	}
})

console.log( candleIndexes, indicatorIndexes);

let candles = [];
let indicators = [];

lines.forEach( line => {
	let values = line.split(',');
	
	candles.push([
		parseFloat(values[candleIndexes.time]), parseFloat(values[candleIndexes.open]), parseFloat(values[candleIndexes.close]), parseFloat(values[candleIndexes.high]), parseFloat(values[candleIndexes.low]), parseFloat(values[candleIndexes.Volume])
	]);

	let ind = {};
	Object.keys( indicatorIndexes ).forEach( key => {
		// console.log(key, indicatorIndexes[key], values);
		ind[key] = parseFloat(values[indicatorIndexes[key]]);
	});
	indicators.push(ind);
})

// console.log( indicators.slice(-60).map( i => ({macd: i.MACD, signal: i.Signal} )));
// console.log( candles.slice(-60) );

// console.log( indicators.slice(-30) );

console.log( indicators.slice(-100).map(i => i.EMA26) );
// console.log( candles.slice(-100) );
//console.log( indicators.slice(-100).map(i => i.MA) );
// console.log( candles.slice(-100) );
