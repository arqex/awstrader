import apiCacher from '../apiCacher';
import {loader}  from '../stateManager';
import { candlesSelector } from '../selectors/candle.selectors';
import { ArrayCandle } from '../../../../lambdas/lambda.types';
import { CandleOptions } from '../apiClient';

export const candleLoader = loader<CandleOptions, ArrayCandle[]>({
	selector: candlesSelector,
	load: ({pair, runInterval, startDate, endDate, provider}) => apiCacher.loadCandles({
		pair, runInterval, startDate, endDate, provider
	})
});

