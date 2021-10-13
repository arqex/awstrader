import { MarketAdapter } from "../market.types";
import bitfinexMarketProvider from "./bitfinex/bitfinexMarketProvider";
import kucoinMarketProvider from "./kucoinMarketProvider";

const providers = {
	kucoin: kucoinMarketProvider,
	bitfinex: bitfinexMarketProvider
}

export function getMarketProvider(exchangeId: string): MarketAdapter {
	let provider = providers[exchangeId];
	if( !provider ){
		throw new Error(`Unknown market provider ${exchangeId}`);
	}
	return provider;
}