import { ArrayCandle } from "../../lambda.types";
import { bollinger } from "../indicators/bollinger";
import { ema } from "../indicators/ema";
import { keltner } from "../indicators/keltner";
import { sma, smaArray } from "../indicators/sma";
import { topbot, TopbotChartOptions } from "../indicators/topbot";


type CandleAttribute = 'open' | 'close' | 'high' | 'low' | 'volume';
export interface Indicators {
	/** Calculates the Standard Moving Average from an array of candle data. By default uses the `close` attribute. */
	sma( candleData: ArrayCandle[], period: number, attr?: CandleAttribute ): number[]
	/** Calculates the Standard Moving Average from an array of values. */
	smaArray( candleData: number[], period: number ): number[]
	/** Calculates the Standard Moving Average for candle volumes. */
	vma( candleData: ArrayCandle[], period: number ): number[]
	/** Calculates the Relative Strength Index for an array of candle data. */
	rsi( candleData: ArrayCandle[], period: number): number[]
	/** Calculates the Exponential moving average for an array of candle data. */
	ema( candleData: ArrayCandle[], period: number): number[]

	bollinger( candleData: ArrayCandle[] )
	keltner( candleData: ArrayCandle[] )
	topbot( candleData: ArrayCandle[], options?: TopbotChartOptions )
}


export class BotRunIndicators implements Indicators {
	// The used indicators will be automatically plotted in the charts
	indicatorsUsed: {[indicator:string]: boolean}

	constructor( indicators: string[] = [] ) {
		let used = {};
		indicators.forEach( (indicator: string) => used[indicator] = true );
		this.indicatorsUsed = used;
	}

	sma( candleData: ArrayCandle[], period: number, attr: CandleAttribute = 'close' ) {
		this.indicatorsUsed[`sma|${period}|${attr}`] = true;
		return sma(candleData, period, attr);
	}

	vma( candleData: ArrayCandle[], period: number ) {
		this.indicatorsUsed[`vma|${period}`] = true;
		return sma(candleData, period, 'volume');
	}

	rsi( candleData: ArrayCandle[], period: number){
		this.indicatorsUsed[`rsi|${period}`] = true;
		return this.rsi(candleData, period);
	}

	ema( candleData: ArrayCandle[], period: number){
		this.indicatorsUsed[`ema|${period}`] = true;
		return ema(candleData, period);
	}

	smaArray( candleData: number[], period: number) {
		// This indicator can't be displayed in the charts, don't store in the used ones
		return smaArray(candleData, period);
	}

	bollinger( candleData: ArrayCandle[] ){
		return bollinger(candleData);
	}

	keltner( candleData: ArrayCandle[] ){
		return keltner(candleData);
	}

	topbot( candleData: ArrayCandle[], options?: TopbotChartOptions ){
		this.indicatorsUsed[`topbot|${options?.candleGrouping||1}`] = true;
		return topbot(candleData, options);
	}
}