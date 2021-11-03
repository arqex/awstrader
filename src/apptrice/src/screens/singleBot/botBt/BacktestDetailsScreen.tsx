import memoizeOne from 'memoize-one';
import * as React from 'react'
import { BacktestConfig } from '../../../../../lambdas/model.types';
import { ChartableDeployment } from '../../../common/charts/chart.types';
import ChartWithOrders from '../../../common/charts/ChartWithOrders';
import { ScreenWrapper, Tabs, Tab } from '../../../components';
import { fullBacktestLoader } from '../../../state/loaders/fullBacktest.loader'
import { StoreBacktest, BtDeploymentDetails } from '../../../state/stateManager';
import PortfolioHistoryWidget from '../../singleDeployment/stats/widgets/PortfolioHistoryWidget';
import ReturnsWidget from '../../singleDeployment/stats/widgets/ReturnsWidget';
import StatsWidget from '../../singleDeployment/stats/widgets/stats/StatsWidget';
import { BotScreenProps } from '../BotScreenProps'
import styles from './_BacktestDetsilsScreen.module.css';

interface BacktestDetailsScreenProps extends BotScreenProps {
	backtestId: string
}
export default class BacktestDetailsScreen extends React.Component<BacktestDetailsScreenProps> {
	render() {
		const {data:bt} = fullBacktestLoader(this.props.backtestId);
		if( !bt || !bt.fullResults ) return <span>Loading...</span>;


		console.log( bt );
		return (
			<ScreenWrapper title="Backtest">
				<div className={styles.container}>
					{ this.renderTabs() }
					{ this.renderContent(bt) }
				</div>
			</ScreenWrapper>
		);
	}
	renderTabs() {
		return (
			<div className={styles.tabs}>
				<Tabs active={ this.getSelectedTab() }>
					<Tab id="overview" link={ this.getSectionLink('overview') }>Overview</Tab>
					<Tab id="orders" link={ this.getSectionLink('orders') }>Orders</Tab>
				</Tabs>
			</div>
		);
	}
	renderContent(bt: StoreBacktest) {
		if( this.isOrdersSection() ){
			return this.renderOrders(bt);
		}
		return this.renderOverview(bt)
	}

	renderOverview(bt: StoreBacktest){
		if( !bt || !bt.fullResults ) return <span>Loading...</span>;
		return (
			<div className={styles.container}>
				<div className={styles.main}>
					<div className={styles.table}>
						<StatsWidget
							id={bt.id}
							currency={bt.config.quotedAsset}
							stats={bt.fullResults?.stats} />
					</div>
					<div className={styles.returns}>
						<ReturnsWidget
							/* @ts-ignore */
							deployment={this._getDeployment(bt)} />
					</div>
				</div>
				<PortfolioHistoryWidget
					/* @ts-ignore */
					deployment={this._getDeployment(bt)} />
			</div>
		);
	}

	renderOrders(bt: StoreBacktest){
		console.log(bt);
		if( !bt.fullResults?.deploymentDetails ){
			return (
				<div className={styles.container}>
					Detailed data about orders is not available.
				</div>
			);
		}

		const {exchange, deploymentDetails} = bt.fullResults;

		return (
			<div className={styles.container}>
				<ChartWithOrders
					deployment={ this.getChartableDeployment(bt.config, deploymentDetails) }
					exchangeProvider={ exchange.provider } />
			</div>
		);
	}

	getChartableDeployment( config: BacktestConfig, details: BtDeploymentDetails ): ChartableDeployment {
		return memoGetChartable(config, details );
	}

	_getDeployment = memoizeOne( (bt: StoreBacktest) => {
		return {
			...bt.fullResults?.lightDeployment,
			state: {}
		};
	})

	getOrdersLink(){
		return '/#' + this.props.router.location.pathname + '?section=orders';
	}

	isOrdersSection() {
		return this.props.router.location.query.section === 'orders';
	}

	getSectionLink( section: string ) {
		let path = this.props.router.location.pathname;
		if( section !== 'overview' ){
			return `${path}?section=${section}`;
		}
		return path;
	}

	getSelectedTab() {
		if( this.isOrdersSection() ) return 'orders';
		return 'overview';
	}
}


const memoGetChartable = memoizeOne( (config: BacktestConfig, details: BtDeploymentDetails ) => {
	const interval: [number,number] = [config.startDate, config.endDate];

	return {
		pairs: config.baseAssets.map( asset => `${asset}/${config.quotedAsset}`),
		runInterval: config.runInterval,
		orders: details.orders,
		plotterData: details.plotterData,
		activeIntervals: [interval],
		lastRunAt: config.endDate
	};
})