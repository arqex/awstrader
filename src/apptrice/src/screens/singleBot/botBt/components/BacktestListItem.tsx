import * as React from 'react'
import { ModelBacktest } from '../../../../../../lambdas/model.types';
import styles from './_BacktestListItem.module.css';
import {formatDistance} from 'date-fns';
import trim from '../../../../utils/trim';
import mergeStyles from '../../../../utils/mergeStyles';

interface BacktestListItemProps {
	backtest: ModelBacktest,
	onClick: (bt: ModelBacktest) => void,
	onSelect: (bt: ModelBacktest) => void,
	isActive: boolean
}

export default class BacktestListItem extends React.Component<BacktestListItemProps> {
	render() {
		const {backtest, isActive} = this.props;
		const {baseAssets,quotedAsset,runInterval} = backtest.config;
		const {netProfitPercent,maxDropdownPercent,exposurePercent} = backtest.quickResults;

		const cn = mergeStyles(
			styles.container,
			isActive && styles.active
		)
		
		return (	
			<div className={cn} onClick={this._onClick}>
				<div className={styles.title}>
					<span className={styles.version}>v{backtest.versionNumber}</span>
					<span className={styles.createdAt}>{ formatDistance(backtest.createdAt, Date.now()) } ago</span>
				</div>
				<div className={styles.assets}>
					{baseAssets.join(',')} / {quotedAsset} @ {runInterval}
				</div>
				<div className={styles.stats}>
					{ this.renderProfit(netProfitPercent) }
					<span> - </span>
					<span className={styles.dropdown}>
						↓{trim(maxDropdownPercent)}%
					</span>
					<span> - </span>
					<span className={styles.exposure}>
						Exp {trim(exposurePercent)}%
					</span>
				</div>
			</div>
		)
	}

	renderProfit( profit: number ) {
		let strProfit = trim(profit,2);
		if( profit > 0 ){
			return (
				<span className={styles.positiveProfit}>
					+{strProfit}%
				</span>
			);
		}
		return (
			<span className={styles.negativeProfit}>
				{strProfit}%
			</span>
		);
	}

	_onClick = () => {
		this.props.onClick(this.props.backtest);
	}

	_onSelect = () => {
		this.props.onSelect(this.props.backtest);
	}
}
