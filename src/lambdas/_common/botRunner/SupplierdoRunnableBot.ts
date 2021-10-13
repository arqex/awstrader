import lambdaUtil from "../utils/lambda";
import { BotRunInput, RunnableBot } from "./BotRunner";

export class SupplierdoRunnableBot implements RunnableBot {
	source: string =  ''

	async prepare( source: string ){
		this.source = source;
	}

	async run( input: BotRunInput ) {
		console.log('Running bot', Object.keys(input));

		return {
			currentDate: Date.now(),
			...( await lambdaUtil.invokeExecutor({
				botSource: this.source,
				...input,
			}))
		};
	}
}