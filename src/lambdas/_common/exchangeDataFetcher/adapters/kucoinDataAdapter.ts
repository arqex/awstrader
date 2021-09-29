import { ArrayCandle } from "../../../lambda.types";
import KucoinAdapter from "../../exchanges/adapters/KucoinAdapter";
import { DataFetcher, DataFetcherInput } from "./adapterTypes";

const dataAdapter: DataFetcher = {
	fetch( input: DataFetcherInput ): Promise<ArrayCandle[]>{
		// @ts-ignore - no need to pass any credential
		let adapter = new KucoinAdapter({});
		return adapter.getCandles(input);
	}
}

export default dataAdapter;