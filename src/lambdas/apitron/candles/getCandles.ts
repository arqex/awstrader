import BitfinexAdapter from "../../_common/exchanges/adapters/BitfinexAdapter";
import KucoinAdapter from "../../_common/exchanges/adapters/KucoinAdapter";
import exchangeUtils from "../../_common/exchanges/exchangeUtils";

export async function getCandles( req, res ){
	const { pair, runInterval, startDate, endDate, provider = 'bitfinex' } = req.query;

	// @ts-ignore
	const lastCandleAt = exchangeUtils.getLastCandleAt(runInterval, endDate);
	const candleCount = getCandleCount(startDate, endDate, runInterval );
	const options = {
		market: pair,
		runInterval,
		candleCount,
		lastCandleAt
	};

	console.log( options );
	
	// @ts-ignore
	const adapter = getAdapter(provider);
	try {
		const candles = await adapter.getCandles(options);
		res.json(candles);
	}
	catch (err) {
		res.status(400).json({
			error: err.message
		});
	}

}

function getAdapter(provider: string) {
	// @ts-ignore
	const dummyExchangeAccount: ModelExchange = {credentials: {key: 'candles', secret: 'candles', passphrase: 'candles'}};
	if( provider === 'bitfinex'){
		return new BitfinexAdapter(dummyExchangeAccount);
	}
	return new KucoinAdapter(dummyExchangeAccount);
}


function getCandleCount( startDate, endDate, runInterval ){
	let length = endDate - startDate;
	return Math.ceil( length / exchangeUtils.runIntervalTime[runInterval] );
}
