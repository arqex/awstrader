import apiCacher from "../../state/apiCacher";
import { getStats } from '../../common/deplotymentStats/statsCalculator';
import { BtActive } from "./Bt.types";

// The problem sending backtests to lambda is that the payload
// is too big. So we will send only the main data to the server
// and store the rest locally
export function consolidateBacktest(activeBt: BtActive ) {
	console.log('Consolidating BT', activeBt);
	const {accountId, botId, versionNumber, deployment, exchange} = activeBt.data;
	const {netProfitPercent, maxDropdownPercent, exposurePercent} = getStats(deployment);
	const {orders,logs,state,plotterData, ...lightDeployment} = deployment;


	let bt = {
		accountId,
		botId,
		versionNumber,
		config: activeBt.config,
		quickResults: {
			netProfitPercent, maxDropdownPercent, exposurePercent
		},
		fullResults: JSON.stringify({lightDeployment, exchange})
	}

	return apiCacher.createBacktest(bt)
		.then( res => {
			saveBtLocal( res.data.id, {orders,logs,state,plotterData});
		});
}

const LS_INDEX_KEY = "BT_INDEX";
const LS_DATA_PREFIX = "BT_";
export function saveBtLocal( btId: string, data: any ){
	syncLocalBts();
	let index:any = getIndex();
	index[btId] = Date.now();
	saveIndex(index);
	saveBtData(btId, data);
}

export function getBtLocal( btId: string ){
	syncLocalBts();
	return localStorage.getItem(`${LS_DATA_PREFIX}${btId}`);
}

const BT_DATA_EXPIRATION = 15 * 24 * 60 * 60 * 1000; // 15days
function syncLocalBts(){
	let index: any = getIndex();
	let ids = Object.keys(index);
	let i = ids.length;
	while( i-- > 0 ){
		if( index[ids[i]] + BT_DATA_EXPIRATION < Date.now() ){
			delete index[ids[i]];
		}
	}
}

function getIndex() {
	let strindex = localStorage.getItem( LS_INDEX_KEY ) || '{}';
	return JSON.parse(strindex);
}

function saveIndex(index: any){
	localStorage.setItem(LS_INDEX_KEY, JSON.stringify(index));
}

function saveBtData(id: string, data: any) {
	localStorage.setItem(`${LS_DATA_PREFIX}${id}`, JSON.stringify(data));
}