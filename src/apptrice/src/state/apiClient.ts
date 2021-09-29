import axios, { AxiosResponse } from 'axios';
import { Portfolio } from '../../../lambdas/lambda.types';
import { CreateBacktestInput, CreateBacktestRequestPayload } from '../../../lambdas/model.types';

export interface CandleOptions {
	pair: string
	runInterval: string
	startDate: number
	endDate: number
}

export interface CreateDeploymentInput {
	accountId: string
	botId: string
	exchangeAccountId: string
	runInterval: string
	pairs: string[]
	active?: boolean
}

export interface CreateExchangeAccountInput {
	accountId: string
	name: string,
	provider: string,
	type: 'real' | 'virtual',
	credentials?: any
	initialBalances?: Portfolio
}

export interface UpdateBotInput {
	name?: string,
}

export interface UpdateBotVersionInput {
	label?: string
	isLocked?: boolean
	code?: string
}

export interface UpdateDeploymentInput {
	active?: boolean,
	name?: string,
	version?: string
}

export interface CreateBotInput {
	accountId: string,
	name: string,
	code: string
}

type VersionBumpType = 'minor' | 'major';
export interface CreateBotVersionInput {
	accountId: string
	botId: string
	// We receive what version bump type we need for the new version
	type: VersionBumpType
	// We might declare version code to clone, if not, it clones the last one
	sourceNumber?: string
}

let API_URL: string;
const apiClient = {
	initialize( url: string ){
		API_URL = url;
	},

	//////////
	// ACCOUNT
	//////////
	loadAccountData( accountId: string ): Promise<AxiosResponse>{
		return axios.get(`${API_URL}/accounts/${accountId}`)
			.then( res => {
				console.log(res);
				return res;
			})
		;
	},


	////////////
	// BACKTESTS
	////////////

	createBacktest( input: CreateBacktestRequestPayload ){
		return axios.post(`${API_URL}/bots/${input.botId}/backtests`, input)
			.then( res => {
				return res;
			})
		;
	},

	loadBotBacktests( botId: string ){
		return axios.get(`${API_URL}/bots/${botId}/backtests`)
			.then( res => {
				console.log(res);
				return res;
			})
		;
	},

	//////////
	// BOTS
	//////////
	loadBotList( accountId: string ): Promise<AxiosResponse>{
		return axios.get(`${API_URL}/bots?accountId=${accountId}`)
			.then(res => {
				console.log(res);
				return res;
			})
		;
	},

	createBot( input: CreateBotInput ): Promise<AxiosResponse> {
		return axios.post(`${API_URL}/bots`, input )
			.then(res => {
				console.log(res);
				return res;
			})
		;
	},

	loadSingleBot(accountId: string, botId: string): Promise<AxiosResponse> {
		return axios.get(`${API_URL}/bots/${botId}`)
			.then(res => {
				console.log(res);
				return res;
			})
		;
	},

	updateBot(accountId: string, botId: string, payload: UpdateBotInput): Promise<AxiosResponse> {
		return axios.patch(`${API_URL}/bots/${botId}`, payload)
			.then(res => {
				console.log(res);
				return res;
			})
		;
	},

	deleteBot(accountId: string, botId: string): Promise<AxiosResponse> {
		return axios.delete(`${API_URL}/bots/${botId}`)
			.then(res => {
				console.log(res);
				return res;
			})
			;
	},

	///////////////
	// BOT VERSIONS
	///////////////

	loadSingleBotVersion(accountId: string, botId: string, number: string) {
		return axios.get(`${API_URL}/botVersions/${number}?botId=${botId}`)
			.then( res => {
				console.log(res);
				return res;
			})
		;
	},

	createBotVersion( input: CreateBotVersionInput ): Promise<AxiosResponse> {
		return axios.post(`${API_URL}/botVersions`, input )
			.then(res => {
				console.log(res);
				return res;
			})
		;
	},

	updateBotVersion( accountId: string, botId: string, number: string, update: UpdateBotVersionInput ) {
		return axios.patch(`${API_URL}/botVersions/${number}?botId=${botId}`, update)
			.then( res => {
				console.log(res);
				return res;
			})
		;
	},


	///////////////
	// DEPLOYMENTS
	///////////////
	loadDeploymentList( accountId: string ): Promise<AxiosResponse>{
		return axios.get(`${API_URL}/deployments?accountId=${accountId}`)
			.then(res => {
				console.log(res);
				return res;
			})
		;
	},

	loadSingleDeployment( accountId: string, deploymentId: string): Promise<AxiosResponse> {
		return axios.get(`${API_URL}/deployments/${deploymentId}`)
			.then( res => {
				console.log(res);
				return res;
			})
		;
	},

	createDeployment( input: CreateDeploymentInput ): Promise<AxiosResponse> {
		return axios.post(`${API_URL}/deployments`, input ).then( res => {
			console.log(res);
			return res;
		});
	},
 
	updateDeployment(deploymentId: string, payload: UpdateDeploymentInput): Promise<AxiosResponse> {
		return axios.patch(`${API_URL}/deployments/${deploymentId}`, payload)
			.then(res => {
				console.log(res);
				return res;
			})
		;
	},

	deleteDeployment(accountId: string, deploymentId: string): Promise<AxiosResponse> {
		return axios.delete(`${API_URL}/deployments/${deploymentId}`)
			.then(res => {
				console.log(res);
				return res;
			})
		;
	},

	////////////
	// CANDLES
	////////////
	loadCandles( {pair, runInterval, startDate, endDate}: CandleOptions): Promise<AxiosResponse>{
		let query = `pair=${pair}&runInterval=${runInterval}&startDate=${startDate}&endDate=${endDate}`;
		return axios.get(`${API_URL}/candles?${query}`)
			.then(res => {
				console.log(res);
				return res;
			})
		;
	},

	/////////////
	// EXCHANGE ACCOUNTS
	/////////////
	loadExchangeAccountList( accountId: string ): Promise<AxiosResponse> {
		return axios.get(`${API_URL}/exchanges?accountId=${accountId}`)
			.then( res => {
				console.log(res);
				return res;
			})
		;
	},

	loadSingleExchangeAccount( accountId: string, exchangeAccountId: string ): Promise<AxiosResponse> {
		return axios.get(`${API_URL}/exchanges/${exchangeAccountId}`)
			.then(res => {
				console.log(res);
				return res;
			})
		;
	},

	createExchangeAccount(payload: CreateExchangeAccountInput): Promise<AxiosResponse> {
		return axios.post(`${API_URL}/exchanges`, payload)
			.then(res => {
				console.log(res);
				return res;
			})
		;
	},

	deleteExchangeAccount(accountId: string, exchangeAccountId: string ): Promise<AxiosResponse> {
		return axios.delete(`${API_URL}/exchanges/${exchangeAccountId}`)
			.then(res => {
				console.log(res);
				return res;
			})
		;
	},

	loadPrices( exchange:string, pair:string, type: string ){
		return axios.get(`${API_URL}/prices?exchange=${exchange}&pair=${pair}&type=${type}`)
			.then( res => {
				console.log( res );
				return res;
			})
		;
	}
}

export default apiClient;