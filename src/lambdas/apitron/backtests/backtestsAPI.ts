import { mutationHandler, queryHandler } from "../utils/RequestHandler";
import createBacktestHandler from "./createBacktest";
import getBacktestDataHandler from "./getBacktestData";
import getBotBacktestsHandler from "./getBotBacktests";

const backtestsAPI = {
	initialize( app: any ){
		app.post('/bots/:botId/backtests', function(req, res) {
			return mutationHandler( req, res, createBacktestHandler);
		});

		app.get('/bots/:botId/backtests', function(req, res) {
			return queryHandler( req, res, getBotBacktestsHandler );
		});

		app.get('/backtests/:backtestId/details', function(req,res) {
			return queryHandler( req, res, getBacktestDataHandler);
		})
	}
}

export default backtestsAPI;