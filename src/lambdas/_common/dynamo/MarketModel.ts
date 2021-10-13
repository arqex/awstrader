import { Market } from "../markets/market.types";
import { DBModel } from "./db";

const Db = new DBModel<Market>({
	tableName: process.env.MARKETS_TABLE,
	pkName: 'exchangeId',
	skName: 'symbolId'
});

export default {
	getSingle( exchangeId:string, symbolId: string ){
		return Db.getSingle(exchangeId, symbolId);
	},
	update( market: Market ){
		const {exchangeId, symbolId, ...update} = market;
		return Db.update(exchangeId, symbolId, update);
	}
}