interface KrakenClientOptions {
	apiKey: string
	privateKey: string
}
interface GetAssetInfoOptions {
	assets: string[],
	aclass: string
}
interface GetAssetPairsOptions {
	pairs: string[],
	infoType?: 'all' | 'leverage' | 'fees' | 'margin'
}
interface OHLCOptions {
	pair: string,
	interval?: 1 | 5 | 15 | 30 | 60 | 240 | 1440 | 10080 | 21600
	since?: number
}
interface OrderBookOptions {
	pair: string,
	count?: number,
}
interface RecentQueryOptions {
	pair: string,
	since?: number
}
export class KrakenClient {
	static pub = {
		getTime() {},
		getSystemStatus(){},
		getAssets(options: GetAssetInfoOptions){},
		getAssetPairs(options: GetAssetPairsOptions){},
		getTicker(pair: string){},
		/** Return max 720 candles */
		getOHLC(options: OHLCOptions){},
		getOrderBook(options: OrderBookOptions){},
		getRecentTrades(options: RecentQueryOptions){},
		getRecentSpread(options: RecentQueryOptions){}
	}

	options: KrakenClientOptions
	constructor(_options: KrakenClientOptions){
		this.options = _options;
	}

	getAccountBalance() {

	}

	getTradeBalance() {

	}
}