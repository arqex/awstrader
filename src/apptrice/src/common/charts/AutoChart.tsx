import * as React from 'react'
import { ArrayCandle } from '../../../../lambdas/lambda.types';
import { ExchangeProvider, Order, PairPlotterData, PlotterData } from '../../../../lambdas/model.types';
import TradingChart, {ChartCandle} from './TradingChart';
import memoizeOne from 'memoize-one';
import { candleLoader } from '../../state/loaders/candle.loader';



interface AutoChartProps {
	pair: string,
	exchange: ExchangeProvider,
	interval: string,
	orders: Order[],
	plotterData?: PlotterData,
	patterns?: string[],
	startDate: number,
	endDate: number
}

interface AutoChartState {
	loadingDate?: number
	alreadyLoadedDate?: number
	chartStartDate: number
	candles?: ArrayCandle[]
	hasMore: boolean
}

// Loads candles automatically while moving the chart
export default class AutoChart extends React.Component<AutoChartProps> {
	state: AutoChartState = {
		loadingDate: undefined,
		alreadyLoadedDate: undefined,
		chartStartDate: this.getDateToLoad( this.props.interval, this.props.endDate ),
		candles: undefined,
		hasMore: true
	}
		
	render() {
		return (
			<div>
				{ this.state.candles ? this.renderChart( this.state.candles || [] ) : 'Loading...' }
			</div>
		);
	}

	renderChart( candles: ArrayCandle[] ) {
		const {startDate, endDate} = this.props;
		return (
			// @ts-ignore // HOCs are breaking the component props ts definitions
			<TradingChart
				orders={this.props.orders}
				candles={ candles }
				plotterData={this.getPlotterData()}
				patterns={ this.props.patterns || [] }
				onLoadMore={ this._onLoadMore }
				highlightedInterval={[startDate, endDate]} />
		)
	}

	componentDidUpdate(prevProps: AutoChartProps){
		if( prevProps.pair !== this.props.pair ){
			this.setState({
				loadingDate: undefined,
				alreadyLoadedDate: undefined,
				chartStartDate: this.getDateToLoad( this.props.interval, this.props.startDate ),
				candles: undefined,
				hasMore: true
			});
		}
		this.checkCandlesLoad();
	}

	componentDidMount(){
		this.checkCandlesLoad();
	}

	getDateToLoad( interval: string, endDate: number ){
		// Let's say interval is always 1h for the time being
		let time = (60 * 60 * 1000) * 200; // 200 candles
		return endDate - time;
	}

	checkCandlesLoad() {
		const {loadingDate, chartStartDate, alreadyLoadedDate, candles, hasMore } = this.state;
		if( !hasMore || loadingDate ) return;

		if( alreadyLoadedDate === undefined ){
			const {interval, endDate} = this.props;
			const dateToLoad = this.getDateToLoad(interval, endDate);
			return this.loadCandles(dateToLoad, endDate);
		}

		let loadedDate = alreadyLoadedDate || Date.now();
		if( candles && chartStartDate < candles[0][0] ){
			const {interval} = this.props;
			const dateToLoad = this.getDateToLoad(interval, loadedDate);
			return this.loadCandles(dateToLoad, loadedDate);
		}
	}

	loadCandles( dateToLoad: number, endDate: number ){
		const {exchange, pair, interval} = this.props;
		let {data: candles, promise} = candleLoader({
			pair,
			runInterval: interval,
			startDate: dateToLoad,
			endDate,
			provider: exchange
		});

		if( candles ){
			if( !candles.length ){
				this.setState({hasMore: false});
			}
			else {
				this.setState({
					candles: [...candles, ...(this.state.candles || [])],
					alreadyLoadedDate: dateToLoad
				})
			}
		}
		else {
			this.setState({loadingDate: dateToLoad});
			promise.then( response => {
				this.setState({
					loadingDate: false,
					candles: [...response.data, ...(this.state.candles || [])],
					alreadyLoadedDate: dateToLoad
				})
			});
		}
	}

	getPlotterData() {
		const {pair, plotterData} = this.props;
		if( !plotterData ) return;
		return getPairPlotterData(pair, plotterData);
	}

	_onLoadMore = (start:number, end: number) => {
		this.setState({chartStartDate: start});
	}
}

const getPairPlotterData = memoizeOne( (pair:string, plotterData: PlotterData) => {
	const data: PairPlotterData = {
		indicators: plotterData.indicators,
		candlestickPatterns: plotterData.candlestickPatterns,
		series: plotterData.series[pair] || {},
		points: plotterData.points[pair] || {}
	};
	return data;
});