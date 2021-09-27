import * as React from 'react'
import { fullBacktestLoader } from '../../../state/loaders/fullBacktest.loader'
import { BotScreenProps } from '../BotScreenProps'
// import styles from './_BacktestDetsilsScreen.module.css';

interface BacktestDetailsScreenProps extends BotScreenProps {
	backtestId: string
}

export default class BacktestDetailsScreen extends React.Component<BacktestDetailsScreenProps> {
	render() {
		const {data:bt} = fullBacktestLoader(this.props.backtestId);
		console.log( bt );
		return (
			<div>
				This is the details one {this.props.backtestId}
			</div>
		)
	}
}
