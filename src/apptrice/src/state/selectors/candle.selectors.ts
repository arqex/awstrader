import { ArrayCandle } from '../../../../lambdas/lambda.types';
import { CandleOptions } from '../apiClient';
import { selector, Store } from '../stateManager';
import { getCandlesKey } from '../storeKeys';

export function candlesSelector( store: Store, descriptor: CandleOptions) {
	return store.transientData.candles[ getCandlesKey(descriptor) ];
}

export const getCandles = selector<CandleOptions, ArrayCandle[]>( candlesSelector );