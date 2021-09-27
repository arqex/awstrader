import * as React from 'react'
// import styles from './_DeploymentsScreen.module.css';
import { ScreenProps } from '../../types';
import { Button, ButtonList, DropDownButton, ScreenWrapper, Spinner, Table, Card, Modal, ModalBox } from '../../components';
import { TableColumn } from '../../components/table/Table';
import apiCacher from '../../state/apiCacher';
import Toaster from '../../components/toaster/Toaster';
import CreateDeploymentForm, { CreateDeploymentPayload } from './CreateDeploymentForm';
import { CreateExchangeAccountInput } from '../../state/apiClient';
import arrayize from '../../../../lambdas/_common/utils/arrayize';
import { Portfolio } from '../../../../lambdas/lambda.types';
import { isActiveDeployment } from '../../../../lambdas/_common/utils/deploymentUtils';
import { deploymentListLoader } from '../../state/loaders/deploymentList.loader';
import { getAuthenticatedId } from '../../state/selectors/account.selectors';
import { ModelBotDeployment } from '../../../../lambdas/model.types';
import UpdateVersionForm from './UpdateVersionForm';

interface DeploymentsScreenState {
	loadingItems: {[id:string]: boolean},
	createModalOpen: boolean,
	updatingDeploymentVersion: false | ModelBotDeployment
}

export default class DeploymentsScreen extends React.Component<ScreenProps> {
	state = {
		loadingItems: {},
		createModalOpen: false,
		updatingDeploymentVersion: false
	}

	render() {
		let Subscreen = this.getSubscreen();
		if( Subscreen ){
			return <Subscreen { ...this.props } />
		}

		return (
			<ScreenWrapper title="Deployments" titleExtra={ this.renderCreateButton() } >
				<div>
					{ this.renderDeployments() }
					{ this.renderCreateModal() }
					{ this.renderUpdateVersionModal() }
				</div>
			</ScreenWrapper>
		);
	}

	renderCreateButton() {
		return (
			<Button size="s"
				onClick={ () => this.setState({createModalOpen: true}) }>
				Create new deployment
			</Button>
		);
	}

	renderDeployments() {
		const { data, isLoading } = deploymentListLoader(getAuthenticatedId() || '');
		if( isLoading || !data ) return 'Loading...';

		return (
			<Table
				data={ data }
				keyField="id"
				columns={ this.getColumns() }
				disabledItems={ this.state.loadingItems }
				noElementsMessage={ this.renderNoElements() }
				onRowClick={ (item: ModelBotDeployment) => this.props.router.push(`/deployments/${item.id}`)}
			/>
		);
	}

	renderNoElements() {
		return (
			<Card>
				No deployments yet.
			</Card>
		)
	}

	renderCreateModal() {
		return (
			<Modal open={this.state.createModalOpen}
				onClose={() => this.setState({ createModalOpen: false })}>
				{() => (
					<ModalBox>
						<CreateDeploymentForm
							accountId={this.props.authenticatedId}
							onClose={() => this.setState({ createModalOpen: false })}
							onCreate={this._onCreateDeployment} />
					</ModalBox>
				)}
			</Modal>
		)
	}

	renderUpdateVersionModal() {
		const {updatingDeploymentVersion} = this.state;

		return (
			<Modal open={updatingDeploymentVersion}
				onClose={() => this.setState({updatingDeploymentVersion: false})}>
				{ () => (
					<ModalBox>
						<UpdateVersionForm
							/* @ts-ignore */ 
							deployment= {updatingDeploymentVersion}
							onClose={() => this.setState({ updatingDeploymentVersion: false})}
							onUpdateVersion={this._onUpdateVersion} />
					</ModalBox>
				)}
			</Modal>
		)
	}

	getColumns(): TableColumn<ModelBotDeployment>[] {
		return [
			{ field: 'id', renderFn: this._renderId },
			{ field: 'name' },
			{ field: 'botId', title: 'bot', renderFn: this._renderBot },
			{ field: 'version'},
			{ field: 'active', title: '', renderFn: this._renderActive },
			{ field: 'controls', title: '', renderFn: this._renderControls, noSort: true }
		];
	}

	_renderId = (item: ModelBotDeployment ) => {
		return <span>{item.id.slice(0,8)}</span>;
	}

	_renderBot = (item: ModelBotDeployment) => {
		return <span>{item.botId.slice(0,8)}</span>;
	}

	_renderActive = (item: ModelBotDeployment) => {
		return <span>{isActiveDeployment(item) ? 'Active' : 'Inactive'}</span>;
	}

	_renderControls = (item: ModelBotDeployment) => {
		// @ts-ignore
		if (this.state.loadingItems[item.id]) {
			return <Spinner color="#fff" />;
		}

		const isActive = isActiveDeployment(item);
		let buttons = [
			{ label: 'Update bot version', value: 'updateVersion' },
			{
				label: isActive ? 'Deactivate' : 'Activate',
				value: isActive ? 'deactivate' : 'activate'
			},
			{ label: 'Delete this deployment', value: 'delete' }
		];

		return (
			<div onClick={(e:any) => e.stopPropagation()}>
				<DropDownButton closeOnClick={true}>
					<ButtonList buttons={buttons}
						onButtonPress={(action: string) => this._onDeploymentAction(item, action)}
					/>
				</DropDownButton>
			</div>
		);
	}

	_onDeploymentAction = (item: ModelBotDeployment, action: string) => {
		const {authenticatedId} = this.props;
		if( action === 'activate' ){
			this.setState({loadingItems: {[item.id]: true}});
			apiCacher.updateDeployment( item.id, {active: true})
				.then( () => {
					this.setState({loadingItems: {}});
				})
			;
		}
		else if (action === 'deactivate') {
			this.setState({ loadingItems: { [item.id]: true } });
			apiCacher.updateDeployment(item.id, { active: false })
				.then(() => {
					this.setState({ loadingItems: {} });
				})
			;
		}
		else if (action === 'delete') {
			this.setState({ loadingItems: { [item.id]: true } });
			apiCacher.deleteDeployment(authenticatedId, item.id)
				.then(() => {
					this.setState({ loadingItems: {} });
				})
			;
		}
		else if (action === 'updateVersion') {
			this.setState({updatingDeploymentVersion: item});
		}
	}

	_onCreateDeployment = ( data: CreateDeploymentPayload ) => {
		if( data.exchangeAccountId === 'virtual' ){
			return this.createExchangeAccount( data )
				.then( (exchangeId: string) => {
					// @ts-ignore
					let payload: CreateDeploymentPayload = arrayize(data).filterKeys(
						['accountId', 'name', 'botId', 'version', 'pairs', 'active', 'runInterval']
					);
					payload.exchangeAccountId = exchangeId;
					return this.createDeployment(payload);
				})
			;
		}

		return this.createDeployment( data );
	}

	_onUpdateVersion = ( deploymentId: string, version: string) => {
		return apiCacher.updateDeployment(deploymentId, {version})
			.then( () => {
				this.setState({updatingDeploymentVersion: false})
			})
		;
	}

	createDeployment(data: CreateDeploymentPayload) {
		return apiCacher.createDeployment(data).then(res => {
			if (!res.data?.error) {
				this.setState({ createModalOpen: false });
				Toaster.show('The bot has been deployed', 'success');
			}
		});
	}

	createExchangeAccount(data: CreateDeploymentPayload): Promise<string> {
		const balances: Portfolio = arrayize<string>(data.initialBalances)
			.map((balance: string, asset: string) => ({
				asset,
				free: parseFloat(balance),
				total: parseFloat(balance)
			}))
		;

		const payload: CreateExchangeAccountInput = {
			name: data.name + ' virtual exchange',
			accountId: data.accountId,
			provider: data.exchange || 'unknown',
			type: 'virtual',
			initialBalances: balances
		}

		return apiCacher.createExchangeAccount(payload)
			.then(res => {
				return res.data.id;
			})
		;
	}

	getSubscreen() {
		return this.props.router.location.matches[1];
	}
}