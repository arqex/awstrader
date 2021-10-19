import memoizeOne from 'memoize-one'
import * as React from 'react'
import { FullStats } from '../../../../../common/deplotymentStats/statsCalculator'
import StatTable from '../../../../../common/deplotymentStats/StatTable'

interface StatsWidgetProps {
	id: string,
	currency: string,
	stats: FullStats
}

export default class StatsWidget extends React.Component<StatsWidgetProps> {
	render() {
		const {id, stats, currency} = this.props;
		return (
			<StatTable
				columns={ this._getColumns(id ,stats ) }
				currency={ currency } />
		)
	}

	_getColumns = memoizeOne((id, stats: FullStats) => {
		return [{
			id: id,
			header: 'Backtest',
			stats: stats
		}];
	})
}