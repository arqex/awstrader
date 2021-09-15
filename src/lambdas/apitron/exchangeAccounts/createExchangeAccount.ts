import { ContextResult, Mutation, MutationContextInput, MutationGetterInput, MutationHandler, MutationResponseInput, ResponseResult } from "../apitron.types";
import { validateShape } from "../utils/validators";
import { createId } from "../../_common/utils/resourceId";
import exchanger from "../../_common/exchanges/exchanger";

const createExchangeAccountHandler: MutationHandler = {
	name: 'createExchangeAccount',
	async getContext({body, params, models}: MutationContextInput<any>): Promise<ContextResult> {
		// Validate input
		let {error} = validateShape(body, getValidShape( body.type ));
		if( error ) return {error: {...error, code: 'invalid_payload'}};

		let account = await models.account.getSingle(body.accountId);
		if( !account ){
			return {error: {code: 'unknown_account'}};
		}

		return {context: {}};
	},

	getMutations(input: MutationGetterInput): Mutation[] {
		const {accountId, provider, type, key, secret, name, initialBalances} = input.body;
		let data = {
			id: createId(),
			createdAt: Date.now(),
			accountId, provider, type, key, secret, name, initialBalances
		}

		if( type === 'real' ){
			data.secret = exchanger.getEncodedSecret(input.body);
			console.log('SECRET', data.secret);
		}

		return [{
			model: 'exchangeAccount',
			action: 'create',
			data
		}];
	},

	getResponse(input: MutationResponseInput): ResponseResult {
		let {id,accountId} = input.mutations[0].data;
		return {
			status: 201,
			data: {id: `${id}${accountId}` }
		};
	}
}

export default createExchangeAccountHandler;


function getValidShape( type ){
	if( type === 'real' ){
		return {
			name: 'string',
			accountId: 'string',
			provider: 'provider',
			type: 'providerType',
			key: 'string',
			secret: 'string'
		};
	}

	return {
		name: 'string',
		accountId: 'string',
		provider: 'provider',
		type: 'providerType',
		initialBalances: 'portfolio'
	};
}