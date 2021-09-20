import {loader, StoreBacktest} from '../stateManager';
import apiCacher from '../apiCacher';
import { getAccountBotsSelector } from '../selectors/bot.selectors';

export const botBacktestsLoader = loader<string,StoreBacktest[]>({
	selector: getAccountBotsSelector,
	load: (botId: string) => apiCacher.loadBotBacktests(botId)
});