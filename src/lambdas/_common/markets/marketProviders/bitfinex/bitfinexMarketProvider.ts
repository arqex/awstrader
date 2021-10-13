import { RESTv2 } from 'bfx-api-node-rest';
import { KucoinOrderBook, Market, MarketAdapter } from '../../market.types';
import { assetToBtf, assetToLocal } from './bitfinexAssetTranslations';
const fetch = require('node-fetch');


function toExchangeAsset( localAsset: string ): string {
	return assetToBtf[localAsset] || localAsset;
}

function toExchangePair( localPair: string ): string {
	let assets = localPair.split('/');
	let quoted = toExchangeAsset(assets[0]);
	let base = toExchangeAsset(assets[1]);

	let separator = quoted.length + base.length > 6 ? ':' : '';
	return `t${quoted}${separator}${base}`;
}

function toLocalAsset( exchangeAsset: string): string {
	return assetToLocal[exchangeAsset] || exchangeAsset;
}

function toLocalPair( exchangePair: string ): string {
	let parts = exchangePair.split(':');
	if( parts.length === 1 ){
		return `${toLocalPair(exchangePair.slice(0,3))}/${toLocalPair(exchangePair.slice(3))}`;
	}
	
	return `${parts[0].slice(1)}/${parts[1]}`;
}

function fetchMarket( localPair: string ): Promise<Market|undefined> {
	let pair = toExchangePair(localPair);

	let bfx = new RESTv2({
		apiKey: '',
		apiSecret: ''
	});

	return bfx.orderBook(pair).then( res => {
		let prices: string[] = [];
		let amounts: string[] = [];
		res.slice(10).forEach( item => {
			prices.push( item[0].toString() );
			amounts.push( (item[2] < 0 ? item[2] * -1 : item[2]).toString() )
		});

		const representativePrice = getLongerNumber(prices);
		const representativeAmount = getLongerNumber(amounts);
		const baseIncrement = getIncrement(representativeAmount);
		return {
			exchangeId: 'bitfinex',
			symbolId: localPair,
			updatedAt: Date.now(),
			exchangeSymbol: pair,
			baseIncrement,
			priceIncrement: getIncrement(representativePrice),
			minAmount: baseIncrement
		};
	});
}

function getIncrement( price: string ){
	let parts = price.split('.');

	if( parts.length === 1 ){
		// No decimals, count zeros
		let increment = ""
		let i = price.length;
		while( i-- > 0 ){
			if( price[i] === '0' ){
				increment += '0';
			}
			else {
				return '1' + increment;
			}
		}
		return increment;
	}
	
	// Count decimals
	let i = parts[1].length - 1;
	let increment = '';
	while( i-- > 0 ){
		increment += '0';
	}
	return '0.' + increment + '1';
}

function getLongerNumber( numbers: string[] ){
	let longer = numbers[0];
	for( let i = 1; i<numbers.length; i++ ){
		if( longer.length < numbers[i].length ){
			longer = numbers[i];
		}
	}
	return longer;
}

const bitfinexMarketProvider: MarketAdapter = {
	toExchangeAsset,
	toExchangePair,
	toLocalAsset,
	toLocalPair,
	fetchMarket
}

export default bitfinexMarketProvider;