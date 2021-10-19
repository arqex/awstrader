import memoizeOne from 'memoize-one'
import * as React from 'react'
import { RunnableDeployment } from '../../../../../../../lambdas/model.types'
import { getStats } from '../../../../../common/deplotymentStats/statsCalculator';
import StatsWidget from './StatsWidget';

interface StatsWidgetProps {
	deployment: RunnableDeployment
}

export default class StatsWidgetFromDeployment extends React.Component<StatsWidgetProps> {
	render() {
		const {deployment} = this.props;
		return (
			<StatsWidget
				id={deployment.id}
				currency={deployment.pairs[0].split('/')[1]}
				stats={ this._getStats(deployment) } />
		);
	}

	_getStats = memoizeOne( (deployment: RunnableDeployment) => {
		return getStats(deployment);
	})
}
