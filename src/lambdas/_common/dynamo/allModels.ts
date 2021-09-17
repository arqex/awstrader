import AccountModel from './AccountModel';
import BacktestModel from './BacktestModel';
import BotDeploymentModel from './BotDeploymentModel';
import BotModel from './BotModel';
import BotVersionModel from './BotVersionModel';
import ExchangeAccountModel from './ExchangeAccountModel';

export interface DynamoModels {
	account: typeof AccountModel,
	backtest: typeof BacktestModel,
	bot: typeof BotModel,
	botVersion: typeof BotVersionModel,
	deployment: typeof BotDeploymentModel,
	exchangeAccount: typeof ExchangeAccountModel
}

const allModels: DynamoModels = {
	account: AccountModel,
	backtest: BacktestModel,
	bot: BotModel,
	botVersion: BotVersionModel,
	deployment: BotDeploymentModel,
	exchangeAccount: ExchangeAccountModel
}

export default allModels;