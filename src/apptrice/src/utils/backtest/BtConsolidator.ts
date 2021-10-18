import { BtDeploymentDetails } from "../../state/stateManager";
import lzString from 'lz-string';

const LS_INDEX_KEY = "BT_INDEX";
const LS_DATA_PREFIX = "BT_";
export function saveBtLocal( btId: string, data: BtDeploymentDetails ) {
	syncLocalBts();
	let index:any = getIndex();
	index[btId] = Date.now();
	saveIndex(index);
	saveBtData(btId, data);
}

export function getBtLocal( btId: string ): BtDeploymentDetails | null{
	syncLocalBts();
	let datastr = localStorage.getItem(`${LS_DATA_PREFIX}${btId}`);
	let decompress = datastr && lzString.decompress(JSON.parse(datastr))
	return decompress ? JSON.parse(decompress) : null;
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
	localStorage.setItem(
		`${LS_DATA_PREFIX}${id}`,
		lzString.compress(JSON.stringify(data))
	);
}