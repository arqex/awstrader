import { CreateBacktestInput, DynamoBacktest, ModelBacktest } from "../../model.types";
import { parseId, parseTripleId } from "../utils/resourceId";
import s3Helper from "../utils/s3";
import { DBModel } from "./db";

const Db = new DBModel<DynamoBacktest>();
const PREFIX = 'BACKTEST#';
export default {
	async getSingle( backtestId: string ){
		const {accountId, parentId, resourceId} = parseTripleId(backtestId);
		const backtest = await Db.getSingle(accountId, getResourceId(parentId, resourceId));
		if( backtest ){
			return dynamoToModel(backtest);
		}
	},

	async getBotBacktests( botId: string ){
		const {accountId, resourceId} = parseId(botId);
		const backtests = await Db.getMultiple( accountId, getResourceId(resourceId) );
		return backtests.map(dynamoToModel);
	},

	async create(input: CreateBacktestInput) {
		const {fullResults, ...bt} = input;
		const backtest = modelToDynamo(bt);

		await Promise.all([
			Db.put(backtest),
			saveResults(input.fullResultsPath, fullResults)
		]);
	},

	async delete(backtest: ModelBacktest){
		const {accountId, parentId, resourceId} = parseTripleId(backtest.id);
		await Promise.all([
			Db.del(accountId, getResourceId(parentId, resourceId) ),
			delResults( backtest.fullResultsPath )
		])
	},

	async getFullResults(path: string){
		return s3Helper.backtests.getContent(path);
	}
}

const resultsMeta = {
	CacheControl: 'max-age=99999999',
	ContentType: 'text/plain',
	ACL: 'public-read'
}
function saveResults( path: string, results: string ){
	return s3Helper.backtests.setContent(path, results, resultsMeta);
}

function delResults( path: string ){
	return s3Helper.backtests.delObject(path);
}


function dynamoToModel(dynamo: DynamoBacktest): ModelBacktest {
	const {resourceId, accountId, ...baseBt} = dynamo;
	const [botId, id] = resourceId.split('#').slice(1);
	
	return {
		...baseBt,
		accountId,
		botId: botId + accountId,
		id: id + botId + accountId 
	}
}

function modelToDynamo(model: ModelBacktest): DynamoBacktest {
	const {id, botId, ...baseBt} = model;
	const {parentId, resourceId} = parseTripleId(id);
	console.log('modeltoDynamo', id, parentId, resourceId);
	return {
		...baseBt,
		resourceId: getResourceId(parentId, resourceId)
	}
}


function getResourceId( botId:string, backtestId?: string ){
	let id = `${PREFIX}${botId}#`;
	if( backtestId ){
		id += `${backtestId}`;
	}
	return id;
}