// This script will parse data from csv exported by trading view charts
// this way we can test out our indicators to be close to the ones given by trading view

const fs = require('fs');

const file = fs.readFileSync('./KRAKEN_XBTUSDRSI.csv', 'utf-8');

const [keys, ...lines] = file.split('\n');

const indexes = keys.split(',');

let candles = [];
let indicators = [];

lines.forEach( line => {
	let values = line.split(',');
	
	candles.push([
		parseFloat(values[0]), parseFloat(values[1]), parseFloat(values[4]), parseFloat(values[2]), parseFloat(values[3]), parseFloat(values[5])
	]);

	let ind = {};
	for( let i = 6; i < values.length; i++ ){
		ind[ indexes[i] ] = parseFloat(values[i]);
	}
	indicators.push(ind);
})


console.log( indicators.slice(-4));

console.log( indicators.slice(-60).map( i => i.RSI ));
console.log( candles.slice(-60) );
