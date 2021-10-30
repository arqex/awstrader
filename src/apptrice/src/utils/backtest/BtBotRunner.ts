import { BotCandles, Portfolio } from "../../../../lambdas/lambda.types";
import { RunnableDeployment, ModelExchange, DeploymentOrders, Order, PortfolioWithPrices, RunInterval, ExchangeProvider } from "../../../../lambdas/model.types";
import { BotRunner, BotRunnerDeploymentUpdate, BotRunnerExchangeUpdate } from "../../../../lambdas/_common/botRunner/BotRunner";
import VirtualAdapter from "../../../../lambdas/_common/exchanges/adapters/VirtualAdapter";
import { ExchangeAdapter, ExchangeOrder } from "../../../../lambdas/_common/exchanges/ExchangeAdapter";
import candles from "../../../../lambdas/_common/utils/candles";
import { Balances } from "../../common/btSettings/InitialBalances";
import apiCacher from "../../state/apiCacher";
import { botVersionLoader } from "../../state/loaders/botVersion.loader";
import { BtRunnableBot, IBtRunnableBot } from "./BtRunnableBot";

export interface BtBotRunnerConfig {
	accountId: string,
	botId: string,
	versionNumber: string,
	baseAssets: string[],
	quotedAsset: string,
	runInterval: RunInterval,
	startDate: number,
	endDate: number,
	balances: Balances,
	fees: number,
	slippage: number,
	exchange: ExchangeProvider
}

export interface BtVirtualExchangeAccount extends ModelExchange {
	fees: number,
	slippage: number
}


export default class BtBotRunner implements BotRunner {
	deployment: RunnableDeployment
	exchange: BtVirtualExchangeAccount
	adapter: VirtualAdapter
	startDate: number
	endDate: number
	iteration: number = 0
	totalIterations: number = 0
	candlePromise: Promise<any>
	candles: BotCandles = {}
	bot: IBtRunnableBot | undefined

	constructor( config: BtBotRunnerConfig ){
		const portfolio = createPortfolio(config.balances);

		this.deployment = {
			id: 'btDeployment',
			accountId: config.accountId,
			exchangeAccountId: 'bt',
			botId: config.botId,
			version: config.versionNumber,
			orders: {
				foreignIdIndex: {},
				items: {},
				openOrderIds: []
			},
			pairs: config.baseAssets.map( (base: string) => `${base}/${config.quotedAsset}` ),
			runInterval: config.runInterval,
			state: {newState: 'stateNew'},
			logs: [],
			activeIntervals: [[config.startDate]],
			portfolioHistory: [], // Fist item will be loaded when we get the candles,
			plotterData: {
				indicators: [],
				candlestickPatterns: [],
				series: {},
				points: {}
			}
		};

		this.exchange = {
			id: 'btDeployment',
			accountId: config.accountId,
			resourceId: '',
			name: 'BT Exchange',
			provider: config.exchange,
			type: 'virtual',
			fees: config.fees,
			slippage: config.slippage
		}

		this.adapter = new VirtualAdapter(this.exchange);
		this.adapter.portfolio = portfolio;

		this.startDate = config.startDate;
		this.endDate = config.endDate;

		this.candlePromise = this.getAllCandles().then( () => {
			return this.setInitialPortfolio( config );
		});
	}

	getDeployment( accountId: string, deploymentId: string ){
		return Promise.resolve( this.deployment );
	}

	getExchangeAccount( accountId: string, deploymentId: string ){
		return Promise.resolve( this.exchange );
	}

	getExchangeOrders() {
		return this.adapter.orders;
	}

	getAdapter(){
		return Promise.resolve(this.adapter);
	}

	getCandles( adapter: ExchangeAdapter, deployment: RunnableDeployment ){
		if( !Object.keys(this.candles).length ){
			throw new Error('candles_not_initialized');
		}

		const {iteration, candles} = this;
		let iterationCandles: BotCandles = {};
		for (let asset in candles) {
			iterationCandles[asset] = candles[asset].slice(iteration, iteration + 200);
			this.adapter.updateCandlesData(asset, iterationCandles[asset]);
		}
		return Promise.resolve(iterationCandles);
	}

	getAllCandles(){
		const { pairs, runInterval } = this.deployment;
		return getAllCandles( pairs, runInterval, this.startDate, this.endDate, this.exchange.provider )
			.then( (candles: BotCandles) => {
				this.candles = candles;
				this.totalIterations = getTotalIterations(candles);
			})
		;
	}

	getBot( accountId: string, botId: string, versionNumber: string ){
		if( this.bot ){
			this.bot.currentDate = this.adapter.lastDate;
			return Promise.resolve(this.bot);
		}

		const { data: botVersion } = botVersionLoader({accountId, botId, versionNumber});
		if( !botVersion ){
			throw new Error('bot_not_initialized');
		}

		return BtRunnableBot.prepare(botVersion.code)
			.then( () => {
				this.bot = BtRunnableBot;
				this.bot.currentDate = this.adapter.lastDate;
				return this.bot;
			})
		;
	}

	updateDeployment( deployment: RunnableDeployment, {portfolioWithPrices, ...update}: BotRunnerDeploymentUpdate ) {
		this.deployment = {
			...this.deployment,
			...update
		};

		if( portfolioWithPrices ){
			this.deployment.portfolioHistory = [
				...this.deployment.portfolioHistory,
				{
					date: this.adapter.lastDate,
					balances: portfolioWithPrices
				}
			]
		}

		return Promise.resolve(this.deployment);
	}

	updateExchange( exchange: ModelExchange, update: BotRunnerExchangeUpdate ) {
		this.exchange = {
			...this.exchange,
			...update,
			portfolioHistory: [
				...(this.exchange.portfolioHistory || []),
				{
					date: this.adapter.lastDate,
					balances: update.portfolio || {}
				}
			]
		}

		return Promise.resolve(this.exchange);
	}

	setRunError( deployment: RunnableDeployment, error: any ){
		/*
		quickStore.appendLogs([{
			id: -1,
			type: 'error',
			date: Date.now(),
			message: error.message || error.toString()
		}]);
		*/
		return Promise.resolve();
	}

	cancelOrders( adapter: ExchangeAdapter, deploymentOrders: DeploymentOrders, ordersToCancel: string[] ){
		let exchangeOrderIds: string[] = [];
		let deploymentOrderIds: string[] = [];
		ordersToCancel.forEach( (id: string) => {
			let order = deploymentOrders.items[id];
			if( order && order.foreignId ){
				exchangeOrderIds.push( order.foreignId );
				deploymentOrderIds.push( order.id );
			}
		});

		return adapter.cancelOrders( exchangeOrderIds ).then( () => {
			return deploymentOrderIds;
		});
	}

	placeOrders( adapter: VirtualAdapter, orders: Order[]): Promise<ExchangeOrder[]>{
		orders.forEach( (order: Order) => {
			// orders are created in the trader that doesn't know we are in
			// backtesting, so update the creation date to say so
			order.createdAt = adapter.lastDate;
		});
		return adapter.placeOrders(orders);
	}

	hasIterationsLeft() {
		return this.iteration < this.totalIterations;
	}

	prepareNextIteration() {
		this.iteration++;
	}

	setInitialPortfolio( config:BtBotRunnerConfig ) {
		return this.getCandles(this.adapter, this.deployment).then( iterationCandles => {
			let portfolioWithPrices: PortfolioWithPrices = {};
			for (let asset in config.balances) {
				let assetCandles = iterationCandles[`${asset}/${config.quotedAsset}`];
				let balance = config.balances[asset];
				portfolioWithPrices[asset] = {
					asset,
					total: balance,
					free: balance,
					price: asset === config.quotedAsset 
						? 1
						: candles.getClose(candles.getLast(assetCandles))
				};
			}
			this.deployment.portfolioHistory = [{
				date: config.startDate - 1,
				balances: portfolioWithPrices
			}];
		})
	}
}


async function getAllCandles(pairs: string[], runInterval: string, startDate: number, endDate: number, provider: ExchangeProvider) {
	let start = add200Candles(startDate, runInterval);

	let promises = pairs.map(pair => apiCacher.loadCandles({
		pair,
		runInterval,
		startDate: start,
		endDate,
		provider
	}));

	let candleArr = await Promise.all(promises);
	let candles: BotCandles = {};
	candleArr.forEach((res, i) => candles[pairs[i]] = res.data);
	return candles;
}

const runIntervalTime = {
	'5m': 5 * 60 * 1000,
	'10m': 10 * 60 * 1000,
	'30m': 30 * 60 * 1000,
	'1h': 60 * 60 * 1000,
	'4h': 4 * 60 * 60 * 1000,
	'1d': 24 * 60 * 60 * 1000
};
function add200Candles(start: number, runInterval: string) {
	// @ts-ignore
	return start - (runIntervalTime[runInterval] * 200);
}

function getTotalIterations(candles: BotCandles) {
	let pair = Object.keys(candles)[0];
	return candles[pair].length - 200;
}

function createPortfolio(initialBalances: {[asset: string]: number}) {
	let portfolio: Portfolio = {};
	Object.keys(initialBalances).forEach(asset => {
		portfolio[asset] = {
			asset,
			free: initialBalances[asset],
			total: initialBalances[asset]
		};
	});
	return portfolio;
}