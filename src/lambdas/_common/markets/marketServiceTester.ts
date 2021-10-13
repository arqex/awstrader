import { getMarket } from "./marketService";

export default function setMarketTestEndpoint( app: any ){
	app.get('/testMarket', function( req, res ){
		let {exchange, pair} = req.query;
		console.log('Market test requested!', exchange, pair);
		if( !exchange ){
			return res.status(400).json({error: 'missing_exchange_in_the_query'});
		}
		if( !pair ){
			return res.status(400).json({error: 'missing_pair_in_the_query'});
		}

		getMarket(exchange, pair).then( market => {
			if( !market ){
				return res.status(404).json({error: 'unknown_market'});
			}

			return res.json(market);
		})
	});
}