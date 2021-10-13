import * as KucoinClient from 'kucoin-node-sdk';
import { KucoinOrderBook, Market, MarketAdapter } from '../market.types';



function toExchangeAsset( localAsset: string ): string{
	return localAsset;
}

function toExchangePair( localPair: string ): string {
	let [base,quoted] = localPair.split('/');
	return `${toExchangeAsset(base)}-${toExchangeAsset(quoted)}`;
}

function toLocalAsset( exchangeAsset: string): string {
	return exchangeAsset;
}

function toLocalPair( exchangePair: string ): string {
	let [base,quoted] = exchangePair.split('-');
	return `${toLocalAsset(base)}/${toLocalAsset(quoted)}`;
}

function fetchMarket( localPair: string ): Promise<Market|undefined> {
	let pair = toExchangePair(localPair);
	
	// The order book call is open, no need for credentials
	KucoinClient.init({
		baseUrl: 'https://api.kucoin.com',
		apiAuth: {key: '', secret: '', passphrase: ''}
	});

	return KucoinClient.rest.Market.OrderBook.getLevel2_20(pair)
		.then( res => {
			if( res?.code !== '200000' ) {
				console.log( res.msg );
				return;
			}

			console.log('Market fetched from provider', res.data);
			const {price, amount} = getRepresentativeMarketData( res.data );
			const baseIncrement = getIncrement( amount );
			return {
				exchangeId: 'kucoin',
				symbolId: localPair,
				updatedAt: Date.now(),
				exchangeSymbol: pair,
				baseIncrement,
				priceIncrement: getIncrement( price ),
				minAmount: baseIncrement
			}
		})
	;
}

function getIncrement( price: string ){
	let parts = price.split('.');

	if( parts.length === 1 ){
		console.log('Increments, no decimals', price);
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

	console.log('Increments, decimals', price);
	// Count decimals
	let i = parts[1].length - 1;
	let increment = '';
	while( i-- > 0 ){
		increment += '0';
	}
	return '0.' + increment + '1';
}

function getRepresentativeMarketData( data: KucoinOrderBook ){
	let prices: string[] = [];
	let amounts: string[] = [];

	let priceLength = 0;
	let amountLength = 0;
	data.bids.concat(data.asks).forEach( item => {
		let pLength = item[0].length;
		if( pLength > priceLength ){
			priceLength = item[0].length;
			prices = [item[0]];
		}
		if( pLength === priceLength ){
			prices.push( item[0] );
		}

		let aLength = item[1].length;
		if( aLength > amountLength ){
			amountLength = item[1].length;
			amounts = [item[1]];
		}
		if( aLength === amountLength ){
			amounts.push( item[1] );
		}
	});

	return {
		price: getRepresentativeNumber( prices ),
		amount: getRepresentativeNumber( amounts )
	};
}

function getRepresentativeNumber( prices: string[] ){
	let candidate = prices[0];
	if( candidate.split('.').length > 1 ){
		// decimals are always returned with trailing 0s, so any decimal number
		// will contain how many decimals are representative
		return candidate;
	}

	// If number if integer and has no zeros at the end is the end there is no better candidate
	if( getNumberOfTrailingZeros(candidate) === 0 ){
		return candidate;
	}

	for( let i=1; i<prices.length; i++ ){
		// Integers might end in 0s because they have some constraints
		// like, the smaller increment being 100, or just because the number
		// ends in many 0s, so we need to search for the number with less
		// trailing 0s to pick as the more representative
		let zeros = getNumberOfTrailingZeros(prices[i]);
		if( zeros === 0 ) return prices[i];
		if( zeros < getNumberOfTrailingZeros(candidate) ){
			candidate = prices[i];
		}
	}

	return candidate;
}

function getNumberOfTrailingZeros( price: string ): number {
	let match = price.match(/0*?$/);
	return match ? match[0].length : 0;
}



const kucoinMarketProvider: MarketAdapter = {
	toExchangeAsset,
	toExchangePair,
	toLocalAsset,
	toLocalPair,
	fetchMarket
}

export default kucoinMarketProvider;