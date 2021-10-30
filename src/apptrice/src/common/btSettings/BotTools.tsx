import * as React from 'react';
import { ExchangeProvider, RunInterval } from '../../../../lambdas/model.types';
import InitialBalances from './InitialBalances';
import {Button, InputGroup} from '../../components';
import ProgressBar from './ProgressBar';
interface BotToolsProps {
	onRun: (config: BacktestConfig) => void,
	onAbort: () => void,
	currentBackTesting?: any
}

export interface BacktestConfig {
	baseAssets: string[],
	quotedAsset: string,
	runInterval: RunInterval,
	exchangeProvider: ExchangeProvider,
	initialBalances: {[asset: string]: number}
	startDate: number
	endDate: number
	fees: number,
	slippage: number
}

interface BotToolsState {
	baseAssets: string
	quotedAsset: string
	runInterval: RunInterval
	initialBalances: {[asset: string]: string}
	testingTimeframe: string
	startDate: string
	endDate: string
	fees: string
	slippage: string
}

const DAY = 24 * 60 * 60 * 1000;

export default class BotTools extends React.Component<BotToolsProps> {
	state: BotToolsState = {
		baseAssets: 'BTC,ETH',
		quotedAsset: 'USD',
		runInterval: '1h',
		initialBalances: {
			USD: '1000'
		},
		testingTimeframe : '7',
		startDate: this.getInputDate(Date.now() - 8 * DAY),
		endDate: this.getInputDate(Date.now() - DAY ),
		fees: '0.1%',
		slippage: '0.2%'
	}

	render() {
		return (
			<div style={ styles.wrapper }>
				{this.renderBotConfig()}
				{this.renderTestingTimeframe() }
				{this.renderInitialBalances() }
				{this.renderExtraConfig() }
				<div style={styles.fieldGroup}>
					<div style={styles.control}>
						{ this.renderButton() }
					</div>
				</div>
				{ this.renderProgress() }
			</div>
		);
	}

	renderBotConfig() {
		return (
			<div style={styles.fieldGroup}>
				<div style={styles.groupHeader}>
					Bot config
					</div>
				<div style={styles.field}>
					<InputGroup
						name="baseAssets"
						label="Base assets">
						<input name="baseAssets"
							value={this.state.baseAssets}
							onChange={e => this.setState({ baseAssets: e.target.value })} />
					</InputGroup>
				</div>
				<div style={styles.field}>
					<InputGroup name="quotedAsset" label="Quoted asset">
						<input name="quotedAsset"
							value={this.state.quotedAsset}
							onChange={e => this.setState({ quotedAsset: e.target.value })} />
					</InputGroup>
				</div>
				<InputGroup name="runInterval" label="Execution runInterval">
					<select name="runInterval"
						value={this.state.runInterval}
						onChange={e => this.setState({ runInterval: e.target.value })}>
						<option>5m</option>
						<option>10m</option>
						<option>30m</option>
						<option>1h</option>
						<option>4h</option>
						<option>1d</option>
					</select>
				</InputGroup>
			</div>
		);
	}

	renderTestingTimeframe() {
		return (
			<div style={styles.fieldGroup}>
				<div style={styles.groupHeader}>
					Testing time frame
				</div>
				<div style={styles.field}>
					<InputGroup name="runInterval" label="Data from">
						<select value={ this.state.testingTimeframe } onChange={ this._changeTimeframe }>
							<option value="1">Last day</option>
							<option value="3">Last 3 days</option>
							<option value="7">Last week</option>
							<option value="30">Last month</option>
							<option value="90">Last 3 months</option>
							<option value="180">Last 6 months</option>
							<option value="365">Last year</option>
							<option value="custom">Custom dates</option>
						</select>
					</InputGroup>
				</div>
				<div style={styles.field}>
					<InputGroup name="startDate" label="From">
						<input name="startDate"
							placeholder="yyyy-mm-dd"
							value={ this.state.startDate }
							onChange={ e => this.setState({startDate: e.target.value})} />
					</InputGroup>
				</div>
				<div style={styles.field}>
					<InputGroup name="endDate" label="To">
						<input name="endDate"
							placeholder="yyyy-mm-dd"
							value={ this.state.endDate }
							onChange={e => this.setState({ endDate: e.target.value })} />
					</InputGroup>
				</div>
			</div>
		);
	}

	renderExtraConfig(){
		return (
			<div style={styles.fieldGroup}>
				<div style={styles.groupHeader}>
					Extra configuration
				</div>
				<div style={styles.field}>
					<InputGroup name="fees" label="Fees">
						<input name="fees"
							value={ this.state.fees }
							onChange={ e => this.updatePercentage('fees', e.target.value) } />
					</InputGroup>
				</div>
				<div style={styles.field}>
					<InputGroup name="slippage" label="Slippage">
						<input name="slippage"
							value={this.state.slippage}
							onChange={e => this.updatePercentage('slippage', e.target.value)} />
					</InputGroup>
				</div>
			</div>
		)
	}

	renderButton(){
		if( this.isBtRunning() ){
			return (
				<Button onClick={this._onAbortBT}>
					Abort
				</Button>
			);
		}
		return (
			<Button onClick={this._onStartPressed}>
				Start backtesting
			</Button>
		)
	}

	renderProgress() {
		if( !this.isBtRunning() ) return ;

		const {currentBackTesting} = this.props;
		const progress = currentBackTesting.iteration / currentBackTesting.totalIterations * 100;
		return (
			<ProgressBar progress={ progress } />
		);
	}

	updatePercentage( field: string, value: string){
		if( value[value.length - 1] !== '%'){
			this.setState({[field]: value + '%'});
		}
		else {
			this.setState({ [field]: value});
		}
	}

	_changeTimeframe = (e:any) => {
		let selected = e.target.value;
		if( selected === 'custom' ){
			this.setState({testingTimeframe: selected});
			return;
		}

		this.setState({
			testingTimeframe: selected,
			endDate: this.getInputDate( Date.now() - DAY ),
			startDate: this.getInputDate( Date.now() - (parseInt(selected) +1) * DAY )
		});
	}

	renderInitialBalances() {
		return (
			<InitialBalances
				pairs={ this.getPairs() }
				balances={ this.state.initialBalances }
				onChange={ InitialBalances => this.setState({InitialBalances}) }
				innerPadding={true} />
		);
	}

	_renderBalanceInput = (pair:string) => {
		return (
			<div style={styles.field}>
				<InputGroup
					name={`${pair}_balance`}
					label={pair}>
					<input name={`${pair}_balance`}
						// @ts-ignore
						value={this.state.initialBalances[pair] || 0}
						onChange={e => this.updateInitialBalance(pair, e.target.value)} />
				</InputGroup>
			</div>
		);
	}

	_onStartPressed = () => {
		let errors = this.getValidationErrors();
		if( errors ){
			this.setState({errors});
		}

		this.props.onRun( this.getConfig() );
	}

	_onAbortBT = () => {
		this.props.onAbort();
	}

	getValidationErrors() {
		return false;
	}

	getConfig(): BacktestConfig {
		let { 
			quotedAsset, runInterval, initialBalances,
			startDate, endDate, fees, slippage
		} = this.state;

		let start = new Date(startDate + 'T00:00:00.000Z');
		let end = new Date(endDate + 'T23:59:59.999Z');

		let balances: {[asset:string]: number} = {};
		Object.keys(initialBalances).forEach( (asset:string) => {
			balances[asset] = parseFloat(initialBalances[asset]);
		})

		return {
			baseAssets: this.getPairs().slice(1),
			quotedAsset,
			runInterval,
			initialBalances: balances,
			startDate: start.getTime(),
			endDate: end.getTime(),
			fees: parseFloat(fees),
			slippage: parseFloat(slippage)
		};
	}

	updateInitialBalance( pair:string, value: string ){
		this.setState({
			initialBalances: {
				...this.state.initialBalances,
				[pair]: value
			}
		});
	}

	getQuotedPair(){
		return this.state.quotedAsset;
	}

	getPairs() {
		let pairs = [this.state.quotedAsset];
		this.state.baseAssets.split(/\s*,\s*/).forEach( pair => {
			if( pair.trim() ){
				pairs.push( pair.trim() );
			}
		});
		return pairs;
	}

	getInputDate( time: number ){
		let date = new Date(time);
		return date.toISOString().split('T')[0];
	}

	isBtRunning(): boolean {
		return this.props.currentBackTesting?.status === 'running' || false;
	}
}

const styles: { [id: string]: React.CSSProperties } = {
	wrapper: {
		width: '100%',
		height: '100vh',
		overflow: 'auto'
	},
	fieldGroup: {
		padding: '0 8px',
		marginBottom: 24
	},
	groupHeader: {
		borderBottom: '1px solid rgba(255,255,255,.1)',
		marginBottom: 8
	},
	field: {
		marginBottom: 8
	},
	control: {
		display: 'flex',
		flexGrow: 1,
		flexDirection: 'column',
		alignItems: 'stretch'
	}
}