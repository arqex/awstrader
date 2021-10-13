import MarketModel from "../dynamo/MarketModel";
import { Market } from "./market.types";
import { getMarketProvider } from "./marketProviders/marketAdapters";


export function getMarket( exchange:string, pair: string ): Promise<Market | void> {
	console.log('Getting market from cache', exchange, pair);
	return getFromCache(exchange, pair).then( cached => {
		if( isMarketDataValid(cached) ) {
			console.log('Got market from the cache!', cached);
			return Promise.resolve(cached);
		}

		console.log('Market from cache not OK, getting it from the provider');
		return fetchMarketData( exchange, pair )
				.then( market => {
					if( !market ){
						throw new Error(`Unknown market ${pair} on ${exchange} `);
					}

					console.log('Market from the provider ok. Storing in cache...', market);
					// Store and return
					return storeMarketCache( market )
						.then( () => market )
				})
			;
	})
}

function getFromCache( exchange:string, pair: string ): Promise<Market | void> {
	return MarketModel.getSingle( exchange, pair );
}

function storeMarketCache( market: Market ): Promise<any> {
	return MarketModel.update( market );
}

function fetchMarketData( exchange:string, pair: string ): Promise<Market | undefined> {
	return getMarketProvider(exchange).fetchMarket( pair );
}

const DAY = 24 * 60 * 60 * 1000;
function isMarketDataValid( entry: Market | void ): boolean{
	if(!entry) return false;

	return Date.now() - entry.updatedAt < DAY;
}