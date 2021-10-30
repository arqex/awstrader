import * as T from "./KrakentClient.types";
import fetch from 'node-fetch';
import {stringify} from 'query-string';
import {createHash, createHmac} from 'crypto';

export class KrakenClient {
	static pub = {
		getTime() {},
		getSystemStatus(){},
		getAssets(options: T.GetAssetInfoOptions){},
		getAssetPairs(options: T.GetAssetPairsOptions){},
		getTicker(pair: string){},
		/** Return max 720 candles */
		getOHLC(options: T.OHLCOptions){},
		getOrderBook(options: T.OrderBookOptions){},
		getRecentTrades(options: T.RecentQueryOptions){},
		getRecentSpread(options: T.RecentQueryOptions){}
	}

	config: T.KrakenClientConfig
	constructor(options: T.KrakenClientOptions){
		this.config = {
			apiKey: options.apiKey,
			privateKey: options.privateKey,
			nonceOffset: options.timestamp ? options.timestamp - Date.now() : 0,
			version: 0,
			baseUrl: options.baseUrl || 'https://api.kraken.com'
		}
	}

	getAccountBalance() {
		return callPrivateMethod(this.config, '/private/balance', {});
	}

	getTradeBalance(asset: string) {
		return callPrivateMethod(this.config, '/private/TradeBalance', {asset});
	}

	getOpenOrders(options: T.GetOpenOrdersOptions) {
		return callPrivateMethod(this.config, '/private/OpenOrders', options);
	}

	getClosedOrders(options: T.GetClosedOrdersOptions) {
		return callPrivateMethod(this.config, '/private/ClosedOrders', options);
	}

	queryOrders(options: T.QueryOrdersOptions ){
		return callPrivateMethod(this.config, '/private/QueryOrders', options);
	}

	getTradesHistory(options: T.TradesHistoryOptions ){
		return callPrivateMethod(this.config, '/private/TradesHistory', options);
	}

	queryTrades(options: T.QueryTradesOptions ){
		return callPrivateMethod(this.config, '/private/QueryTrades', options);
	}

	getOpenPositions(options: T.OpenPositionsOptions){
		return callPrivateMethod(this.config, '/private/OpenPositions', options);
	}

	getLedgers( options: T.LedgersOptions ){
		return callPrivateMethod(this.config, '/private/Ledgers', options);
	}

	queryLedgers( options: T.QueryLedgersOptions ){
		return callPrivateMethod(this.config, '/private/QueryLedgers', options);
	}

	getTradeVolume( pair: string ){
		return callPrivateMethod(this.config, '/private/TradeVolume', {pair});
	}

	exportReport( options: T.ExportReportOptions) {
		return callPrivateMethod(this.config, '/private/AddExport', options);
	}

	getExportReportStatus( report: 'trades' | 'ledgers') {
		return callPrivateMethod(this.config, '/private/ExportStatus', {report});
	}

	getDataExport(id: string) {
		return callPrivateMethod(this.config, '/private/RetrieveExport', {id});
	}

	deleteExportReport(options: T.DeleteExportReportOptions) {
		return callPrivateMethod(this.config, '/private/RemoveExport', options);
	}

	addOrder(options: T.AddOrderOptions) {
		return callPrivateMethod(this.config, '/private/AddOrder', options);
	}

	cancelOrder(txid: string | number ){
		return callPrivateMethod(this.config, '/private/CancelOrder', {txid});
	}

	cancelAllOrders(){
		return callPrivateMethod(this.config, '/private/CancelAll', {});
	}

	cancelAllOrdersAfter(timeout: number) {
		return callPrivateMethod(this.config, '/private/CancelAllOrdersAfter', {timeout});

	}

	getDepositMethods(asset: string) {
		return callPrivateMethod(this.config, '/private/DepositMethods', {asset});

	}

	getDepositAddresses(options: T.GetDepositAddressesOptions) {
		return callPrivateMethod(this.config, '/private/DepositAddresses', options);

	}

	getRecentDeposits(options: T.RecentDepositsStatusOptions) {
		return callPrivateMethod(this.config, '/private/DepositStatus', options);

	}

	getWithdrawalInfo(options: T.WithdrawalOptions) {
		return callPrivateMethod(this.config, '/private/WithdrawInfo', options);

	}

	withdrawFunds( options: T.WithdrawalOptions) {
		return callPrivateMethod(this.config, '/private/Withdraw', options);

	}

	getRecentWithdrawals( options: T.RecentWithdrawalOptions ){
		return callPrivateMethod(this.config, '/private/WithdrawStatus', options);

	}

	cancelWithdrawal(options: T.WithdrawalCancelOptions) {
		return callPrivateMethod(this.config, '/private/WithdrawCancel', options);
	}

	requestWalletTransfer(options: T.WalletTransferOptions) {
		return callPrivateMethod(this.config, '/private/WalletTransfer', options);

	}

	stakeAsset(options: T.StakeAssetOptions) {
		return callPrivateMethod(this.config, '/private/Stake', options);

	}

	unstakeAsset(options: T.UnstakeAssetOptions) {
		return callPrivateMethod(this.config, '/private/Unstake', options);
	}

	getStakeableAssets() {
		return callPrivateMethod(this.config, '/private/Staking/Assets', {});

	}

	getPendingStaking() {
		return callPrivateMethod(this.config, '/private/Staking/AssPendingets', {});

	}

	getStakingTransactions() {
		return callPrivateMethod(this.config, '/private/Staking/Pending', {});

	}

	getWebsocketsToken() {
		return callPrivateMethod(this.config, '/private/Staking/GetWebSocketsToken', {});
	}
}


function dataToString(data: {[key: string]: any}) {
	let str = '';
	Object.keys(data).forEach( key => {
		let value = key;
		if( Array.isArray(value) ){
			
		}
	})
}

function callPublicMethod( config: T.KrakenClientConfig, path: string, data?: {[key: string]: any} ) {
	let url = `${config.baseUrl}/${config.version}/${path}`;
	if( data ){
		url += `?${stringify(data, {arrayFormat: 'comma'})}`;
	}

	return fetch(url)
		.then( response => response.json() )
		.then( json => {
			if( json.error.length ){
				throw new Error(json.error[0]);
			}
			return json.error.result;
		})
	;
}

function callPrivateMethod( config: T.KrakenClientConfig, path: string, data: {[key: string]: any} ) {;
	const url = `${config.baseUrl}/${config.version}/${path}`;
	const nonce = Date.now() + config.nonceOffset;
	const body = stringify(data, {arrayFormat: 'comma'});
	const requestOptions = {
		method: 'POST',
		headers: {
			'API-Key': config.apiKey,
			'API-Sign': getMessageSignature(`/${config.version}/${path}`, body, config.privateKey, nonce),
			'Content-Type': 'Content-Type: application/x-www-form-urlencoded; charset=utf-8',
			'User-Agent': 'Kraken JS client'
		},
		body
	};

	return fetch(url, requestOptions)
		.then( response => response.json() )
		.then( json => {
			if( json.error.length ){
				throw new Error(json.error[0]);
			}
			return json.error.result;
		})
	;
}

// Create a signature for a request
const getMessageSignature = (path: string, request: string, secret: string, nonce: number) => {
	const secret_buffer = Buffer.from(secret, 'base64');
	const hash          = createHash('sha256');
	const hmac          = createHmac('sha512', secret_buffer);
	// @ts-ignore
	const hash_digest   = hash.update(nonce + message).digest('binary');
	const hmac_digest   = hmac.update(path + hash_digest, 'binary').digest('base64');

	return hmac_digest;
};