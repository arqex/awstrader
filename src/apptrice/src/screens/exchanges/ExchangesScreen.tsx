import * as React from 'react'
import { ExchangeAccountResponse } from '../../../../lambdas/model.types';
import { Button, ButtonList, DropDownButton, Modal, ModalBox, ScreenWrapper, Spinner, Table } from '../../components';
import { TableColumn } from '../../components/table/Table';
import Toaster from '../../components/toaster/Toaster';
import apiCacher from '../../state/apiCacher';
import { CreateExchangeAccountInput } from '../../state/apiClient';
import { exchangeListLoader } from '../../state/loaders/exchangeListLoader';
import { ScreenProps } from '../../types';
import CreateExchangeForm, {CreateExchangePayload} from './CreateExchangeForm';
// import styles from './_ExchangesScreen.module.css';

interface ExchangeScreenState {
	createModalOpen: boolean,
	loadingItems: { [id: string]: boolean }
}
export default class ExchangesScreen extends React.Component<ScreenProps> {
	state: ExchangeScreenState = {
		createModalOpen: false,
		loadingItems: {}
	}

	render() {
		let { data } = exchangeListLoader(this.props.authenticatedId);
		return (
			<ScreenWrapper title="API accounts" titleExtra={ this.renderCreateButton() }>
				{ data ? this.renderList(data) : 'Loading...' }
				<Modal open={this.state.createModalOpen}
					onClose={ () => this.setState({createModalOpen: false})}>
					{ () => (
						<ModalBox>
							{ this.renderCreateForm() }
						</ModalBox>
					)}
				</Modal>
			</ScreenWrapper>
		);
	}

	renderList(data: any) {
		return (
			<div>
				<Table data={ data }
					columns={ this.getColumns() }
					disabledItems={ this.state.loadingItems } />
			</div>
		);
	}

	renderCreateButton() {
		return (
			<Button size="s" onClick={ () => this.setState({createModalOpen: true})}>
				Link new exchange
			</Button>
		);
	}

	renderCreateForm() {
		return (
			<CreateExchangeForm
				onClose={ () => this.setState({createModalOpen: false}) }
				onCreate={ this._onCreateExchange }/>
		);
	}

	getColumns(): TableColumn<ExchangeAccountResponse>[] {
		return [
			{field: 'id'},
			{field: 'name'},
			{field: 'provider'},
			{field: 'type'},
			{field: 'controls', title: '', renderFn: this._renderControls, noSort: true }
		];
	}

	_renderControls = (item: ExchangeAccountResponse) => {

		if( this.state.loadingItems[item.id] ){
			return <Spinner color="#fff" />;
		}

		let buttons = [
			{label: 'Delete this exchange', value: 'delete'}
		];

		return (
			<DropDownButton closeOnClick={true}>
				<ButtonList buttons={buttons}
					onButtonPress={ (action: string) => this._onExchangeAction(item, action) }
				/>
			</DropDownButton>
		);
	}

	_onExchangeAction = (item: ExchangeAccountResponse, action: string) => {
		if( action === 'delete' ){
			this.setState({loadingItems: {[item.id]: true}});
			apiCacher.deleteExchangeAccount(this.props.authenticatedId, item.id)
				.then( res => {
					this.setState({ loadingItems: {} });
					if( !res.data?.error ){
						Toaster.show('The API account is deleted.', 'success');
					}
				})
			;
		}
	}

	_onCreateExchange = (exchange: CreateExchangePayload ) => {
		let payload: CreateExchangeAccountInput = {
			name: exchange.name,
			accountId: this.props.authenticatedId,
			provider: exchange.provider,
			type: 'real',
			credentials: exchange.credentials
		};

		return apiCacher.createExchangeAccount(payload)
			.then( (res:any) => {
				if( !res.data.error ){
					this.setState({createModalOpen: false});
					Toaster.show('The exchange has been linked.', 'success');
				}
			})
		;
	}
}
