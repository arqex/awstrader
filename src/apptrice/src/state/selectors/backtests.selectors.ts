import { Store } from "../stateManager";

export function getBotBacktestsSelector(store: Store, botId: string){
	let bot = store.bots[botId];
	return bot?.backtests;
}