import { ModelExchange } from "../../../model.types";

export default function toExchangeResponse( exchange: ModelExchange ): ModelExchange {
	let key = exchange.credentials?.key;
	return {
		...exchange,
		credentials: {
			key: key ? key.slice(0, 5) + '...' : ''
		}
	}
}