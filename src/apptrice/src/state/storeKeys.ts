import { CandleOptions } from "./apiClient";

export interface BotVersionDescriptor {
	botId: string,
	versionNumber: string
}

export function getVersionKey( descriptor: BotVersionDescriptor ){
	return `${descriptor.botId}:${descriptor.versionNumber}`;
}

export function getCandlesKey( {provider, pair, runInterval, startDate, endDate}: CandleOptions ){
	return `${provider}:${pair}:${runInterval}:${startDate}:${endDate}`;
}