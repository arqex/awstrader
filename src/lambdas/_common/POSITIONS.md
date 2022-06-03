function openPosition( input: PositionInput ): Position {
    return 
}

function closePosition(id: string) {}

function increasePosition({amount: number}){}
function reducePosition({amount: number}){}

function cancelPositionOrder(id: string){}
function addStopLimitToPosition(price: number){}
function addTakeProfitToPosition(input: PositionTakeProfitInput){}


interface PositionTakeProfitInput {
    price: number
    amount?: number
}


type PositionDirection = 'long' | 'short'
interface PositionInput {
    pair: string
    direction?: PositionDirection
    amount: number
    entryPrice?: number
    stopLossPrice?: number
    takeProfitPrice?: number
}

interface Position {
    id: string
    pair: string
    direction: PositionDirection
    amount: number
    status: 'pending' | 'open' | 'closed'
    entryOrders: ExchangeOrder[]
    exitOrders: ExchangeOrder[]
    openAt?: number
    closedAt?: number
} 

/*
// position example
{
    id: 123,
    pair: 'ETH/USDT',
    direction: 'long',
    amount: 133,
    status: 'open',
    entryOrders: [
        {id: 111, direction: 'buy', status: 'completed', executedPrice: 1003},
        {id: 123, direction: 'buy', status: 'placed', type: 'limit', price: 999}
    ],
    exitOrders: [
        {id: 112, direction: 'sell', status: 'placed', type: 'limit', price: 1010, isPartial: false},
        {id: 113, direction: 'sell', status: 'placed', type: 'stop', price: 997, isPartial: false},
    ]
}
*/