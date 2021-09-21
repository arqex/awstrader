import {loader, StoreBacktest} from '../stateManager';
import apiCacher from '../apiCacher';
import { getBotBacktestsSelector } from '../selectors/backtests.selectors';

export const botBacktestsLoader = loader<string,StoreBacktest[]>({
	selector: getBotBacktestsSelector,
	load: (botId: string) => apiCacher.loadBotBacktests(botId)
});