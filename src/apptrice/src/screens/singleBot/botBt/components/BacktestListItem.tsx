import * as React from 'react'
import { ModelBacktest } from '../../../../../../lambdas/model.types';
import styles from './_BacktestListItem.module.css';
import {formatDistance} from 'date-fns';

interface BacktestListItemProps {
	backtest: ModelBacktest,
	onClick: (bt: ModelBacktest) => void,
	onSelect: (bt: ModelBacktest) => void,
	isActive: boolean
}

export default class BacktestListItem extends React.Component<BacktestListItemProps> {
	render() {
		const {backtest} = this.props;

		console.log('Rendering backtest', backtest);
		return (
			<div className={styles.container} onClick={this._onClick}>
				<div>
					<span>v{backtest.versionNumber}</span>
					<span>{ formatDistance(backtest.createdAt, Date.now()) }</span>
				</div>
			</div>
		)
	}

	_onClick = () => {
		this.props.onClick(this.props.backtest);
	}

	_onSelect = () => {
		this.props.onSelect(this.props.backtest);
	}
}
