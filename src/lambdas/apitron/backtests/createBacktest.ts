import { CreateBacktestRequestPayload, DynamoBacktest, ModelBacktest } from "../../model.types";
import { createId, parseId } from "../../_common/utils/resourceId";
import { ContextResult, Mutation, MutationContextInput, MutationGetterInput, MutationHandler, MutationResponseInput, ResponseResult } from "../apitron.types";
import { validateShape } from "../utils/validators";

const createBacktestHandler: MutationHandler = {
	name: 'createBacktest',
	async getContext({body, params, models}: MutationContextInput<CreateBacktestRequestPayload>): Promise<ContextResult> {
		// Validate input
		let {error} = validateShape(body, {
			accountId: 'id',
			botId: 'doubleId',
			versionNumber: 'botVersion',
			config: configShape,
			quickResults: quickResultsShape,
			extraConfig: 'map(string)?'
		});

		if( error ) return {error: {...error, code: 'invalid_payload'}};

		const {botId, versionNumber } = body;
		const version = models.botVersion.getSingle(botId, versionNumber)

		if( !version ){
			return {error: {code: 'bot_version_not_found'}};
		}

		return {context: {}};
	},

	getMutations(input: MutationGetterInput): Mutation[] {
		const {botId} = input.body;
		const {accountId, resourceId} = parseId(botId);
		const id = createId();
		const model = {
			...input.body,
			id: id + botId,
			createdAt: Date.now(),
			fullResultsPath: `${accountId}/${resourceId}/${id}.json`
		}
		return [{
			model: 'backtest',
			action: 'create',
			data: model
		}];
	},

	getResponse(input: MutationResponseInput): ResponseResult {
		return {
			status: 200,
			data: {id: input.mutations[0].data.id}
		};
	}
}

export default createBacktestHandler; 


const configShape = {
	baseAssets: ['string'],
	quotedAsset: 'string',
	runInterval: 'runInterval',
	initialBalances: 'map(number)',
	startDate: 'number',
	endDate: 'number',
	fees: 'number',
	slippage: 'number'
};

const quickResultsShape = {
	netProfitPercent: 'number',
	maxDropdownPercent: 'number',
	exposurePercent: 'number'
}