import { DBBotDeploymentRaw, DBBotDeployment, DBBotDeploymentInput, DBBotDeploymentUpdate, SimpleBotDeployment, DBBotDeploymentWithHistory } from '../../model.types';
import s3Helper from '../utils/s3';
import { DBModel } from './db';

const Db = new DBModel<DBBotDeploymentRaw>();

const defaultOrders = {
	foreignIdIndex: {},
	items: {},
	openOrderIds: []
};
interface DeleteDeploymentInput {
	accountId: string
	deploymentId: string
}

interface UpdateDeploymentInput {
	accountId: string
	deploymentId: string
	update: DBBotDeploymentUpdate
}

export default {
	async getAccountDeployments( accountId: string ): Promise<SimpleBotDeployment[]> {
		let deployments = await Db.getMultiple(accountId, 'DEPLOYMENT#');
		return deployments.map((d: any) => ({
			...d,
			active: d.active === 'true' ? true : false
		}));
	},

	async getSingle(accountId: string, deploymentId: string): Promise<DBBotDeployment | void> {
		let entry = await Db.getSingle(accountId, `DEPLOYMENT#${deploymentId}`);
		if( !entry ) return;

		let [ logs, state, orders, history ] = await Promise.all([
			getLogs(accountId, deploymentId),
			getState(accountId, deploymentId),
			getOrders(accountId, deploymentId),
			getPortfolioHistory(accountId, deploymentId)
		]);

		return {
			...entry,
			active: entry.active ? true : false,
			orders: orders ? JSON.parse(orders) : defaultOrders,
			state: JSON.parse(state || '{}'),
			logs: JSON.parse(logs || '[]')
		};
	},

	async getSingleSimple(accountId: string, deploymentId: string): Promise<SimpleBotDeployment|void> {
		let entry = await Db.getSingle(accountId, `DEPLOYMENT#${deploymentId}`);

		if (!entry) return;
		return {
			...entry,
			active: entry.active ? true : false
		};
	},

	async getSingleWithHistory(accountId: string, deploymentId: string): Promise<DBBotDeploymentWithHistory | void> {
		let entry = await Db.getSingle(accountId, `DEPLOYMENT#${deploymentId}`);
		if( !entry ) return;

		let [ logs, state, orders, history ] = await Promise.all([
			getLogs(accountId, deploymentId),
			getState(accountId, deploymentId),
			getOrders(accountId, deploymentId),
			getPortfolioHistory(accountId, deploymentId)
		]);

		return {
			...entry,
			active: entry.active ? true : false,
			orders: orders ? JSON.parse(orders) : defaultOrders,
			state: JSON.parse(state || '{}'),
			logs: JSON.parse(logs || '[]'),
			portfolioHistory: JSON.parse(history || '[]')
		};
	},

	async create( input: DBBotDeploymentInput ){
		const {id: deploymentId, accountId } = input;
		let dbDeployment: DBBotDeploymentRaw = {
			id: deploymentId,
			name: input.name,
			accountId,
			botId: input.botId,
			version: input.version,
			resourceId: `DEPLOYMENT#${input.id}`,
			exchangeAccountId: input.exchangeAccountId,
			runInterval: input.runInterval,
			pairs: input.pairs,
			createdAt: Date.now(),
			activeIntervals: input.activeIntervals || []
		};

		if( input.active ){
			dbDeployment.active = 'true';
			dbDeployment.activeIntervals = input.activeIntervals || [[dbDeployment.createdAt]];
		}

		const portfolioHistory = [
			{
				date: Date.now(),
				balances: input.portfolioWithPrices
			}
		]

		return await Promise.all([
			Db.put(dbDeployment),
			saveLogs(accountId, deploymentId, JSON.stringify(input.logs || [])),
			saveState(accountId, deploymentId, JSON.stringify(input.state || [])),
			saveOrders(accountId, deploymentId, JSON.stringify(input.orders || defaultOrders)),
			savePortfolioHistory(accountId, deploymentId, JSON.stringify(portfolioHistory))
		]);
	},

	async replace(input: DBBotDeploymentRaw ){
		return await Db.put(input);
	},

	async update({ accountId, deploymentId, update }: UpdateDeploymentInput ){
		let promises: any = [];
		let {botId, runInterval, pairs} = update;
		if( botId || runInterval || pairs ) {
			promises.push(
				Db.update(accountId, `DEPLOYMENT#${deploymentId}`, {
					botId, runInterval, pairs
				})
			);
		}

		if( update.logs ){
			promises.push( saveLogs(accountId, deploymentId, JSON.stringify(update.logs)) );
		}
		if (update.orders) {
			promises.push( saveOrders(accountId, deploymentId, JSON.stringify(update.orders)) );
		}
		if (update.state) {
			promises.push( saveState(accountId, deploymentId, JSON.stringify(update.state)) );
		}

		if(update.portfolioWithPrices) {
			const portfolioHistoryRaw = await getPortfolioHistory(accountId, deploymentId);
			const history = [
				...JSON.parse( portfolioHistoryRaw || '[]'),
				{
					date: Date.now(),
					balances: update.portfolioWithPrices
				}
			];

			promises.push(
				savePortfolioHistory(accountId, deploymentId, JSON.stringify(history))
			);
		}

		return await Promise.all( promises );
	},

	async delete({accountId, deploymentId}: DeleteDeploymentInput) {
		let promises = [
			Db.del(accountId, `DEPLOYMENT#${deploymentId}`),
			delLogs(accountId, deploymentId),
			delOrders(accountId, deploymentId),
			delState(accountId, deploymentId),
			delPortfolioHistory(accountId, deploymentId)
		]
		// @ts-ignore
		return await Promise.all(promises);
	},

	async getActiveDeployments( runInterval: string ) {
		return await Db.getIndex('ActiveDeployments').getMultiple({
			pk: {name: 'runInterval', value: runInterval},
			sk: {name: 'active', value: 'true'}
		});
	},

	async deactivate({ accountId, deploymentId }: DeleteDeploymentInput ) {
		return await Db.removeAttributes(accountId, `DEPLOYMENT#${deploymentId}`, ['active']);
	},

	async activate({ accountId, deploymentId }: DeleteDeploymentInput) {
		return await Db.update(accountId, `DEPLOYMENT#${deploymentId}`, {active: 'true'});
	},
}

function getLogsFileName( accountId: string, deploymentId: string ){
	return `${accountId}/de-${deploymentId}/logs`;
}
function getStateFileName(accountId: string, deploymentId: string) {
	return `${accountId}/de-${deploymentId}/state`;
}
function getOrdersFileName(accountId: string, deploymentId: string) {
	return `${accountId}/de-${deploymentId}/orders`;
}
function getPortfolioHistoryFileName(accountId: string, deploymentId: string) {
	return `${accountId}/des-${deploymentId}/portfolioHistory`;
}

function getLogs( accountId: string, deploymentId: string ){
	return s3Helper.botState.getContent( getLogsFileName(accountId, deploymentId) );
}
function getState(accountId: string, deploymentId: string) {
	return s3Helper.botState.getContent(getStateFileName(accountId, deploymentId));
} 
function getOrders(accountId: string, deploymentId: string) {
	return s3Helper.botState.getContent(getOrdersFileName(accountId, deploymentId));
}
function getPortfolioHistory(accountId: string, deploymentId: string) {
	return s3Helper.botState.getContent(getPortfolioHistoryFileName(accountId, deploymentId));
}

function saveLogs(accountId: string, deploymentId: string, logs: string) {
	return s3Helper.botState.setContent(getLogsFileName(accountId, deploymentId), logs);
}
function saveState(accountId: string, deploymentId: string, state: string) {
	return s3Helper.botState.setContent(getStateFileName(accountId, deploymentId), state);
}
function saveOrders(accountId: string, deploymentId: string, orders: string) {
	return s3Helper.botState.setContent(getOrdersFileName(accountId, deploymentId), orders);
}
function savePortfolioHistory(accountId: string, deploymentId: string, portfolioHistory: string) {
	return s3Helper.botState.setContent(getPortfolioHistoryFileName(accountId, deploymentId), portfolioHistory);
}

function delLogs(accountId: string, deploymentId: string) {
	return s3Helper.botState.delObject(getLogsFileName(accountId, deploymentId));
}
function delState(accountId: string, deploymentId: string) {
	return s3Helper.botState.delObject(getStateFileName(accountId, deploymentId));
}
function delOrders(accountId: string, deploymentId: string) {
	return s3Helper.botState.delObject(getOrdersFileName(accountId, deploymentId));
}
function delPortfolioHistory(accountId: string, deploymentId: string) {
	return s3Helper.botState.delObject(getPortfolioHistoryFileName(accountId, deploymentId));
}