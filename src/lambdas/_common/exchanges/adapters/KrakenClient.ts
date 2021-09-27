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

	}

	getTradeBalance(asset: string) {

	}

	getOpenOrders(options: T.GetOpenOrdersOptions) {

	}

	getClosedOrders(options: T.GetClosedOrdersOptions) {

	}

	queryOrders(options: T.QueryOrdersOptions ){

	}

	getTradesHistory(options: T.TradesHistoryOptions ){

	}

	queryTrades(options: T.QueryTradesOptions ){

	}

	getOpenPositions(options: T.OpenPositionsOptions){

	}

	getLedgers( options: T.LedgersOptions ){

	}

	queryLedgers( options: T.QueryLedgersOptions ){
		
	}

	getTradeVolume( pair: string ){

	}

	exportReport( options: T.ExportReportOptions) {

	}

	getExportReportStatus( report: 'trades' | 'ledgers') {

	}

	getDataExport(id: string) {

	}

	deleteExportReport(options: T.DeleteExportReportOptions) {

	}

	addOrder(options: T.AddOrderOptions) {

	}

	cancelOrder(txid: string | number ){

	}

	cancelAllOrders(){

	}

	cancelAllOrdersAfter(timeout: number) {

	}

	getDepositMethods(asset: string) {

	}

	getDepositAddresses(options: T.GetDepositAddressesOptions) {

	}

	getRecentDeposits(options: T.RecentDepositsStatusOptions) {

	}

	getWithdrawalInfo(options: T.WithdrawalOptions) {

	}

	withdrawFunds( options: T.WithdrawalOptions) {

	}

	getRecentWithdrawals( options: T.RecentWithdrawalOptions ){

	}

	cancelWithdrawal(options: T.WithdrawalCancelOptions) {

	}

	requestWalletTransfer(options: T.WalletTransferOptions) {

	}

	stakeAsset(options: T.StakeAssetOptions) {

	}

	unstakeAsset(options: T.UnstakeAssetOptions) {

	}

	getStakeableAssets() {

	}

	getPendingStaking() {

	}

	getStakingTransactions() {

	}

	getWebsocketsToken() {

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

function callPrivateMethod( config: T.KrakenClientConfig, path: string, data: {[key: string]: any} ) {
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