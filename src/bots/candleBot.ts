function initializeState(config, state ){
    state.currentBuyId = '';
    state.currentSellId = '';
    state.currentPosition = undefined;
}

function onData({ config, state, trader, indicators, candleData,utils }: BotInput) {
    const pair = config.pairs[0];
    const currentPrice = trader.getPrice(pair);

    if( state.currentPosition ){
        let {stopLossPrice, takeProfitPrice} = state.currentPosition;
        if( currentPrice < stopLossPrice || currentPrice > takeProfitPrice ){
            console.log('selling');
            let {base} = utils.getPairAssets(pair);
            trader.placeOrder({
                type: 'market',
                direction: 'sell',
                pair: pair,
                amount: trader.getBalance(base).free
            });
            delete state.currentPosition;
        }
    }
    else if( isBouncingCandle(candleData[pair], utils, indicators) ) {
        console.log('buying');

        const stopLossPrice = getBottomUntilRedCandle(candleData[pair]);
        const takeProfitPrice = currentPrice * 2 - stopLossPrice;
        let {quoted} = utils.getPairAssets(pair);
        
        const order = trader.placeOrder({
            type: 'market',
            direction: 'buy',
            pair: pair,
            amount: trader.getBalance(quoted).free * .2 / currentPrice
        });

        state.currentPosition = {
            stopLossPrice,
            takeProfitPrice,
            orderId: order
        };
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


function isBouncingCandle( candles: ArrayCandle[], utils: BotRunUtils, indicators: Indicators ){
    let [arrayCandle] = candles.slice(-1);
    let candle = utils.getCandle(arrayCandle);

    // Only green candles
    if( candle.close < candle.open ) return false;

    // That close above the opening of the last red candle
    let redCandle = utils.getCandle( getLastRedCandle( candles ) );
    if( redCandle.open > candle.close ) return false;

    // Only candles that open below the ema9 value
    const ema9 = indicators.ema(candles, 9);
    let [lastEma9] = ema9.slice(-1);
    if( candle.open > lastEma9 ) return false;

    // If close under the 55 ema, it's ok!
    const ema55 = indicators.ema(candles, 55);
    let [lastEma55] = ema55.slice(-1);
    if( candle.close < lastEma55 ) return true;

    // If close over the 55 ema, it's a bouncing candle only when the trend is bullish
    return lastEma55 < lastEma9;
}

function getLastRedCandle( candles: ArrayCandle[] ): ArrayCandle {
    let i = candles.length;
    while( i-- > 0 ){
        if( candles[i][1] > candles[i][2] ){
            return candles[i];
        }
    }
}

function getBottomUntilRedCandle( candles: ArrayCandle[] ): number{
    let i = candles.length;
    let min = Infinity;
    while( i-- > 0 ){
        if( candles[i][4] < min ){
            min = candles[i][4];
        }
        if( candles[i][1] > candles[i][2] ){
            return;
        }
    }
}
