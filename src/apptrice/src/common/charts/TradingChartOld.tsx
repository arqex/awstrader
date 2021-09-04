import * as React from 'react'
import { Orders } from '../../../../lambdas/lambda.types';
import OrderSeries from './chartMarkers/OrderSeries';
import OHLC from './chartMarkers/OHLC';
import memoizeOne from 'memoize-one';
import { PlotterData } from '../../../../lambdas/model.types';

const { ChartCanvas, Chart } = require('react-stockcharts');
const { last, timeIntervalBarWidth } = require("react-stockcharts/lib/utils");
const { XAxis, YAxis } = require('react-stockcharts/lib/axes');
const { CandlestickSeries, BarSeries, LineSeries } = require('react-stockcharts/lib/series');
const { CrossHairCursor, EdgeIndicator, MouseCoordinateX, MouseCoordinateY } = require('react-stockcharts/lib/coordinates');
const { fitWidth } = require('react-stockcharts/lib/helper');
const { MovingAverageTooltip } = require('react-stockcharts/lib/tooltip');

const { ema, wma, sma, tma } = require("react-stockcharts/lib/indicator");

const { discontinuousTimeScaleProvider } = require("react-stockcharts/lib/scale");

const { scaleTime } = require('d3-scale');
const { utcHour } = require('d3-time');
const { format } = require('d3-format');
const { timeFormat } = require('d3-time-format');


export interface ChartCandle {
	date: Date,
	open: number,
	close: number,
	high: number,
	low: number,
	volume: number
}

interface TradingChartProps {
	width: number,
	height: number,
	ratio: number,
	data: any,
	orders: Orders,
	patterns?: string[],
	candles: ChartCandle[],
	includePreviousCandles: boolean,
	onLoadMore?: (start: number, end: number ) => void,
	highlightedInterval?: [number, number],
	plotterData?: PlotterData
}

let chartIndex = 0;
class TradingChart extends React.Component<TradingChartProps> {
	chart?: any
	id: string = `chart${chartIndex++}`

	render() {
		const { width, ratio, candles, orders } = this.props;
		

		const volumeAccessor = (d: any) => {
			return d.volume;
		}

		const indicators = this.getIndicators();
		const calculatedData = getDataMemo( candles, indicators );
		const height = 400;

		// This is the data for the x axis
		const xAccessor = (d: any) => d.date;
		// These are the initial limits for the x zoom
		const xExtents = [
			xAccessor(last(candles)),
			xAccessor(candles[Math.max(0,candles.length - 150)])
		];

		return (
			<ChartCanvas
				width={width}
				height={height}
				ratio={ratio}
				type="hybrid"
				data={candles}
				xAccessor={xAccessor}
				xScale={scaleTime()}
				xExtents={xExtents}
				margin={{ left: 50, right: 50, top: 10, bottom: 30 }}
				pointsPerPxThreshold={.6}
				onLoadMore={ this.props.onLoadMore }>


				<Chart id={1} yExtents={(d: any) => [d.high, d.low]}>
					<XAxis axisAt="bottom"
						orient="bottom"
						ticks={6}
						innerTickSize={-height + 40}
						{...axisStyles} />
					<YAxis axisAt="right"
						orient="right"
						ticks={5}
						innerTickSize={-width + 100}
						{...axisStyles} />
					<CandlestickSeries
						width={timeIntervalBarWidth(utcHour)}
						yAccessor={ (d: ChartCandle) => ({ open: d.open, high: d.high, low: d.low, close: d.close, date: d.date })}
						{...this.getCandleStyles() } />
					<OrderSeries orders={orders} candles={candles} />
					{ this.renderMouseCoordinates() }
					<OHLC
						origin={[-30,0]}
						textFill="#ffffff" />
					{ this.renderIndicatorTooltips( indicators || [] )}
					{ this.renderIndicatorLineSeries( indicators || [] ) }
				</Chart>
				<Chart id={2}
					origin={(w: number, h: number) => [0, h - 100]}
					height={100} yExtents={volumeAccessor}>
					<YAxis axisAt="left"
						orient="left"
						ticks={3}
						tickFormat={format(".2s")}
						{...axisStyles} />
					<BarSeries yAccessor={volumeAccessor}
						fill={(d: any) => d.close > d.open ? "#6BA583" : "#f390dd"} />
				</Chart>
				<CrossHairCursor
					stroke="#cdccee"
					strokeDasharray="Dash"
					strokeWidth={1} />
			</ChartCanvas>
		);
	}

	renderMouseCoordinates() {
		return (
			<>
				<EdgeIndicator
					itemType="last"
					orient="right"
					edgeAt="right"
					yAccessor={ (d:any) => d.close }
					fill="#011627"
					textFill="#cdccee"
					lineStroke="#cdccee"
					arrowWidth={0}
					rectHeight={12}
					fontSize={10} />
				<MouseCoordinateX
					at="bottom"
					orient="bottom"
					displayFormat={timeFormat("%y-%m-%d %H:%M")}
					fontSize={10} 
					rectHeight={14}
					fill="#172e45"/>
				<MouseCoordinateY
					at="right"
					orient="right"
					displayFormat={format(".2f")}
					arrowWidth={0}
					rectHeight={14}
					fontSize={10}
					fill="#172e45" />
			</>
		)
	}

	renderIndicatorTooltips( indicators: RunnableIndicator[] ) {
		if( !indicators.length ) return;

		let maOptions: any[] = [];
		indicators.forEach( (indicator: RunnableIndicator) => {
			if( indicator.tooltip === 'ma' ){
				maOptions.push({
					// @ts-ignore
					yAccessor: indicator.func.accessor(),
					type: indicator.type.toLocaleUpperCase(),
					windowSize: parseInt(indicator.args[0]),
					stroke: indicator.color
				});
			}
		});

		if( maOptions.length ){
			return (
				<MovingAverageTooltip
					origin={[-48, 10]}
					options={ maOptions }
					labelFill="#f390dd"
					textFill="#b2b1d8" />
			)
		}
	}

	renderIndicatorLineSeries(indicators: RunnableIndicator[]) {
		if( !indicators.length ) return;

		return indicators.map( (indicator:any, i: number) => (
			<LineSeries key={indicator.key}
				yAccessor={indicator.func.accessor()}
				stroke={indicator.color} />
		));
	}

	getIndicators() {
		return getIndicatorsMemo( this.props.plotterData?.indicators );
	}

	getCandleStyles() {
		const {highlightedInterval: hi} = this.props;
		let strokeColor: any = (d: ChartCandle) => {
			return d.close < d.open ? '#d05773' : '#29946d';
		}

		if( hi ){
			strokeColor = function (d: ChartCandle) {
				let isHighlighted = d.date.getTime() > hi[0] && d.date.getTime() < hi[1];
				if( isHighlighted ){
					return d.close < d.open ? '#d05773' : '#29946d';
				}
				return d.close < d.open ? '#d0577377' : '#29946d77';
			}
		}

		return {
			wickStroke: strokeColor,
			stroke: strokeColor,
			fill: strokeColor,
			opacity: 1
		}
	}
}

const TradingChartWidth = fitWidth(TradingChart);
export default TradingChartWidth;


function strokeColor(d: any) {
	return d.close < d.open ? "#d05773" : "#29946d";
}

const candleStyles = {
	wickStroke: strokeColor,
	stroke: strokeColor,
	fill: strokeColor,
	opacity: 1
}

interface RunnableIndicator {
	key: string,
	type: string,
	args: any[],
	tooltip: string,
	color: string,
	func: Function
}

const colors = ['#ff0000', '#ffff00', '#00ff0', '#00ffff', '#0000ff', '#ff00ff'];
const indicatorFunctions: {[name:string]: Function} = { sma, ema, wma, tma };
const getIndicatorsMemo = memoizeOne( (sources: string[] | undefined ) => {

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
					.merge( (data:any, value: number) => {data[source] = value})
					.accessor((data:any) => data[source])
			});
		}
		else {
			console.warn(`Unknown indicator ${name}`)
		}
	});

	return indicators;
});


const getDataMemo = memoizeOne( ( data: ChartCandle[], indicators: RunnableIndicator[] ) => {
	let calculated = data;
	indicators.forEach( (i: RunnableIndicator) => calculated = i.func(calculated) );
	return calculated;
});

const axisStyles: any = {
	fill: '#172e45',
	strokeOpacity: 1,
	stroke: '#172e45',
	fontSize: 10,
	tickStroke: '#cdccee',
	tickStrokeOpacity: .15,
	tickStrokeDasharray: 'Solid',
	tickStrokeWidth: 1
}