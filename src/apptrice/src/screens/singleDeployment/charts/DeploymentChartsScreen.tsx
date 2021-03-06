import * as React from 'react'
import { FullBotDeployment } from '../../../../../lambdas/model.types';
import DeploymentCharts from '../../../common/charts/DeploymentCharts';
import { ScreenWrapper } from '../../../components';
import { SingleDeploymentScreenProps } from '../SingleDeploymentScreenProps';
// import styles from './_DeploymentChartsScreen.module.css';

export default class DeploymentChartsScreen extends React.Component<SingleDeploymentScreenProps> {
	state = {
		activeTab: ''
	}

	render() {
		const {deployment} = this.props;

		return (
			<ScreenWrapper title="Charts">
				{ this.renderContent( deployment ) }
			</ScreenWrapper>
		)
	}

	renderContent(deployment: FullBotDeployment) {
		return (
			<DeploymentCharts
				exchangeProvider="bitfinex"
				deployment={ deployment } />
		);
	}

	getDeploymentId() {
		return this.props.router.location.params.id;
	}

	componentDidMount() {

	}

	componentDidUpdate() {

	}
}
