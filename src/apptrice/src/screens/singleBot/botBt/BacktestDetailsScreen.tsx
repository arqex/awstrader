import memoizeOne from 'memoize-one';
import * as React from 'react'
import { ScreenWrapper } from '../../../components';
import { fullBacktestLoader } from '../../../state/loaders/fullBacktest.loader'
import { StoreBacktest } from '../../../state/stateManager';
import PortfolioHistoryWidget from '../../singleDeployment/stats/widgets/PortfolioHistoryWidget';
import ReturnsWidget from '../../singleDeployment/stats/widgets/ReturnsWidget';
import StatsWidget from '../../singleDeployment/stats/widgets/stats/StatsWidget';
import { BotScreenProps } from '../BotScreenProps'
// import styles from './_BacktestDetsilsScreen.module.css';

interface BacktestDetailsScreenProps extends BotScreenProps {
	backtestId: string
}

export default class BacktestDetailsScreen extends React.Component<BacktestDetailsScreenProps> {
	render() {
		const {data:bt} = fullBacktestLoader(this.props.backtestId);
		if( !bt  || !bt.fullResults ) return <span>Loading...</span>;

		console.log( bt );
		return (
			<ScreenWrapper title="Backtest">
				<div>
					<StatsWidget
						id={bt.id}
						currency={bt.config.quotedAsset}
						stats={bt.fullResults?.stats} />
					<PortfolioHistoryWidget
						/* @ts-ignore */
						deployment={this._getDeployment(bt)} />
					<ReturnsWidget
						/* @ts-ignore */
						deployment={this._getDeployment(bt)} />
				</div>
			</ScreenWrapper>
		)
	}

	_getDeployment = memoizeOne( (bt: StoreBacktest) => {
		return {
			...bt.fullResults?.lightDeployment,
			state: {}
		};
	})
}
