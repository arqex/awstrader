import {loader, StoreBacktest} from '../stateManager';
import apiCacher from '../apiCacher';
import { getFullBacktestSelector, getSimpleBacktestSelector } from '../selectors/backtests.selectors';

export const fullBacktestLoader = loader<string,StoreBacktest>({
	selector: (store, id) => getFullBacktestSelector(store, id),
	load: (id, store) => {
		let bt = getSimpleBacktestSelector(store, id);
		return apiCacher.loadBacktestDetails(id, bt.fullResultsPath);
	}
});

