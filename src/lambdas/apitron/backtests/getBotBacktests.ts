import { QueryContextInput, QueryHandler, ContextResult, QueryResponseInput, ResponseResult } from "../apitron.types";

const getBotBacktestsHandler: QueryHandler = {
	name: 'getBotBacktests',
	async getContext({ params, models }: QueryContextInput): Promise<ContextResult> {
		console.log('WE ARE GETTING BACKTESTS');
		let bot = await models.bot.getSingle(params.botId);
		if( !bot ){
			return { error: { code: 'not_found', reason: 'bot not found'} };
		}

		let backtests = await models.backtest.getBotBacktests(bot.id);
		return {context: backtests};
	},

	getResponse({ context }: QueryResponseInput): ResponseResult {
		return {status: 200, data: context};
	}
}

export default getBotBacktestsHandler;