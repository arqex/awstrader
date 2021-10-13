import { BacktestConfig } from "../../common/btSettings/BotTools";
import {v4 as uuid} from 'uuid';
import { ModelExchange } from "../../../../lambdas/model.types";
import BtBotRunner from "./BtBotRunner";
import { runBotIteration } from "../../../../lambdas/_common/botRunner/runBotIteration";
import { BtExchange } from "./Bt.types";
import { StoreBotVersion } from "../../state/stateManager";
import { getActiveBt } from "../../state/selectors/bt.selectors";
import { BtUpdater } from "../../state/updaters/bt.updater";
import apiCacher from "../../state/apiCacher";
import { getStats } from '../../common/deplotymentStats/statsCalculator';

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
		balances: options.initialBalances,
		fees: options.fees,
		slippage: options.slippage,
		exchange: 'bitfinex'
	});

	setInitialBt(btid, version, runner, options);

	BtUpdater.update({
		status: 'candles'
	});
	await runner.getAllCandles();

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

	consolidateBacktest();

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

function consolidateBacktest(){
	let activeBt = getActiveBt();
	if( !activeBt ) return;

	console.log('Consolidating BT', activeBt);
	const {accountId, botId, versionNumber, deployment, exchange} = activeBt.data;
	const {netProfitPercent, maxDropdownPercent, exposurePercent} = getStats(deployment);
	let bt = {
		accountId,
		botId,
		versionNumber,
		config: activeBt.config,
		quickResults: {
			netProfitPercent, maxDropdownPercent, exposurePercent
		},
		fullResults: JSON.stringify({deployment, exchange})
	}

	apiCacher.createBacktest(bt)
		.then( () => BtUpdater.clear() )
	;
}