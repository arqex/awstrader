import * as React from 'react'
import { ModelBacktest } from '../../../../../lambdas/model.types';
import { botBacktestsLoader } from '../../../state/loaders/botBacktests.loader';
import { BotScreenProps } from '../BotScreenProps';
import BacktestList from './components/BacktestList';
import styles from './_BacktestsScreen.module.css';

export default class BacktestsScreen extends React.Component<BotScreenProps> {
	render() {
		let {data: backtests} = botBacktestsLoader( this.props.bot.id );
		if( !backtests ){
			return <span>Loading...</span>;
		}

		return (
			<div className={styles.container}>
				<span>Backtests</span>
				<BacktestList
					backtests={backtests}
					onBtClicked={this._onBtClicked}
					onBtSelected={this._onBtSelected}
					activeBts={{}} />
			</div>
		);
	}

	_onBtClicked = (bt: ModelBacktest) => {

	}

	_onBtSelected = (bt: ModelBacktest) => {

	}
}
