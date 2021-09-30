import * as React from 'react'
import { DbBot, DbExchangeAccount } from '../../../../lambdas/model.types';
import InitialBalances, {Balances} from '../../common/btSettings/InitialBalances';
import { Button, Controls, InputGroup } from '../../components';
import Toaster from '../../components/toaster/Toaster';
import { FormErrors } from '../../types';
import {botListLoader} from '../../state/loaders/botListLoader';
import {exchangeListLoader} from '../../state/loaders/exchangeListLoader';
import styles from './_CreateDeploymentForm.module.css';
import { getBot } from '../../state/selectors/bot.selectors';

export interface CreateDeploymentPayload {
	accountId: string
	name: string
	botId: string
	exchangeAccountId: string
	runInterval: string
	pairs: string[]
	active: boolean
	exchange?: string
	initialBalances?: Balances
}

interface CreateDeploymentFormProps {
	accountId: string
	onClose: () => any
	onCreate: (exchange: CreateDeploymentPayload) => Promise<any>
}

interface CreateDeploymentState {
	name: string,
	botId: string,
	botVersion: string,
	exchangeAccountId: string,
	runInterval: string,
	baseAssets: string,
	quotedAsset: string,
	errors: FormErrors,
	creating: boolean
	exchange: string
	initialBalances: Balances
}

export default class CreateDeploymentForm extends React.Component<CreateDeploymentFormProps> {
	state: CreateDeploymentState = {
		name: '',
		botId: '',
		botVersion: '',
		exchangeAccountId: '',
		runInterval: '1h',
		baseAssets: '',
		quotedAsset: '',
		errors: {},
		creating: false,
		exchange: 'bitfinex',
		initialBalances: {}
	}

	dataLoaded = false;
	render() {
		let accountId = this.props.accountId;
		let { data: bots } = botListLoader(accountId);
		let { data: exchanges } = exchangeListLoader(accountId);
		
		if( !bots || !exchanges ){
			return <span>Loading...</span>;
		} 
		if( !this.dataLoaded ){
			this.dataLoaded = true;
		}

		return (
			<div className={styles.container}>
				<div className={styles.titleWrapper}>
					<h3>Launch a bot</h3>
				</div>

				<div className={styles.inputWrapper}>
					<InputGroup
						name="name"
						label="Name"
						caption={this.state.errors.name}>
						<input name="name"
							value={this.state.name}
							onChange={e => this.setState({ name: e.target.value })} />
					</InputGroup>
				</div>

				<div className={styles.inputWrapper}>
					<InputGroup
						name="botId"
						label="Select a bot">
							{ this.renderBotSelector(bots) }
					</InputGroup>
				</div>

				<div className={styles.inputWrapper}>
					<InputGroup
						name="botVersion"
						label="Select a bot version">
							{ this.renderBotVersionSelector() }
					</InputGroup>
				</div>

				<div className={styles.inputWrapper}>
					<InputGroup
						name="runInterval"
						label="Run interval">
							<select name="runInterval"
								value={this.state.runInterval}
								onChange={e => this.setState({ runInterval: e.target.value })}>
									<option value="1h">Every hour</option>
							</select>
					</InputGroup>
				</div>

				<div className={styles.inputWrapper}>
					<InputGroup
						name="baseAssets"
						label="Target assets to trade"
						caption={ this.state.errors.baseAssets }>
						<input name="baseAssets"
							value={this.state.baseAssets}
							onChange={e => this.setState({ baseAssets: e.target.value })} />
					</InputGroup>
				</div>

				<div className={styles.inputWrapper}>
					<InputGroup
						name="quotedAsset"
						label="Base asset"
						caption={ this.state.errors.quotedAsset }>
						<input name="quotedAsset"
							value={this.state.quotedAsset}
							onChange={e => this.setState({ quotedAsset: e.target.value })} />
					</InputGroup>
				</div>

				<div className={styles.inputWrapper}>
					<InputGroup
						name="botId"
						label="Select a exchange account">
						{this.renderExchangeSelector(exchanges)}
					</InputGroup>
				</div>

				{ this.renderVirtualExchangeOptions()}

				<Controls>
					<Button size="s"
						color="transparent"
						onClick={ this.props.onClose }
						disabled={ this.state.creating }>
						Cancel
					</Button>
					<Button size="s"
						onClick={this._onCreate}
						loading={this.state.creating}>
						Deploy the bot
					</Button>
				</Controls>
			</div>
		)
	}

	renderBotSelector( bots: DbBot[] ) {
		let options = bots.map((bot: DbBot ) => (
			<option key={bot.id} value={bot.id}>{bot.name}</option>
		));

		return (
			<select name="botId"
				value={this.state.botId}
				onChange={ this._onBotSelect }>
				{ options }
			</select>
		);
	}

	renderBotVersionSelector() {
		let bot = getBot( this.state.botId );
		if( !bot ) return;
		let options: any[] = [];
		bot.versions.forEach( (v,major) => {
			if( v ){
				v.available.forEach( minor => {
					let version = `${major}.${minor.number}`;
					options.push(
						<option key={version} value={version}>{version}</option>
					);
				})
			}
		});

		return (
			<select name="botVersion"
				value={this.state.botVersion}
				onChange={ e => this.setState({botVersion: e.target.value}) }>
				{ options }
			</select>
		);
	}

	renderExchangeSelector( exchanges: DbExchangeAccount[] ){
		let options: any[] = [];

		exchanges.forEach((exchange: DbExchangeAccount) => {
			if (exchange.type === 'real' ){
				options.push(
					<option key={exchange.id} value={exchange.id}>{exchange.name}</option>
				);
			}
		});

		options.push(
			<option key="virtual" value="virtual">Virtual exchange</option>
		);

		return (
			<select name="exchangeAccountId"
				value={this.state.exchangeAccountId}
				onChange={e => this.setState({ exchangeAccountId: e.target.value })}>
				{ options }
			</select>
		);
	}

	renderVirtualExchangeOptions() {
		if( this.state.exchangeAccountId !== 'virtual' ) return;

		return (
			<div className={styles.indentedInputWrapper}>
				<div className={styles.inputWrapper}>
					<InputGroup
						name="exchange"
						label="Exchange to get the prices"
						caption={this.state.errors.exchange}>
						<select name="exchange"
							value={ this.state.exchange }
							onChange={ e => this.setState({exchange: e.target.value})}>
							<option value="bitfinex">Bitfinex</option>
							<option value="kucoin">Kucoin</option>
						</select>
					</InputGroup>
				</div>
				<InitialBalances
					pairs={this.getAssets() }
					balances={ this.state.initialBalances }
					onChange={ initialBalances => this.setState({initialBalances})} />
			</div>
		);
	}

	_onCreate = () => {
		let errors = this.getValidationErrors();
		this.setState({ errors });
		if (Object.keys(errors).length) {
			return Toaster.show('There are errors in the form');
		}

		const pairs = this.getPairs();
		const {botId, botVersion, exchangeAccountId, runInterval, name} = this.state;
		const payload = {
			accountId: this.props.accountId,
			name,
			botId, exchangeAccountId, runInterval,
			version: botVersion,
			pairs,
			active: true,
			exchange: this.state.exchange,
			initialBalances: this.state.initialBalances
		};
		
		this.setState({ creating: true });
		this.props.onCreate(payload).then(res => {
			setTimeout(
				() => this.mounted && this.setState({ creating: false }),
				200
			);
		});
	}

	_onBotSelect = (e: any) => {
		const botId = e.target.value;
		const bot = getBot(botId);
		if( !bot ) return;

		this.setState({
			botId,
			botVersion: this.getLastBotVersion(bot)
		})
	}

	getLastBotVersion( bot: DbBot ){
		let versions = bot.versions;
		let i = versions.length;
		while( i-- > 0 ){
			if( versions[i] ){
				return `${i}.${versions[i].lastMinor}`;
			}
		}
		return '';
	}

	getValidationErrors() {
		const { name, baseAssets, quotedAsset, runInterval, exchangeAccountId } = this.state;

		let errors: FormErrors = {};
		if(!name.trim()) {
			errors.name = { type: 'error', message: 'Please type a name for the deployment.'};
		}
		if (!baseAssets) {
			errors.baseAssets = { type: 'error', message: 'Please type the assets you want to trade separated by commas.' }
		}
		if (!quotedAsset) {
			errors.quotedAsset = { type: 'error', message: 'Please the asset you want to use to buy or sell the base assets.' }
		}
		if (!runInterval) {
			errors.runInterval = { type: 'error', message: 'Please select a run interval.' }
		}

		if( exchangeAccountId === 'virtual' ){
			const {initialBalances} = this.state;
			let someBalance = false;
			Object.keys(initialBalances).forEach((balance: string) => {
				if( initialBalances[balance] ){
					someBalance = true;
				}
			});
			if( !someBalance ){
				errors.exchange = { type: 'error', message: 'You need to set a positive balance for some asset.'};
			}
		}

		return errors;
	}

	getPairs() {
		let pairs: string[] = [];
		this.state.baseAssets.split(/\s*,\s*/).forEach(pair => {
			if (pair.trim()) {
				pairs.push(pair.trim() + '/' + this.state.quotedAsset);
			}
		});
		return pairs;
	}

	getAssets() {
		let assets = this.state.quotedAsset ?
			[this.state.quotedAsset] :
			[]
		;

		this.state.baseAssets.split(/\s*,\s*/).forEach(asset => {
			if (asset.trim()) {
				assets.push(asset.trim());
			}
		});
		return assets;
	}

	mounted = true
	componentWillUnmount() {
		this.mounted = false;
	}

	componentDidMount(){
		this.checkSelectedResources();
	}

	componentDidUpdate() {
		this.checkSelectedResources();
	}

	checkSelectedResources(){
		if( !this.dataLoaded ) return;
		if( !this.state.botId ){
			const {accountId} = this.props;
			let { data: bots } = botListLoader(accountId);
			let { data: exchanges } = exchangeListLoader(accountId);

			if( bots && exchanges ){
				console.log('Setting state');
				const botId = bots.length ? bots[0].id : '';
				let botVersion = '';
				if( botId ){
					const bot = getBot(botId);
					if( bot ){
						botVersion = this.getLastBotVersion(bot);
					}
				}
				
				this.setState({
					botId,
					botVersion,
					exchangeAccountId: exchanges.find( ex => ex.type === 'real')?.id || ''
				});
			}
		}
	}
}
