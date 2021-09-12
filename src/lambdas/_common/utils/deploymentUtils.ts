import { BasicBotDeploymentStats, FullBotDeployment, PortfolioWithPrices, ModelBotDeployment, BaseBotDeployment } from "../../model.types";

export function isNewDeployment( deployment: FullBotDeployment ){
	return deployment.state?.newState === 'stateNew';
}

export function isActiveDeployment( {active}: ModelBotDeployment ): boolean{
	return active;
}

export function getActivatedDeployment<T extends BaseBotDeployment>( currentDeployment: T ): T{
	let activeIntervals = [...(currentDeployment.activeIntervals||[])];
	let [lastActiveInterval] = activeIntervals.slice(-1);
	if( !lastActiveInterval || lastActiveInterval.length === 2 ){
		activeIntervals.push([Date.now()]);
		return {
			...currentDeployment,
			active: true,
			activeIntervals
		};
	}
	return currentDeployment;
}

export function getDeactivatedDeployment<T extends BaseBotDeployment>( currentDeployment: T ){
	let activeIntervals = [...(currentDeployment.activeIntervals||[])];
	let [lastActiveInterval] = activeIntervals.slice(-1);
	if( lastActiveInterval && lastActiveInterval.length === 1 ){
		lastActiveInterval.push(Date.now());
		return {
			...currentDeployment,
			active: false,
			activeIntervals
		};
	}
	return currentDeployment;
}

export function getDeploymentAssets( pairs: string[] ){
	return {
		quotedAsset: pairs[0].split('/')[1],
		baseAssets: pairs.map( (s: string) => s.split('/')[0] )
	};
}

export function getPortfolioValue( portfolio: PortfolioWithPrices ){
	let total = 0;
	Object.keys( portfolio ).forEach( asset => {
		const balance = portfolio[asset];
		total += balance.total * balance.price;
	});
	return total;
}

const DAY = 24 * 60 * 60 * 1000;
export function getUpdatedDeploymentStats( portfolio: PortfolioWithPrices, stats?: BasicBotDeploymentStats ) {
	let updated: BasicBotDeploymentStats = stats ?
		{...stats} :
		{ startingBalances: portfolio, lastWeekPortfolio: [] }
	;

	if( !updated.lastWeekPortfolio.length ){
		updated.lastWeekPortfolio = [
			{date: Date.now(), balances: portfolio },
			{date: Date.now(), balances: portfolio },
		]
	}
	else {
		let [last] = updated.lastWeekPortfolio.slice(-1);
		let [previous] = updated.lastWeekPortfolio.slice(-2);
		if( last.date - previous.date > DAY ){
			updated.lastWeekPortfolio.push({date: Date.now(), balances: portfolio });
			if( updated.lastWeekPortfolio.length > 7 ){
				updated.lastWeekPortfolio.slice(-7)
			}
		}
		else {
			updated.lastWeekPortfolio[updated.lastWeekPortfolio.length-1] = {date: Date.now(), balances: portfolio };
		}
	}

	return updated;
}
