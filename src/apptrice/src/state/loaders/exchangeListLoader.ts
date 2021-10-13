import {loader} from '../stateManager';
import apiCacher from '../apiCacher';
import { getExchangesSelector } from '../selectors/exchange.selectors';
import { ModelExchange } from '../../../../lambdas/model.types';

export const exchangeListLoader = loader<string,ModelExchange[]>({
	selector: getExchangesSelector,
	load: (accountId: string) => apiCacher.loadExchangeAccountList(accountId)
});

