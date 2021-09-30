import { DbExchangeAccount } from "../../../model.types";
import { CandleQuery, ExchangeAdapter, ExchangeOrder, ExchangePairs, Ticker } from "../ExchangeAdapter";
import * as KucoinClient from 'kucoin-node-sdk';
import { ArrayCandle, OrderInput, Portfolio } from "../../../lambda.types";
import { createId } from "../../utils/resourceId";
import pairs from "../../utils/pairs";

// console.log( KucoinClient );

export default class KucoinAdapter implements ExchangeAdapter {
	constructor( exchangeAccount: DbExchangeAccount, isSandbox?: boolean ){
		KucoinClient.init({
			baseUrl: isSandbox ? 'https://openapi-sandbox.kucoin.com' : 'https://api.kucoin.com',
			apiAuth: exchangeAccount.credentials,
			authVersion: 2
		});
	}

	getPortfolio(): Promise<Portfolio>{
		return KucoinClient.rest.User.Account.getAccountsList({type: 'trade'})
			.then( res => {
				let portfolio: Portfolio = {};
				res.data.forEach( (item:any) => {
					portfolio[item.currency] = {
						asset: item.currency,
						total: parseFloat(item.balance),
						free: parseFloat(item.available)
					}
				});
				return portfolio;
			})
		;
	}

	getCandles(options: CandleQuery): Promise<ArrayCandle[]> {
		console.log('Kucoin candles', options);
		const pair = getExchangePair(options.market);
		const timeInterval = getExchangeTimeInterval(options.runInterval);
		const thresholds = {
			startAt: Math.round(getFirstCandleAt(options.lastCandleAt, options.candleCount, options.runInterval) / 1000),
			endAt: Math.round(options.lastCandleAt / 1000)
		}
		console.log('getting candles', pair, timeInterval, thresholds);
		return KucoinClient.rest.Market.Histories.getMarketCandles( pair, timeInterval, thresholds)
			.then( res => {
				console.log( res )
			})
		;
	}

	placeOrders(orders: OrderInput[]): Promise<ExchangeOrder[]> {
		let promises = orders.map( (order: OrderInput) => {
			const {baseParams, orderParams} = toKucoinOrderInput(order);
			return KucoinClient.rest.Trade.Orders.postOrder(baseParams, orderParams);
		});

		console.log('Placing orders')
		return Promise.all(promises).then( results => {
			console.log(results)
			let orderPromises = results.map( (result: any) => {
				if( result.code !== '200000' ){
					return result;
				}
				return KucoinClient.rest.Trade.Orders.getOrderByID(result.data.orderId);
			})
			
			console.log('Getting orders')
			return Promise.all(orderPromises).then( results => {
				console.log( results );
				let exchangeOrders = results.map( (res,i) => {
					if( res.code !== '200000' ){
						return toErrorOrder(orders[i], res.msg);
					}
					return toExchangeOrder(res.data);
				});
				return exchangeOrders;
			})
		});
	}
	cancelOrders(orderIds: string[]): Promise<boolean[]> {
		const promises = orderIds.map( KucoinClient.rest.Trade.Orders.cancelOrder );
		return Promise.all( promises ).then( results => {
			console.log( results );
			return results.map( (r:KucoinResponse) => r.code === '200000' );
		});
	}
	getOrders(ids: string[]): Promise<(ExchangeOrder|null)[]> {
		console.log('Loading orders');
		let promises = ids.map( KucoinClient.rest.Trade.Orders.getOrderByID );
		return Promise.all(promises).then( results => {
			console.log( results );
			return results.map( (result: KucoinResponse) => {
				if( result.code !== '200000' ) return null;
				return toExchangeOrder(result.data);
			})
		})
	}
	getOpenOrders(): Promise<ExchangeOrder[]> {
		console.log('Loading open orders');
		return KucoinClient.rest.Trade.Orders.getOrdersList('TRADE', {status: 'active'})
			.then( (response: KucoinResponse) => {
				console.log( response );
				if( response.data ){
					return response.data.items.map( toExchangeOrder );
				}
				return [];
			})
		;
	}
	getOrderHistory(): Promise<ExchangeOrder[]> {
		return Promise.resolve([]);
	}
	
	getTicker(): Promise<Ticker> {
		return Promise.resolve({});
	}
	getPairs(): Promise<ExchangePairs> {
		return Promise.resolve({});
	}

	tradeAccountId: string
	tradeAccountPromise: Promise<any>
	getTradeAccountId(){
		if( this.tradeAccountId ) return Promise.resolve(this.tradeAccountId);
		if( this.tradeAccountPromise ) return this.tradeAccountPromise;

		this.tradeAccountPromise = KucoinClient.rest.User.Account.getAccountsList({type: 'trade'})
			.then( (res) => {
				console.log(res.data);
				return res.data[0].id;
			})
		;

		return this.tradeAccountPromise;
	}
}


function getExchangePair( pair: string ){
	return pair.replace('/', '-');
}

function getLocalExchangePair( kucoinPair: string ){
	return kucoinPair.replace('-','/');
}

function getExchangeTimeInterval( runInterval: string ){
	return runInterval.replace('m', 'min').replace('h', 'hour').replace('d', 'day');
}

let factors = {
	m: 60 * 1000,
	h: 60 * 60 * 1000,
	d: 24 * 60 * 60 * 1000
}

function getFirstCandleAt( lastCandleAt: number, candleCount: number, timeInterval: string ) {
	let quantity = parseInt(timeInterval);
	// @ts-ignore
	let unit = timeInterval.match(/[mhd]$/);
	if( !unit ){
		throw new Error(`Unknown time interval ${timeInterval}`);
	}

	let candleWidth = quantity * factors[unit[0]];
	return lastCandleAt - (candleWidth*candleCount);
}

interface KucoinResponse {
	code: string
	data: any
	msg: string
}

interface KucoinOrder {
	id: string
	symbol: string
	opType: 'DEAL' | 'CANCEL'
	type: 'limit' | 'market' | 'stop_limit'
	side: 'buy' | 'sell'
	price: string
	size: string
	funds: string
	dealFunds: string
	dealSize: string
	fee: string
	feeCurrency: string
	stp: string
	stop: string
	stopTriggered: boolean
	stopPrice: string
	timeInForce?: 'GTC' | 'GTT' | 'IOC' | 'FOK'
	postOnly: boolean
	hidden: boolean
	iceberg: boolean
	visibleSize: string
	cancelAfter: number
	channel: string
	clientOid: string
	remark: string | null
	tags: string | null
	isActive: boolean
	cancelExists: boolean
	createdAt: number
	tradeType: 'TRADE' | 'MARGIN_TRADE'
}

interface KucoinOrderInput {
	clientOid?: string
	side: 'buy' | 'sell'
	symbol: string
	type?: 'limit' | 'market'
	remark?: string
	stop?: 'loss' | 'entry'
	stopPrice?: string
	stp?: 'CN' | 'CO' | 'CB' | 'DC'
	tradeType?: string
	price?: string
	size: string
	timeInForce?: 'GTC' | 'GTT' | 'IOC' | 'FOK'
	cancelAfter?: number
	postOnly?: boolean
	hidden?: boolean
	iceberg?: boolean
	visibleSize?: string
}

interface KucoinOrderParams {
	baseParams: {
		clientOid: string
		side: 'buy' | 'sell'
		symbol: string
		type?: 'limit' | 'market'
	},
	orderParams: {
		price?: string
		size: string
	}
}

function toExchangeOrder( order: KucoinOrder ): ExchangeOrder {
	return {
		id: order.id,
		pair: getLocalExchangePair(order.symbol),
		// @ts-ignore
		type: order.type,
		status: getOrderStatus(order),
		errorReason: null,
		amount: getOrderAmount( order ),
		price: parseInt( order.price ) || null,
		executedPrice: getExecutedPrice(order),
		placedAt: order.createdAt,
		closedAt: getClosedAt(order) 
	};
}

function toErrorOrder( order: OrderInput, errorMsg: string ): ExchangeOrder {
	return {
		...order,
		status: 'error',
		errorReason: errorMsg,
		price: order.price || null,
		executedPrice: null,
		placedAt: Date.now(),
		closedAt: Date.now()
	}
}

function toKucoinOrderInput( order: OrderInput ): KucoinOrderParams {
	return {
		baseParams: {
			clientOid: order.id,
			side: order.direction,
			symbol: getExchangePair(order.pair),
			type: order.type,
		},
		orderParams: {
			price: order.price?.toString(),
			size: order.amount.toString()
		}
	}
}

function getOrderStatus(order: KucoinOrder): 'pending' | 'placed' | 'completed' | 'cancelled' | 'error' {
	if( order.isActive ){
		return 'pending';
	}

	if( parseFloat( order.dealSize ) > 0 ){
		return 'completed';
	}

	return 'cancelled';
}

function getOrderAmount(order: KucoinOrder): number {
	return parseFloat( order.dealSize ) || parseFloat( order.size );
}

function getExecutedPrice(order: KucoinOrder): number | null {
	let funds = parseFloat(order.dealFunds);
	if( funds ){
		let size = parseFloat(order.dealSize);
		return funds / size;
	}
	return null;
}

function getClosedAt(order: KucoinOrder): number | null {
	if( getOrderStatus(order) === 'pending' ) return null;

	if( order.type === 'limit' ){
		return Date.now();
	}
	return order.createdAt;
}