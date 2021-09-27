import memoizeOne from "memoize-one";
import { Store, StoreBacktest } from "../stateManager";

export function getBotBacktestsSelector(store: Store, botId: string){
	let bot = store.bots[botId];
	if( bot?.backtests ){
		return getBotBacktestsMemo( store.backtests, bot.backtests );
	}
}

const getBotBacktestsMemo = memoizeOne( (backtests: {[id:string]: StoreBacktest}, ids: string[]) => {
	return ids.map( id => backtests[id] );
});

export function getFullBacktestSelector(store: Store, id: string){
	const bt = getSimpleBacktestSelector(store, id);
	if(bt?.fullResults){
		return bt;
	}
}

export function getSimpleBacktestSelector(store: Store, id: string){
	return store.backtests[id];
}