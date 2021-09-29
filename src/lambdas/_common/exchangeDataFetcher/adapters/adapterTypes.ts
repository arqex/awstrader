import { ArrayCandle } from "../../../lambda.types";
import { CandleQuery } from "../../exchanges/ExchangeAdapter";

export interface DataFetcherInput extends CandleQuery {
	exchange: string
}


export interface DataFetcher {
	fetch: (input: DataFetcherInput) => Promise<ArrayCandle[]>
}