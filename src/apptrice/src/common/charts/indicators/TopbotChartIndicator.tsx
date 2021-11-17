import { ChartDataItem } from "../chartUtils";
import { ChartIndicator } from "./ChartIndicator";
import { GenericChartComponent } from '@react-financial-charts/core';
import { topbot, TopbotChartOptions } from '../../../../../lambdas/_common/indicators/topbot';

interface ChartSegment {
	x1: number,
	y1: number,
	x2: number,
	y2: number
}

let idIndex = 0;
export class TopbotChartIndicator implements ChartIndicator {
	id: string
	options: TopbotChartOptions
	constructor( args: string[] ){
		this.options = {
			candleGrouping: args[0] ? parseInt(args[0]) : 1
		}
		this.id = `tb${idIndex++}`;
	}

	segments: ChartSegment[] = [];
	augmentData( data: ChartDataItem[] ){
		// @ts-ignore ChartDataItem has the same structure than ArrayCandle
		let {tops, bottoms} = topbot(data, this.options);

		let segments: ChartSegment[] = [];
		let lastValue: [number,number];
		tops.forEach( (top, i) => {
			if( top ){
				let value: [number,number] = [data[i][0], top];
				if( lastValue ){
					segments.push({
						x1: lastValue[0], y1: lastValue[1],
						x2: value[0], y2: value[1]
					})
				};
				lastValue = value;
			}
			else if( bottoms[i] ){
				let value: [number,number] = [data[i][0], bottoms[i]];
				if( lastValue ){
					segments.push({
						x1: lastValue[0], y1: lastValue[1],
						x2: value[0], y2: value[1]
					})
				};
				lastValue = value;
			}
		})
		this.segments = segments;

		return data;
	}

	render( key: string, styles: any ) {
		return (
			<GenericChartComponent
				key={key}
				canvasDraw={ this._drawOnCanvas }
				drawOn={["pan", "mousemove"]}
			/>
		);
	}
	
	_drawOnCanvas = ( ctx: CanvasRenderingContext2D, moreProps: any ) => {
		const {
			xScale,
			chartConfig: { yScale },
			plotData
		} = moreProps;

		if( plotData?.length < 2 ) return;

		let startTime = plotData[0][0];
		let endTime = plotData[plotData.length-1][0];

		let segments = this.segments.filter( s => (
			(s.x1 >= startTime && s.x1 <= endTime) ||
			(s.x2 >= startTime && s.x2 <= endTime) ||
			(s.x1 < startTime && s.x2 > endTime)
		));

		if( !segments.length ) return;

		ctx.save();
		ctx.lineWidth = 1;
		ctx.strokeStyle = 'red';

		ctx.beginPath();
		ctx.moveTo(xScale(segments[0].x1), yScale(segments[0].y1));
		segments.forEach( s => {
			ctx.lineTo(xScale(s.x2), yScale(s.y2));
		});

		ctx.stroke();

		ctx.restore();
	}
}