import memoizeOne from 'memoize-one';
import { ModelExchange } from '../../../../lambdas/model.types';
import { selector, Store } from '../stateManager';
import { getAccount, getAuthenticatedId } from './account.selectors';

export function getExchangesSelector(store: Store, accountId: string): ModelExchange[] | void{
	const account = getAccount(accountId);
	if( !account || !account.exchangeAccounts ) return;

	return getExchangesMemo( account.exchangeAccounts, store.exchangeAccounts );
}

export const getAccountExchanges = selector<string,ModelExchange[]|void>( getExchangesSelector );
export const getExchangeList = selector<string,ModelExchange[]|void>( (store, accountId) => (
	getExchangesSelector( store, getAuthenticatedId() )
));

const getExchangesMemo = memoizeOne( (ids, exchanges) => {
	return ids.map( (id:string) => exchanges[id]);
})

export function exchangeSelector(store: Store, exchangeId: string) {
	return store.exchangeAccounts[exchangeId];
}
export const getExchange = selector<string, ModelExchange | void>( exchangeSelector );