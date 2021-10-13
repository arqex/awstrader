import {loader} from '../stateManager';
import apiCacher from '../apiCacher';
import { exchangeSelector } from '../selectors/exchange.selectors';
import { ModelExchange } from '../../../../lambdas/model.types';

interface ExchangeLoadInput {
	accountId: string
	exchangeId: string
}

export const exchangeLoader = loader<ExchangeLoadInput,ModelExchange>({
	selector: (store, {exchangeId}) => exchangeSelector(store, exchangeId),
	load: ({accountId, exchangeId}) => apiCacher.loadSingleExchangeAccount(accountId, exchangeId)
});

