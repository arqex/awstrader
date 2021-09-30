import * as React from 'react'
import { ExchangeProvider } from '../../../../lambdas/model.types';
import { InputGroup } from '../../components';
import styles from './_CreateExchangeForm.module.css';

interface ExchangeCredentialsEditorProps {
	provider: ExchangeProvider,
	credentials: any
	onChange: (credentials: any) => any
}

export default class ExchangeCredentialsEditor extends React.Component<ExchangeCredentialsEditorProps> {
	render() {
		const {provider} = this.props;
		if( provider === 'bitfinex' ){
			return this.renderSimpleCredentials();
		}
		
		return this.renderCredentialsWithPassphrase();
	}

	renderSimpleCredentials(){
		return (
			<div>
				<div className={styles.inputWrapper}>
					{ this.renderKey() }
				</div>
				<div className={styles.inputWrapper}>
					{ this.renderSecret() }
				</div>
			</div>
		)
	}

	renderCredentialsWithPassphrase(){
		return (
			<div>
				<div className={styles.inputWrapper}>
					{ this.renderKey() }
				</div>
				<div className={styles.inputWrapper}>
					{ this.renderSecret() }
				</div>
				<div className={styles.inputWrapper}>
					{ this.renderPassphrase() }
				</div>
			</div>
		)
	}

	renderKey() {
		return (
			<InputGroup
				name="key"
				label="API key">
				<input name="key"
					value={this.props.credentials.key}
					onChange={this._updateKey} />
			</InputGroup>
		)
	}

	renderSecret() {
		return (
			<InputGroup
				name="secret"
				label="API secret">
				<input name="secret"
					type="password"
					value={this.props.credentials.secret}
					onChange={this._updateSecret} />
			</InputGroup>
		)
	}

	renderPassphrase() {
		return (
			<InputGroup
				name="passphrase"
				label="Key passphrase">
				<input name="passphrase"
					type="password"
					value={this.props.credentials.passphrase || ''}
					onChange={this._updatePassphrase} />
			</InputGroup>
		)

	}

	_updateKey = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.update('key', e.target.value);
	}

	_updateSecret = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.update('secret', e.target.value);
	}

	_updatePassphrase = (e: React.ChangeEvent<HTMLInputElement>) => {
		this.update('passphrase', e.target.value);
	}

	update( field: string, value: string ){
		this.props.onChange({
			...this.props.credentials,
			[field]: value
		});
	}

	componentDidMount(){
		let credentials: any = {
			key: '',
			secret: ''
		}
		if( this.props.provider === 'kucoin' ){
			credentials.passphrase = ''
		}
		this.props.onChange(credentials);
	}

	componentDidUpdate( prevProps: ExchangeCredentialsEditorProps ){
		let prevProvider = prevProps.provider;
		let {provider, credentials, onChange} = this.props;
		if( provider !== prevProvider ){
			if( provider === 'kucoin' ){
				onChange({
					...credentials,
					passphrase: ''
				})
			}
			else if( prevProvider === 'kucoin' ){
				const {key, secret} = credentials;
				onChange({key, secret});
			}
		}
	}
}
