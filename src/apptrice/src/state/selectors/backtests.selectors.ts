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