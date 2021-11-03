import { ArrayCandle, CandleAttribute } from "../../lambda.types";
import { atr } from "./atr";
import { ema } from "./ema";

interface KeltnerChannelOptions {
	maPeriod?: number
	atrPeriod?: number,
	bandMultiplier?: number
}

export function keltner(data: ArrayCandle[], options?: KeltnerChannelOptions, attr?: CandleAttribute) {
	const {maPeriod, atrPeriod, bandMultiplier} = {
		...{maPeriod: 20, atrPeriod: 10, bandMultiplier: 1},
		...(options || {})
	};

	const emaData = ema(data, maPeriod, attr);
	const atrData = atr(data, atrPeriod);
	return emaData.map( (ema,i) => ({
		middle: ema,
		upper: ema + (bandMultiplier * atrData[i]),
		lower: ema - (bandMultiplier * atrData[i])
	}));
}