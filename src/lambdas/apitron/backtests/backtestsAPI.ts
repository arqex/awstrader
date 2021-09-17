import { mutationHandler, queryHandler } from "../utils/RequestHandler";
import createBacktestHandler from "./createBacktest";
import getBotBacktestsHandler from "./getBotBacktests";

const backtestsAPI = {
	initialize( app: any ){
		app.post('/bots/:botId/backtests', function(req, res) {
			return mutationHandler( req, res, createBacktestHandler);
		});

		app.get('/bots/:botId/backtests', function(req, res) {
			return queryHandler( req, res, getBotBacktestsHandler );
		});
	}
}

export default backtestsAPI;