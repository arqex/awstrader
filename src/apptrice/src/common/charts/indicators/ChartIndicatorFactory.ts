import memoizeOne from 'memoize-one';
import { ChartIndicator } from './ChartIndicator';
import { EmaChartIndicator } from './EmaChartIndicator'
import { SmaChartIndicator } from './SmaChartIndicator';
import { TopbotChartIndicator } from './TopbotChartIndicator';

const indicatorsMethods: {[key: string]: (args: string[]) => ChartIndicator} = {
    ema: function(args: string[]){
        return new EmaChartIndicator(args);
    },
    sma: function(args: string[]){
        return new SmaChartIndicator(args);
    },
    topbot: function(args: string[]){
        return new TopbotChartIndicator(args)
    }
}

export const ChartIndicatorFactory = {
    createChartIndicator(type: string, args: string[]): ChartIndicator {
        let indicator: any = indicatorsMethods[type];
        if( !indicator ){
            throw Error(`Unknown indicator ${type}`);
        }
        return indicator(args);
    }
}


export function getChartIndicators(chartId: string, sources: string[] = [] ){
    let indicators: ChartIndicator[] = [];
	if( !sources ) return indicators;

    // ChartId is only used to memoize indicators for the same chart
    return memoChartIndicators( chartId, JSON.stringify(sources) );
}


// chartId it's only for memoization
const memoChartIndicators = memoizeOne( (chartId: string, sourcesStr: string) => {
	let indicators: ChartIndicator[] = [];
	let sources: string[] = JSON.parse(sourcesStr);

	sources.forEach( s => {
		let [type, ...args] = s.split('|');
        indicators.push( ChartIndicatorFactory.createChartIndicator(type, args) );
	});

	return indicators;
})


