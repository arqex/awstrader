import { ConsoleEntry, DeploymentOrders, Order, RunnableDeployment, FullBotDeployment, PortfolioHistoryItem, PortfolioWithPrices, ModelExchange } from "../../model.types";
import BotDeploymentModel from "../dynamo/BotDeploymentModel"
import BotVersionModel from "../dynamo/BotVersionModel";
import ExchangeAccountModel from "../dynamo/ExchangeAccountModel";
import VirtualAdapter from "../exchanges/adapters/VirtualAdapter";
import { ExchangeAdapter, ExchangeOrder } from "../exchanges/ExchangeAdapter";
import exchanger from "../exchanges/exchanger";
import exchangeUtils from "../exchanges/exchangeUtils";
import { Market } from "../markets/market.types";
import { getMarket } from "../markets/marketService";
import { getDeactivatedDeployment, getUpdatedDeploymentStats } from "../utils/deploymentUtils";
import { BotRunner, BotRunnerDeploymentUpdate, BotRunnerExchangeUpdate, CodeError, RunnableBot } from "./BotRunner";
import { SupplierdoRunnableBot } from "./SupplierdoRunnableBot";

const SupplierdoRunner: BotRunner = {
	async getDeployment( accountId: string, deploymentId: string ){
		const deployment = await BotDeploymentModel.getSingleFull( deploymentId );
		if( !deployment ){
			throw new Error('unknown_deployment');
		}
		return deployment;
	},

	async getExchangeAccount( accountId: string, exchangeAccountId: string ){
		const exchange = await ExchangeAccountModel.getSingle( exchangeAccountId );
		if( !exchange ){
			throw new Error('unknown_exchange_account');
		}
		return exchange;
	},

 	getExchangeOrders( adapter: ExchangeAdapter ){
		if( adapter instanceof VirtualAdapter ){
			return adapter.orders;
		}
	},

	async getAdapter( exchangeAccount: ModelExchange ): Promise<ExchangeAdapter> {
		console.log('Get adapter', exchangeAccount);
		const exchangeAdapter = exchanger.getAdapter( exchangeAccount );

		if (!exchangeAdapter) {
			throw new Error(`Unknown adapter ${exchangeAccount.provider}`);
		}

		if( exchangeAdapter instanceof VirtualAdapter ){
			console.log('Hidratandoooo!!');
			await exchangeAdapter.hydrate();
		}

		return exchangeAdapter;
	},

	getCandles( adapter: ExchangeAdapter, deployment: RunnableDeployment ){
		let promises = deployment.pairs.map( (pair:string) => adapter.getCandles({
			market: pair,
			runInterval: deployment.runInterval,
			lastCandleAt: exchangeUtils.getLastCandleAt(deployment.runInterval, Date.now()),
			candleCount: 200
		}));

		return Promise.all( promises ).then( results => {
			console.log('Candle results', results.length);
			let candles = {};
			deployment.pairs.forEach( (pair,i) => {
				console.log( pair );
				candles[pair] = results[i]
			});
			return candles;
		});
	},

	async getBot( accountId: string, botId: string, versionNumber: string ): Promise<RunnableBot>{
		let botVersion = await BotVersionModel.getSingle(botId, versionNumber);

		if( !botVersion ){
			throw new CodeError({
				code: 'unknown_bot',
				extra:{accountId, botId}
			});
		}

		let bot = new SupplierdoRunnableBot();
		bot.prepare( botVersion.code );
		return bot;
	},

	async updateDeployment( deployment: FullBotDeployment, update: BotRunnerDeploymentUpdate ) {
		let {portfolioWithPrices, ...updt} = update;
		let modelUpdate: Partial<FullBotDeployment> = updt;
		if( portfolioWithPrices ){
			const item: PortfolioHistoryItem = {
				date: Date.now(),
				balances: portfolioWithPrices
			};
			deployment.portfolioHistory.push(item);
			modelUpdate.portfolioHistory = deployment.portfolioHistory;
			modelUpdate.stats = getUpdatedDeploymentStats( item.balances, deployment.stats );
		}

		let payload = {
			id: deployment.id,
			update: modelUpdate
		};

		console.log( 'Updating deployment' );
		await BotDeploymentModel.update( payload );

		return {
			...deployment,
			...update
		}
	},

	async updateExchange( exchange: ModelExchange, update: BotRunnerExchangeUpdate ) {
		let promises = [
			ExchangeAccountModel.updatePortfolio(exchange.id, update.portfolio )
		];

		if( update.orders ){
			console.log('We are updating exchange orders');
			promises.push(
				ExchangeAccountModel.updateOrders(exchange.id, update.orders )
			);
		}

		return Promise.all(promises).then( () => {
			return {
				...exchange
			}
		});
	},

	async setRunError( deployment: FullBotDeployment, error: any ){
		// When the bot finishes in an error we probably want to log the error
		// for the user and then deactivate the deployment
		console.log('The execution ended in an error', error);
		const deactivatedDeployment = getDeactivatedDeployment(deployment);
		await BotDeploymentModel.replace(deactivatedDeployment);

		/*
		await BotDeploymentModel.deactivate({
			accountId: deployment.accountId,
			deploymentId: deployment.id
		});
		*/
		// this is just for testing
		// await BotDeploymentModel.activate({ accountId, deploymentId });
		let logs: ConsoleEntry[] = [
			...deployment.logs,
			{
				id: -1,
				date: Date.now(),
				type: 'error',
				message: String(error)
			}
		];

		await BotDeploymentModel.update({
			id: deployment.id,
			update: {logs}
		});
	},

	cancelOrders( adapter: ExchangeAdapter, deploymentOrders: DeploymentOrders, orderIds: string[] ){
		let exchangeOrderIds: string[] = [];
		let deploymentOrderIds: string[] = [];
		orderIds.forEach( (id: string) => {
			let order = deploymentOrders.items[id];
			if( order && order.foreignId ){
				exchangeOrderIds.push( order.foreignId );
				deploymentOrderIds.push( order.id );
			}
		});

		if( deploymentOrderIds.length ){
			console.log(`Cancelling ${deploymentOrderIds.length} orders`);
			return adapter.cancelOrders( exchangeOrderIds ).then( () => {
				return deploymentOrderIds;
			});
		}
		else {
			console.log('No orders to cancel');
		}

		return Promise.resolve(deploymentOrderIds);

		
	},

	placeOrders( adapter: ExchangeAdapter, orders: Order[]): Promise<ExchangeOrder[]>{
		if( orders.length ){
			console.log(`Placing ${orders.length} orders in ${adapter.exchangeId}`);
			console.log( adapter );
			return normalizeOrders( adapter.exchangeId, orders ).then( normalized => {
				// @ts-ignore
				return adapter.placeOrders(normalized);
			});
		}
		else {
			console.log( 'No orders to place');
		}
		return Promise.resolve([]);
	}
}

function normalizeOrders( exchangeId: string, orders: Order[] ): Promise<Order[]> {
	let pairNames = {};
	orders.forEach( order => pairNames[order.pair] = 1 );
	let promises = Object.keys( pairNames )
		.map( pair => getMarket(exchangeId, pair) )
	;

	return Promise.all( promises ).then( (results: Market[]) => {
		let markets = {};
		results.forEach( r => markets[r.symbolId] = r );

		return orders.map( order => {
			let market: Market = markets[order.pair];
			if( market ){
				return {
					...order,
					price: normalizeNumber( order.price, market.priceIncrement ),
					amount: normalizeNumber( order.amount, market.baseIncrement ) || 0
				}
			}

			return order;
		})
	});
}


function normalizeNumber( num: number | null, increment: string ){
	if( !num ) return null;

	if( increment.includes('.') ){
		let [integ,dec] = increment.split('.');
		let numStr = num.toString();
		let numParts = numStr.split('.');
		let truncated = numParts[0] + '.' + numParts[1].slice(0, dec.length);
		return parseFloat(truncated);
	}

	let inc = parseInt(increment);
	return Math.floor( num / inc ) * inc;
}

export {SupplierdoRunner};