import * as React from 'react'
import { ModelBacktest } from '../../../../../lambdas/model.types';
import { botBacktestsLoader } from '../../../state/loaders/botBacktests.loader';
import { BotScreenProps } from '../BotScreenProps';
import BacktestList from './components/BacktestList';
import styles from './_BacktestsScreen.module.css';

export default class BacktestsScreen extends React.Component<BotScreenProps> {
	state = {
		selected: []
	}
	render() {
		let {data: backtests} = botBacktestsLoader( this.props.bot.id );
		if( !backtests ){
			return <span>Loading...</span>;
		}

		return (
			<div className={styles.container}>
				<div className={styles.leftBar}>
					<BacktestList
						backtests={backtests}
						onBtClicked={this._onBtClicked}
						onBtSelected={this._onBtSelected}
						activeBts={{}} />
				</div>
				<div className={styles.content}>
					{ this.renderContent() }
				</div>
			</div>
		);
	}

	renderContent() {
		let {location} = this.props.router;
		let Subscreen = location.matches[3];
		if( !Subscreen ){
			return <span>Select a backtest from the left list.</span>
		}

		return (
			<Subscreen
				{...this.props}
				backtestId={location.params.btid}
				selectedBts={this.state.selected} />
		);
	}

	_onBtClicked = (bt: ModelBacktest) => {
		const {botId, id} = bt
		this.props.router.push(
			`/bots/${botId}/backtests/${id}`
		);
	}

	_onBtSelected = (bt: ModelBacktest) => {

	}
}
