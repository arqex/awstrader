export interface Market {
	exchangeId: string
	symbolId: string
	updatedAt: number
	exchangeSymbol: string
	baseIncrement: string
	priceIncrement: string
	minAmount: string
}

export interface KucoinOrderBook {
	sequence: string
	time: number,
	bids: [string,string][]
	asks: [string,string][]
}

export interface MarketAdapter {
	toExchangeAsset( localAsset: string ): string
	toExchangePair( localPair: string ): string
	toLocalAsset( exchangeAsset: string): string
	toLocalPair( exchangePair: string ): string
	fetchMarket( localPair: string ): Promise<Market|undefined>
}