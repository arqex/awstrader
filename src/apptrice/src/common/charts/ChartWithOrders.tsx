import memoizeOne from 'memoize-one';
import * as React from 'react'
import { Orders } from '../../../../lambdas/lambda.types';
import { DeploymentOrders, ExchangeProvider, Order } from '../../../../lambdas/model.types';
import arrayize from '../../../../lambdas/_common/utils/arrayize';
import OrderList from '../orderList/OrderList';
import { ChartableDeployment } from './chart.types';
import DeploymentCharts from './DeploymentCharts';
// import styles from './_ChartWithOrders.module.css';

interface ChartWithOrdersProps {
	deployment: ChartableDeployment,
	exchangeProvider: ExchangeProvider,
	activePair?: string,
	onPairChange?: (activePair:string) => any
}

export default class ChartWithOrders extends React.Component<ChartWithOrdersProps> {
	state = {
		activePair: this.props.deployment.pairs[0]
	}

	render() {
		const {exchangeProvider, deployment} = this.props;
		return (
			<div>
				<DeploymentCharts
					selector="dropdown"
					exchangeProvider={ exchangeProvider }
					deployment={ deployment }
					activePair={ this.state.activePair }
					onChange={ this._onPairChange } />
				<OrderList orders={ this.getOrders() } />
			</div>
		)
	}

	_onPairChange = (activePair: string) => {
		if( this.props.onPairChange ){
			this.props.onPairChange(activePair);
		}
		else {
			this.setState({activePair});
		}
	}

	getActivePair(){
		return this.props.activePair || this.state.activePair;
	}

	getOrders() {
		return memoOrders( this.props.deployment.orders, this.getActivePair() );
	}
}

const memoOrders = memoizeOne( (allOrders: DeploymentOrders, activePair: string ): Orders => {
	return arrayize<Order>( allOrders.items ).filter( (it: Order) => (
		it.pair === activePair
	));
});
