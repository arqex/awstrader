import * as React from 'react'
import { ExchangeProvider } from '../../../../lambdas/model.types';
import { Button, Controls, InputGroup } from '../../components';
import Toaster from '../../components/toaster/Toaster';
import { FormErrors } from '../../types';
import ExchangeCredentialsEditor from './ExchangeCredentialsEditor';
import styles from './_CreateExchangeForm.module.css';

export interface CreateExchangePayload {
	name: string
	provider: ExchangeProvider
	credentials: any
}

interface CreateExchangeFormProps {
	onClose: () => any
	onCreate: ( exchange: CreateExchangePayload ) => Promise<any>
}

interface CreateExchangeFormState {
	name: string
	provider: ExchangeProvider
	credentials: any,
	errors: {[key: string]: string}
	creating: boolean
}

export default class CreateExchangeForm extends React.Component<CreateExchangeFormProps> {
	state: CreateExchangeFormState = {
		name: '',
		provider: 'bitfinex',
		credentials: {
			key: '',
			secret: ''
		},
		errors: {},
		creating: false
	}
	render() {
		return (
			<div className={styles.container}>
				<div className={styles.titleWrapper}>
					<h3>Link exchange</h3>
				</div>
				<div className={styles.inputWrapper}>
					<InputGroup
						name="name"
						label="Give this account a name">
						<input name="name"
							value={this.state.name}
							onChange={e => this.setState({ name: e.target.value })} />
					</InputGroup>
				</div>
				<div className={styles.inputWrapper}>
					<InputGroup
						name="provider"
						label="Select a exchange">
						<select name="provider"
							value={this.state.provider}
							onChange={e => this.setState({ provider: e.target.value })}>
								<option value="bitfinex">Bitfinex</option>
								<option value="kucoin">Kucoin</option>
						</select>
					</InputGroup>
				</div>
				<ExchangeCredentialsEditor
					provider={this.state.provider}
					credentials={ this.state.credentials }
					onChange={(credentials:any) => this.setState({credentials})} />
				<div className={styles.controls}>
					<Controls>
						<Button size="s"
							color="transparent"
							onClick={ this.props.onClose }
							disabled={ this.state.creating }>
							Cancel
						</Button>
						<Button size="s"
							onClick={ this._onCreate }
							loading={ this.state.creating }>
							Link exchange
						</Button>
					</Controls>
				</div>
			</div>
		);
	}

	_onCreate = () => {
		let errors = this.getValidationErrors();
		this.setState({errors});
		if( Object.keys(errors).length ){
			return Toaster.show('There are errors in the form');
		}

		const {name, provider, credentials } = this.state;
		this.setState({creating: true});
		this.props.onCreate({name,provider,credentials}).then( res => {
			setTimeout( 
				() => this.mounted && this.setState({creating: false}),
				200
			);
		});
	}

	getValidationErrors() {
		let errors: FormErrors = {};

		if( !this.state.name ){
			errors.name = {type: 'error', message: 'Please set a name for the exchange account.'}
		}
		if( !this.state.credentials.key ){
			errors.key = {type: 'error', message: 'Please type the API key to connect to the exchange.'}
		}
		if( !this.state.credentials.secret ){
			errors.secret = {type: 'error', message: 'Please type the API secret to connect to the exchange.'}
		}
		return errors;
	}

	mounted = true;
	componentWillUnmount() {
		this.mounted = false;
	}
}
