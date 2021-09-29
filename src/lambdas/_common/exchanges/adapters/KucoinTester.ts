import { OrderInput } from "../../../lambda.types";
import { CandleQuery } from "../ExchangeAdapter";
import KucoinAdapter  from "./KucoinAdapter"

const credentials = {
	key: '61533080bc85c200065af220',
	secret: 'd107e7ac-bd11-4ae2-8700-3e1c95dbb66d',
	passphrase: 'testingapi'
}


// @ts-ignore
let adapter = new KucoinAdapter({credentials}, true);
/*
adapter.getPortfolio().then( portfolio => {
	console.log( portfolio )
});
*/

/*
let candleQuery: CandleQuery = {
	runInterval: '1h',
	lastCandleAt: 1632844481053,
	candleCount: 5,
	market: 'BTC/USDT'
}
adapter.getCandles( candleQuery ).then( candles => {
	console.log( candles );
}) */

/*
let orders: OrderInput[] = [
	{
		id: 'otherlimit',
		pair: 'BTC/USDT',
		type: 'limit',
		direction: 'buy',
		amount: .001,
		price: 10000
	},
	{
		id: 'other',
		pair: 'BTC/USDT',
		type: 'market',
		direction: 'buy',
		amount: .0001
	}
]

adapter.placeOrders(orders).then( res => {
	console.log(res);
});

*/

/*
adapter.getOrders(['615335993e2fdd00067b5720', '61548b033e2fdd00067e5d7e', '615484f83e2fdd00067e5d4d'])
	.then( orders => {
		console.log( orders );
	})
;
*/