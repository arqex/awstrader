import * as React from 'react'
import { ModelBotDeployment } from '../../../../lambdas/model.types'
import { Button, Controls, InputGroup } from '../../components'
import { getBot } from '../../state/selectors/bot.selectors'
import styles from './_UpdateVersionForm.module.css';

interface UpdateVersionFormProps {
	deployment: ModelBotDeployment,
	onClose: () => void,
	onUpdateVersion: (deploymentId: string, version: string) => Promise<any>
}

export default class UpdateVersionForm extends React.Component<UpdateVersionFormProps> {
	state = {
		updating: false,
		selectedVersion: this.props.deployment.version
	}

	mounted = true

	render() {
		return (
			<div>
				<h3 className={styles.title}>Update bot version</h3>
				<div>
					<InputGroup
						name="botVersion"
						label="Select the updated bot version for the deployment">
							{ this.renderBotVersionSelector() }
					</InputGroup>
				</div>
				<Controls>
					<Button size="s"
						color="transparent"
						onClick={ this.props.onClose }
						disabled={ this.state.updating }>
						Cancel
					</Button>
					<Button size="s"
						onClick={this._onUpdateVersion }
						loading={this.state.updating}>
						Update version
					</Button>
				</Controls>
			</div>
		)
	}

	renderBotVersionSelector() {
		let bot = getBot( this.props.deployment.botId );
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
				value={this.state.selectedVersion}
				onChange={ e => this.setState({selectedVersion: e.target.value}) }>
				{ options }
			</select>
		);
	}

	_onUpdateVersion = () => {
		this.setState({updating: true});
		this.props.onUpdateVersion(this.props.deployment.id, this.state.selectedVersion)
			.then( () => {
				setTimeout(
					() => this.mounted && this.setState({ updating: false}),
					200
				);
			})
		;
	}

	componentWillUnmount() {
		this.mounted = false;
	}
}
