import * as React from 'react'
import { ModelBacktest } from '../../../../../../lambdas/model.types';
import styles from './_BacktestListItem.module.css';

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
				<div>v{backtest.versionNumber}</div>
				<div>{backtest.createdAt}</div>
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
