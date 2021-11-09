import { BacktestConfig } from "../../common/btSettings/BotTools";
import {v4 as uuid} from 'uuid';
import { ModelExchange, RunnableDeployment } from "../../../../lambdas/model.types";
import BtBotRunner from "./BtBotRunner";
import { runBotIteration } from "../../../../lambdas/_common/botRunner/runBotIteration";
import { BtActive, BtExchange } from "./Bt.types";
import { CreateBacktestInput, StoreBotVersion } from "../../state/stateManager";
import { getActiveBt } from "../../state/selectors/bt.selectors";
import { BtUpdater } from "../../state/updaters/bt.updater";
import apiCacher from "../../state/apiCacher";
import { getStats } from "../../common/deplotymentStats/statsCalculator";

let runner: BtBotRunner;
const BtRunner = {
	start( version: StoreBotVersion, options: BacktestConfig ): string {
		const btid = uuid();
		prepareAndRun( btid, version, options );
		return btid;
	},

	abort(){
		const activeBt = getActiveBt();
		if ( activeBt && activeBt.status === 'running') {
			BtUpdater.update({status: 'aborted'});
			if( runner ){
				runner?.bot?.terminate();
			}
		}
	}
}

export default BtRunner;


async function prepareAndRun(btid: string, version: StoreBotVersion, options: BacktestConfig){
	runner = new BtBotRunner({
		accountId: version.accountId,
		botId: version.botId,
		versionNumber: version.number,
		baseAssets: options.baseAssets,
		quotedAsset: options.quotedAsset,
		runInterval: options.runInterval,
		startDate: options.startDate,
		endDate: options.endDate,
		// @ts-ignore
		balances: options.initialBalances,
		fees: options.fees,
		slippage: options.slippage,
		exchange: options.exchangeProvider
	});

	setInitialBt(btid, version, runner, options);

	BtUpdater.update({
		status: 'candles'
	});

	try {
		await runner.getAllCandles();
	}
	catch( err: any ){
		console.log( err );
		logError(
			runner.deployment,
			'Error loading candles.',
			err?.response?.data?.error
		);
		runner.bot?.terminate();
		return;
	}

	BtUpdater.update({
		status: 'running',
		currentIteration: 0,
		candles: runner.candles,
		totalIterations: runner.totalIterations,
		deployment: runner.deployment,
		exchange: toBtExchange( runner.exchange )
	});
	await runIterations( version, runner );

	BtUpdater.update({ status: 'completed' });

	let activeBt = getActiveBt();
	if( activeBt ){
		apiCacher.createBacktest( toStoreBt(activeBt) )
			.then( () => BtUpdater.clear() )
		;
	}

	runner.bot?.terminate();
}

function setInitialBt(btid: string, version: StoreBotVersion, runner: BtBotRunner, config: BacktestConfig) {
	BtUpdater.setBt({
		totalIterations: 0,
		currentIteration: 0,
		candles: {},
		status: 'candles',
		data: {
			id: btid,
			accountId: version.accountId,
			botId: version.botId,
			versionNumber: version.number,
			deployment: runner.deployment,
			exchange: {
				provider: runner.exchange.provider
			}
		},
		config
	});
}

async function runIterations( version: StoreBotVersion, runner: BtBotRunner ) {
	const { accountId, botId } = version;

	while( runner.hasIterationsLeft() ){
		console.log(`Iteration ${runner.iteration}`);
		await runBotIteration( accountId, botId, runner );
		BtUpdater.update({
			currentIteration: 0,
			deployment: runner.deployment,
			exchange: toBtExchange(runner.exchange)
		});
		runner.iteration++;
	}
}

function toBtExchange( exchange: ModelExchange ): BtExchange{
	return {
		provider: exchange.provider
	};
}

function toStoreBt( bt: BtActive ): CreateBacktestInput {
	const {accountId, botId, versionNumber, deployment, exchange} = bt.data;
	const stats = getStats(deployment);
	const {netProfitPercent, maxDropdownPercent, exposurePercent} = stats;
	const {orders,logs,state,plotterData, ...lightDeployment} = deployment;

	return {
		accountId,
		botId,
		versionNumber,
		config: bt.config,
		quickResults: {
			netProfitPercent, maxDropdownPercent, exposurePercent
		},
		fullResults: {
			lightDeployment,
			exchange,
			stats,
			deploymentDetails: {
				orders,logs,state,plotterData
			}
		}
	}
}

function logError( deployment:RunnableDeployment, errorType: string, errorMessage: string){
		BtUpdater.update({
			status: 'error',
			deployment: {	
				...deployment,
				logs: [
					{id: 1, date: Date.now(), type: 'error', message: errorType},
					{id: 2, date: Date.now(), type: 'error', message: errorMessage},
				]
			}
		})
}