import { BotCandles, BotConfigurationExtra, BotState, Portfolio, BotExecutorResultWithDate } from "../../../lambdas/lambda.types";
import { ConsoleEntry, RunnableDeployment, ModelExchange, DeploymentOrders, Order, PortfolioWithPrices, PlotterData } from "../../../lambdas/model.types";
import { ExchangeAdapter, ExchangeOrder, ExchangeOrders } from "../../../lambdas/_common/exchanges/ExchangeAdapter";
import { PairPlottingSeries } from "./botRunPlotter";

export interface BotInitializeStateResponse {
	state: BotState,
	logs: ConsoleEntry[]
}

export interface RunnableBot {
	prepare(source: string): Promise<void>
	run( input: BotRunInput ): Promise<BotExecutorResultWithDate>
}

export interface BotRunInput {
	candleData: BotCandles,
	config: BotConfigurationExtra,
	state: BotState,
	orders: DeploymentOrders,
	portfolio: Portfolio,
	plotterData: {
		indicators: string[],
		candlestickPatterns: string[],
		series: PairPlottingSeries
		points: PairPlottingSeries
	}
}

export interface BotRunnerDeploymentUpdate {
	state?: BotState,
	orders?: DeploymentOrders,
	logs?: ConsoleEntry[],
	portfolioWithPrices?: PortfolioWithPrices,
	plotterData?: PlotterData
	lastRunAt?: number
}

export interface BotRunnerExchangeUpdate {
	orders?: ExchangeOrders
	portfolio: Portfolio
}

export interface BotRunner {
	getDeployment( accountId: string, deploymentId: string ): Promise<RunnableDeployment>
	getExchangeAccount( accountId: string, exchangeAccountId: string ): Promise<ModelExchange>
	getExchangeOrders(adapter: ExchangeAdapter): ExchangeOrders | undefined
	getAdapter( exchange: ModelExchange ): Promise<ExchangeAdapter>
	getCandles( adapter: ExchangeAdapter, deployment: RunnableDeployment ): Promise<BotCandles>
	getBot( accountId: string, botId: string, versionNumber: string ): Promise<RunnableBot>
	updateDeployment( deployment: RunnableDeployment, update: BotRunnerDeploymentUpdate ): Promise<RunnableDeployment>,
	updateExchange( exchange: ModelExchange, update: BotRunnerExchangeUpdate): Promise<ModelExchange>,
	setRunError( deployment: RunnableDeployment, error: any ): Promise<void>
	cancelOrders( adapter: ExchangeAdapter, currentOrders: DeploymentOrders, ordersToCancel: string[] ): Promise<string[]>
	placeOrders( adapter: ExchangeAdapter, ordersToPlace: Order[] ): Promise<ExchangeOrder[]>
}

export interface CodeErrorInput {
	code: string
	message?: string
	extra?: {[attr: string]: any}
}

export class CodeError extends Error {
	code: string
	extra: { [attr: string]: any }
	constructor(input: CodeErrorInput) {
		let message = input.message || input.code;
		super( message );
		this.code = input.code;
		this.extra = input.extra || {}
	}
}