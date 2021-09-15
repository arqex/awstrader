function initializeState(config, state ){
    state.currentBuyId = '';
    state.currentSellId = '';
}

function onData({ config, state, trader }: BotInput) {
    const {currentBuyId, currentSellId } = state;
    const currentPrice = trader.getPrice('LUNA/BTC');

    if( !currentBuyId && !currentSellId ){
        placeBuy( state, trader, currentPrice );
    }

    if( currentBuyId ){
        let order = trader.getOrder( currentBuyId );
        if( order ){
            if( order.status === 'completed' ){
                state.currentBuyId = '';
                placeSell( state, trader, currentPrice );
            }
        }
        else {
            placeBuy( state, trader, currentPrice );
        }
    }
    else if( currentSellId ){
        let order = trader.getOrder( currentSellId );
        if( order ){
            if( order.status === 'completed' ){
                state.curretnSellId = '';
                placeBuy( state, trader, currentPrice );
            }
        }
        else {
            placeSell( state, trader, currentPrice );
        }
    }
}


function placeBuy( state, trader: Trader, currentPrice: number ) {
    const buyPrice = currentPrice * .99;

    const order = trader.placeOrder({
        type: 'limit',
        direction: 'buy',
        price: buyPrice,
        pair: 'LUNA/BTC',
        amount: trader.getBalance('BTC').free * .1 / currentPrice
    });

    state.currentBuyId = order.id;
}

function placeSell( state, trader: Trader, currentPrice: number ){
    const sellPrice = currentPrice * 1.01;
    const portfolio = trader.getPortfolio();

    console.log(portfolio);
    const order = trader.placeOrder({
        type: 'limit',
        direction: 'sell',
        price: sellPrice,
        pair: 'LUNA/BTC',
        amount: trader.getBalance('LUNA').free
    });

    state.currentSellId = order.id;
}