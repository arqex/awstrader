import * as React from 'react'
import { Card } from '../../../../components';
import styles from './_PortfolioHistoryWidget.module.css';

import {Line} from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

import { DbExchangeAccount, PortfolioHistoryItem } from '../../../../../../lambdas/model.types';
import memoizeOne from 'memoize-one';
import priceLoader from '../../../../state/loaders/price.loader';
import trim from '../../../../utils/trim';

interface PortfolioHistoryWidgetProps {
	exchangeAccount: DbExchangeAccount
	baseAssets: string[]
	quotedAsset: string
}

export default class PortfolioHistoryWidget extends React.Component<PortfolioHistoryWidgetProps> {
	render() {
		return (
			<div className={styles.container}>
				<Card>
					<div>
						<h3>Portfolio history</h3>
					</div>
					{ this.renderContent() }
				</Card>
			</div>
		)
	}

	renderContent() {
		const data = this.getData();
		const options = this.getOptions();
		return (
			<Line
				type="line"
				data={data}
				options={options} />
		);
	}

	getData() {
		const {exchangeAccount, baseAssets, quotedAsset} = this.props;
		return memoGetData( exchangeAccount.portfolioHistory || [], quotedAsset, baseAssets, exchangeAccount.provider );
	}

	getOptions() {
		return {
			radius: 0,
			scales: {
				x: {
					type: 'time',
					ticks: {
						source: 'labels'
					}
				}
			},
			interaction: {
				intersect: false,
				mode: 'index'
			},
			plugins: {
				tooltip: {
					callbacks: {
						label: (context:any) => {
							let datasets = context.chart.data.datasets;
							let total = datasets[ datasets.length - 1 ].data[context.dataIndex];
							let amount = context.parsed.y;
							if( context.datasetIndex ){
								amount -= datasets[context.datasetIndex - 1].data[context.dataIndex];
							}

							let percentage = trim( (amount / total) * 100, 2);
							return `${context.dataset.label}: ${percentage}%`;
						},
						footer: (elements: any[]) => {
							let lastElement = elements[ elements.length - 1];
							return `Total: ${trim(lastElement.parsed.y, 5)} ${this.props.quotedAsset} (${this.getReturn(lastElement.parsed.y)}%)`;
						}
					}
				}
			}
		};
	}

	getReturn( value: number ){
		const datasets = this.getData().datasets;
		let total = datasets[datasets.length - 1].data[0];

		let ret = (value/total*100) - 100;
		return ret > 0 ?
			`+${trim(ret, 2)}` :
			trim(ret, 2)
		;
	}
}


const memoGetData = memoizeOne( (portfolioHistory: PortfolioHistoryItem[], quoted: string, base: string[], provider: string ) => {

	let assets = [ quoted ].concat( base );
	let labels: number[] = [];
	let sets: {[asset:string]: number[]} = {};
	assets.forEach( (asset:string) => {
		sets[asset] = [];
	});

	portfolioHistory.forEach( (item: PortfolioHistoryItem) => {
		// @ts-ignore
		labels.push( parseInt(item.date, 10) );

		let total = 0; 
		assets.forEach( (asset: string) => {
			let amount = item.balances[asset] ? item.balances[asset].total : 0;
			let { data: value } = priceLoader.getData( provider, String(amount), `${asset}/${quoted}` );
			total += (value || 0);
			sets[asset].push( total );
		});
	});

	return {
		labels,
		datasets: assets.map( (asset: string, i: number) => ({
			label: asset,
			data: sets[asset],
			fill: true,
			backgroundColor: `rgb(${i*55 + 50},${i*55 + 50},${i*55 + 60})`,
			borderColor: `rgb(${i*55 + 50},${i*55 + 50},${i*55 + 60}, .2)`
		}))
	}
});