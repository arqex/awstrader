import * as React from 'react'
import { ModelBacktest } from '../../../../../../lambdas/model.types';
import BacktestListItem from './BacktestListItem';
import styles from './_BacktestList.module.css';

interface BacktestListProps {
	backtests: ModelBacktest[],
	onBtClicked: (bt: ModelBacktest) => void,
	onBtSelected: (bt: ModelBacktest) => void,
	activeBts: {[id:string]: boolean}
}

export default class BacktestList extends React.Component<BacktestListProps> {
	render() {
		return (
			<div className={styles.container}>
				{ this.props.backtests.map( this._renderItem ) }
			</div>
		);
	}

	_renderItem = ( bt: ModelBacktest ) => {
		return (
			<BacktestListItem
				backtest={bt}
				onClick={ this.props.onBtClicked }
				onSelect={ this.props.onBtSelected }
				isActive={ this.props.activeBts[bt.id] } />
		);
	}
}
