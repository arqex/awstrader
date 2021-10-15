import {loader, StoreBacktest} from '../stateManager';
import apiCacher from '../apiCacher';
import { getFullBacktestSelector } from '../selectors/backtests.selectors';

export const fullBacktestLoader = loader<string,StoreBacktest>({
	selector: (store, id) => getFullBacktestSelector(store, id),
	load: (id, store) => {
		return apiCacher.loadBacktestDetails(id);
	}
});

