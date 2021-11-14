import memoizeOne from "memoize-one";
import { ema, wma, sma, tma, rsi } from "@react-financial-charts/indicators";
import { Coords } from "../../../../lambdas/_common/botRunner/botRunPlotter";
import { topbot } from "../../../../lambdas/_common/indicators/topbot";
import { ArrayCandle } from "../../../../lambdas/lambda.types";


const indicatorFunctions: {[name:string]: Function} = { sma, ema, wma, tma, rsi, topbot };
export const colors = ['#ff0000', '#ffff00', '#00dd22', '#00ffff', '#0000ff', '#ff99cc'];
export interface ChartDataItem {
	0: number, // candle time
	1: number, // candle open
	2: number, // candle close
	3: number, // candle high
	4: number, // candle low
	5: number, // candle volume
	calculated: {
		[key: string]: any
	}
}

export interface ChartData {
	candle: ArrayCandle,
	calculated: {
		[key: string]: number
	}
}

export interface RunnableIndicator {
	key: string,
	type: string,
	args: any[],
	tooltip: string,
	color: string,
	func: Function
}

export interface DrawingIndices {startIndex: number | undefined, endIndex: number}; 


// Cache accessor to always pass the same object to the components
let cachedAccessors: {[key: string]: (d:ChartDataItem) => number} = {};

const attributeIndex: {[key:string]: number} = {
	time: 0,
	open: 1,
	close: 2,
	high: 3,
	low: 4,
	volume: 5
}

const chartUtils = {
	xAccessor(d: ChartDataItem){
		return d[0];
	},

	getYAccessor(key: string){
		if(cachedAccessors[key]) return cachedAccessors[key];

		if( attributeIndex[key] !== undefined ){
			let attr = attributeIndex[key]
			cachedAccessors[key] = function(d: ChartDataItem){
				// @ts-ignore number can actually index the ChartDataItem
				return d[attr];
			}
		}
		else {
			cachedAccessors[key] = function(d: ChartDataItem){
				return d.calculated[key];
			}
		}

		return cachedAccessors[key];
	},

	getRunnableIndicators: memoizeOne( (sources: string[] | undefined ) => {
		let indicators: RunnableIndicator[] = [];
		if( !sources ) return indicators;

		let i = 0;

		sources.forEach( (source:string) => {
			let [name, ...args] = source.split('|');
			if( ['sma', 'ema', 'wma', 'tma'].includes(name) ){
				indicators.push({
					key: source,
					type: name,
					args: args,
					tooltip: 'ma',
					color: colors[i++],
					func: indicatorFunctions[name]()
						.options({ windowSize: parseInt(args[0])})
						.merge( getMerger(source) )
						.accessor((data:any) => {
							return data.calculated[source];
						})
				});
			}
			else if(name === 'vma') {
				indicators.push({
					key: source,
					type: name,
					args,
					tooltip: 'ma',
					color: colors[i++],
					func: indicatorFunctions.ema()
						.options({windowSize: parseInt(args[0]), sourcePath: 'volume'})
						.merge( getMerger(source)  )
						.accessor((data:any) => data.calculated[source])
				})
			}
			else if(name === 'rsi' ){
				indicators.push({
					key: source,
					type: name,
					args,
					tooltip: 'rsi',
					color: colors[i++],
					func: indicatorFunctions.rsi()
						.options({windowSize: parseInt(args[0])})
						.merge( getMerger(source)  )
						.accessor((data:any) => data.calculated[source])
				})
			}
			else {
				console.warn(`Unknown indicator ${name}`)
			}
		});

		return indicators;
	}),

	candleAccessor(item: ChartDataItem){
		return {
			open: item[1],
			close: item[2],
			high: item[3],
			low: item[4]
		}
	},

	getFormat( quantity: number ){
		if( quantity > 9999 ){
			return ',.0f'
		}
		if( quantity > 99 ){
			return ',.2f'
		}
		if( quantity > 0 ){
			return '.4f'
		}
		return '.7f'
	},
	getDrawingIndices( points: Coords[], dataStart: number, dataEnd: number ): DrawingIndices {
		const length = points.length;
		let startIndex, endIndex;

		// If we are out of range just return undefined
		if( points[0].x > dataEnd || points[length-1].x < dataStart ){
			return {startIndex, endIndex: 0};
		}
		
		let before = 0; 
		let ahead = points.length-1;

		// Find the start index
		if( dataStart < points[0].x ){
			startIndex = 0;
		}
		else {
			//  binary search
			while (startIndex === undefined && before<ahead ){
				// Find the mid index
				let mid = Math.floor((before + ahead)/2);
				let x = points[mid].x;
				if( x === dataStart ){
					startIndex = mid;
				}
				else if( x < dataStart && points[mid+1].x > dataStart ){
					startIndex = mid+1;
				}
				else if( x < dataStart ){
					before = mid+1;
				}
				else {
					ahead = mid;
				}
			}
		}

		if( dataEnd > points[length-1].x ){
			endIndex = length - 1;
		}
		else {
			// @ts-ignore
			before = startIndex;
			ahead = points.length - 1;

			while( endIndex === undefined && before<ahead ){
				// Find the mid index
				let mid = Math.floor((before + ahead)/2);
				let x = points[mid].x;
				if( x === dataEnd ){
					endIndex = mid;
				}
				else if( x < dataEnd && points[mid+1].x > dataEnd ){
					endIndex = mid+1;
				}
				else if( x < dataEnd ){
					before = mid+1;
				}
				else {
					ahead = mid;
				}
			}
		}

		// @ts-ignore
		return {startIndex, endIndex};
	}
}



// Check if calculated is defined before setting the key
function getMerger( key: string ) {
	return function( data: ChartDataItem, value: number ){
		data.calculated[key] = value;
	}
}

export default chartUtils;