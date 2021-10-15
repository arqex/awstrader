import { QueryContextInput, QueryHandler, ContextResult, QueryResponseInput, ResponseResult } from "../apitron.types";

const getBacktestDataHandler: QueryHandler = {
	name: 'getBacktestData',
	async getContext({ params, models }: QueryContextInput): Promise<ContextResult> {
		const {backtestId} = params;
		const backtest = await models.backtest.getSingle(backtestId);

		if( !backtest ){
			return {error: {code: 'not_found', status: 404}};
		}

		let fullData = await models.backtest.getFullResults(backtest.fullResultsPath);
		console.log('Full datA', fullData);
		return {context: {fullData}};
	},

	getResponse({ params, context }: QueryResponseInput): ResponseResult {
		return {status: 200, data: context.fullData};
	}
}

export default getBacktestDataHandler;