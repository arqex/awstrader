
import { RESTv2 } from 'bfx-api-node-rest';
import { Order as BfxOrder } from 'bfx-api-node-models';
import { CandleQuery, ExchangeAdapter, ExchangeOrder, ExchangePairs, Ticker } from '../ExchangeAdapter';
import { ArrayCandle, OrderInput, Portfolio } from '../../../lambda.types';
import { DbExchangeAccount } from '../../../model.types';

const fetch = require('node-fetch');
const baseUrl = 'https://api-pub.bitfinex.com/v2';

let cache = {};

export default class BitfinexAdapter implements ExchangeAdapter {
	bfx: RESTv2
	constructor( exchangeAccount: DbExchangeAccount ){
		console.log('Createing bfx', exchangeAccount);
		this.bfx = new RESTv2({
			apiKey: exchangeAccount.key,
			apiSecret: exchangeAccount.secret
		});
	}

	async getPortfolio(): Promise<Portfolio> {
		let wallets = await this.bfx.wallets();
		let portfolio: Portfolio = {};
		wallets.forEach( wallet => {
			if (wallet[0] === 'exchange' ){
				portfolio[ wallet[1] ] = {
					asset: wallet[1],
					free: wallet[4],
					total: wallet[2]
				};
			}
		});
		return portfolio;
	}

	async getCandles(options: CandleQuery): Promise<ArrayCandle[]> {
		const queryKey = getKey(options);
		let candles = cache[queryKey];
		if (candles) {
			return candles;
		}
		const exchangeSegment = toExchangePair(options.market);
		const pathParams = `candles/trade:${getCandleInterval(options.runInterval)}:${exchangeSegment}/hist`;
		const queryParams = `limit=${options.candleCount}&end=${options.lastCandleAt}`;

		console.log(`Request ${baseUrl}/${pathParams}?${queryParams}`);
		const req = await fetch(`${baseUrl}/${pathParams}?${queryParams}`);
		const reversedCandles = await req.json();

		candles = reversedCandles.reverse();
		cache[queryKey] = candles;

		return candles;
	}

	async placeOrders(orders: OrderInput[]): Promise<ExchangeOrder[]> {
		let toSubmit = orders.map( order => {
			let bfxOptions: any = {
				type: getBfxOrderType(order.type),
				symbol: toExchangePair(order.pair),
				amount: order.direction === 'buy' ? order.amount : -order.amount
			};

			if (order.type === 'limit') {
				bfxOptions.price = order.price;
			}

			return new BfxOrder(bfxOptions);
		});

		let results = await this.bfx.submitOrderMulti( toSubmit );
		// console.log( 'Orders placed', results.notifyInfo );	
		let placed = results.notifyInfo.map( result => {
			let order = convertToExchangeOrder( result[4] );
			if( result[6] === 'ERROR' ){
				order.status = 'error';
				order.errorReason = result[7];
			}
			return order;
		})
		return placed;
	}
	async cancelOrders(orderIds: string[]): Promise<boolean[]> {
		let results = await this.bfx.cancelOrders(orderIds);
		console.log( 'Orders cancelled', results );
		return results;
	}
	async getOrders(orderIds: string[]): Promise<ExchangeOrder[]> {
		if( !orderIds.length ) return [];

		// Can't Promise.all because nonce errors
		const openOrders = await this.bfx.activeOrdersWithIds(orderIds);
		const closedOrders = await this.bfx.orderHistoryWithIds(orderIds);

		const orders = openOrders.concat(closedOrders).map(convertToExchangeOrder);
		return orders;
	}
	async getOpenOrders(): Promise<ExchangeOrder[]> {
		let orders = await this.bfx.activeOrders();
		console.log('RAW ORDERS', orders);
		return orders.map( convertToExchangeOrder );
	}
	async getOrderHistory(): Promise<ExchangeOrder[]> {
		let orders = await this.bfx.orderHistory({}, null, Date.now(), 20);
		console.log('RAW ORDERS', orders);
		return orders.map(convertToExchangeOrder);
	}

	async getTicker(): Promise<Ticker> {
		let exchangeData: any[] = await this.bfx.tickers(['ALL']);
		let ticker: Ticker = {};
		let now = Date.now();

		exchangeData.forEach( (tick: any) => {
			if( tick[0][0] === 't' ){ // We are only interested in trade pairs like 'tBTCUSD'
				ticker[toLocalPair(tick[0].slice(1))] = {
					date: now,
					price: tick[7],
					volume: tick[8],
					change: tick[6]
				}
			}
		});

		return ticker;
	}

	async getPairs(): Promise<ExchangePairs> {
		let pairs: ExchangePairs = {};

		let data: any[] = await this.bfx.conf(['pub:info:pair']);

		data[0].forEach( (pairData: any) => {
			pairs[ toLocalPair(pairData[0]) ] = {
				pairKey: pairData[0],
				minOrder: parseFloat( pairData[1][3] ),
				maxOrder: parseFloat( pairData[1][4] ),
			}
		});

		return pairs;
	}
}

function getKey(options: CandleQuery): string {
	return `${options.market}:${options.runInterval}:${options.lastCandleAt}:${options.candleCount}`;
}

function toExchangePair(market) {
	let assets = market.split('/');
	let separator = market.length !== 7 ? '%3A' : '';
	console.log( market, market.length, separator);
	return `t${assets[0]}${separator}${assets[1]}`;
}

function toLocalPair( exchangePair ){
	let parts = exchangePair.split(':');
	if( parts.length === 1 ){
		return `${exchangePair.slice(0,3)}/${exchangePair.slice(3)}`;
	}
	
	return `${parts[0].slice(1)}/${parts[1]}`;
}

function convertToExchangeOrder(rawOrder): ExchangeOrder {
	const bfxOrder = new BfxOrder(rawOrder);
	const status = getOrderStatus(bfxOrder.status);
	const amount = bfxOrder.amount || bfxOrder.amountOrig;

	let exchangeOrder: ExchangeOrder =  {
		id: bfxOrder.id,
		pair: getOrderPair(bfxOrder.symbol),
		type: bfxOrder.type.includes('LIMIT') ? 'limit' : 'market',
		status,
		errorReason: null,
		direction: amount > 0 ? 'buy' : 'sell',
		amount: Math.abs(amount),
		price: bfxOrder.price || null,
		executedPrice: bfxOrder.priceAvg || null,
		placedAt: bfxOrder.mtsCreate,
		closedAt: status === 'cancelled' || status === 'completed' ? bfxOrder.mtsUpdate : null
	}

	console.log('Converting to exchange order', rawOrder, exchangeOrder, bfxOrder);
	return exchangeOrder;
}

function getOrderPair( pair: string ) {
	return pair.slice(1, pair.length -3) + '/' + pair.slice(-3);
}

function getBfxOrderType( type: string ) {
	if( type === 'limit' ){
		return 'EXCHANGE LIMIT';
	}
	return 'EXCHANGE MARKET';
}

function getOrderStatus(status: string): 'pending' | 'placed' | 'completed' | 'cancelled' | 'error' {
	if( !status ) return 'pending';

	let str = status.split(' ')[0];
	switch ( str ){
		case 'ACTIVE':
		case 'PARTIALLY FILLED':
			return 'placed';
		case 'EXECUTED':
			return 'completed';
		case 'CANCELED':
			return 'cancelled';
	}
	return 'pending';
}

function getCandleInterval(interval: string){
	if( interval === '1w' ) return '7D';
	if( interval === '2w' ) return '14D';
	return interval.replace('d', 'D').replace('mo', 'M');
}