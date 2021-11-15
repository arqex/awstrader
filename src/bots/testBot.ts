function initializeState(config, state ){
    state.currentBuyId = '';
    state.currentSellId = '';
}

function onData({ config, state, trader, indicators, candleData }: BotInput) {
    const {currentBuyId, currentSellId } = state;
    const pair = config.pairs[0];
    const currentPrice = trader.getPrice(pair);

    const topbot = indicators.topbot(candleData[pair])

    if( !currentBuyId && !currentSellId ){
        placeBuy( pair, state, trader, currentPrice );
    }

    if( currentBuyId ){
        let order = trader.getOrder( currentBuyId );
        if( order ){
            if( order.status === 'completed' ){
                state.currentBuyId = '';
                placeSell( pair, state, trader, currentPrice );
            }
        }
        else {
            placeBuy( pair, state, trader, currentPrice );
        }
    }
    else if( currentSellId ){
        let order = trader.getOrder( currentSellId );
        if( order ){
            if( order.status === 'completed' ){
                state.curretnSellId = '';
                placeBuy( pair, state, trader, currentPrice );
            }
        }
        else {
            placeSell( pair, state, trader, currentPrice );
        }
    }
}


function placeBuy( pair, state, trader: Trader, currentPrice: number ) {
    const buyPrice = currentPrice * .99;

    const order = trader.placeOrder({
        type: 'limit',
        direction: 'buy',
        price: buyPrice,
        pair: pair,
        amount: trader.getBalance('BTC').free * .1 / currentPrice
    });

    state.currentBuyId = order.id;
}

function placeSell( pair, state, trader: Trader, currentPrice: number ){
    const sellPrice = currentPrice * 1.01;
    const portfolio = trader.getPortfolio();

    console.log(portfolio);
    const order = trader.placeOrder({
        type: 'limit',
        direction: 'sell',
        price: sellPrice,
        pair: pair,
        amount: trader.getBalance('LUNA').free
    });

    state.currentSellId = order.id;
}