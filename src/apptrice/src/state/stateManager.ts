import { DbBot, FullBotDeployment, ModelExchange, ModelBotDeployment, ModelBacktest, RunnableDeployment, RunInterval, PortfolioHistoryItem, ActiveInterval, DeploymentOrders, DBBotDeploymentState, ConsoleEntry, PlotterData } from '../../../lambdas/model.types';
import { BtActive, BtExchange } from '../utils/backtest/Bt.types';
import lorese from './Lorese';

export interface StoreAccount {
	id: string,
	bots?: string[],
	deployments?: string[],
	exchangeAccounts?: string[]
}

export interface StoreBotVersion {
	accountId: string
	botId: string
	number: string
	code: string
	isLocked: boolean
	label: string
	createdAt: number
	updatedAt: number
}

export interface StoreBot extends DbBot {
	backtests?: string[]
}

export interface BtLightDeployment {
	accountId: string
	exchangeAccountId: string
	botId: string
	version: string
	runInterval: RunInterval
	pairs: string[]
	portfolioHistory: PortfolioHistoryItem[]
	activeIntervals: ActiveInterval[]
	lastRunAt?: number
}
export interface BtDeploymentDetails {
	orders: DeploymentOrders
	state: DBBotDeploymentState
	logs: ConsoleEntry[]
	plotterData: PlotterData
}

export interface StoreBacktest extends ModelBacktest {
	fullResults? : {
		exchange: BtExchange,
		lightDeployment: BtLightDeployment,
		deploymentDetails: BtDeploymentDetails | null
	}
}

export type StoreBotDeployment = ModelBotDeployment | FullBotDeployment;
export interface Store {
	authenticatedId: string
	accounts: {
		[id: string]: StoreAccount
	},
	backtests: {
		[id: string]: StoreBacktest
	},
	deployments: {
		[id: string]: StoreBotDeployment
	},
	bots: {
		[id:string]: StoreBot
	},
	exchangeAccounts: {
		[id:string]: ModelExchange
	},
	botVersions: {
		[id:string]: StoreBotVersion
	},
	transientData: {
		activeBt?: BtActive,
		candles: any
	}
}

const manager = lorese<Store>({
	authenticatedId: '0000000000000000000000',
	accounts: {
		'0000000000000000000000': {id: '0000000000000000000000'} 
	},
	backtests: {},
	deployments: {},
	bots: {},
	exchangeAccounts: {},
	botVersions: {},
	transientData: {
		candles: {}
	}
})

// @ts-ignore
window.stateManager = manager;

const { addChangeListener, removeChangeListener, emitStateChange, loader, reducer, selector} = manager;
export { addChangeListener, removeChangeListener, emitStateChange, loader, reducer, selector};