// Initialize this bot with just one quoted asset and one base asset
// It needs to be called twice to complete a full test cycle

// In the first cycle, there are:
// * A small market buy to be completed
// * A limit buy to be placed, far away from the current price

// In the second cycle, there are:
// * A small market sell to get back to the original portfolio distribution
// * A cancelation of the limit buy placed in the first cycle

function initializeState( config, state ){
	state.currentMarketPosition = false;
	state.marketPositionAmount = 0;
	state.currentLimitPosition = false;

}

function onData( input: BotInput) {
	const {state, config, utils, trader} = input;


	const pair = config.pairs[0];
	const {quoted} = utils.getPairAssets(pair);
	
	if( !state.currentLimitPosition ){
		console.log('Buying cycle', quoted, trader.getBalance( quoted ).free, trader.getPrice(pair) );
		state.marketPositionAmount = trader.getBalance( quoted ).free / trader.getPrice( pair ) / 10;
		state.currentMarketPosition = trader.placeOrder({
				pair,
				type: 'market',
				direction: 'buy',
				amount: state.marketPositionAmount
		});

		state.currentLimitPosition = trader.placeOrder({
			pair,
			type: 'limit',
			direction: 'buy',
			price: trader.getPrice(pair) * 0.5,
			amount: state.marketPositionAmount
		});
	}
	else {
		console.log('Selling cycle');
		trader.placeOrder({
			pair,
			type: 'market',
			direction: 'sell',
			amount: state.marketPositionAmount * .98
		});
		trader.cancelOrder(state.currentLimitPosition.id)

		state.currentMarketPosition = false;
		state.marketPositionAmount = 0;
		state.currentLimitPosition = false;
	}
}