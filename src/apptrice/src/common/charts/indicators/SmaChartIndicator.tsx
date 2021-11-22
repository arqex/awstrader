import { ChartDataItem } from "../chartUtils";
import { ChartIndicator } from "./ChartIndicator";
import { LineSeries } from '@react-financial-charts/series';
import { sma } from "../../../../../lambdas/_common/indicators/sma";
import { ArrayCandle } from "../../../../../lambdas/lambda.types";

interface ChartSegment {
	x1: number,
	y1: number,
	x2: number,
	y2: number
}

let idIndex = 0;
export class SmaChartIndicator implements ChartIndicator {
	id: string
	period: number
	constructor( args: string[] ){
		this.period = parseInt( args[0] || '14' );
		this.id = `sma${idIndex++}`;
	}

	segments: ChartSegment[] = [];
	augmentData( data: ChartDataItem[] ){
        let smaData = sma( data as unknown as ArrayCandle[], this.period, 'close');
        let augmented: ChartDataItem[] = [];
        data.forEach( (d,i) => {
            augmented.push({
                ...d,
                calculated: {
                    ...d.calculated,
                    [this.id]: smaData[i]
                }
            });
        })

        return augmented;
	}

	render( key: string, styles: any ) {
		return (
            <LineSeries key={key}
                yAccessor={ this._accessor }
                strokeStyle="yellow" />
		);
	}

    _accessor = (d: any) => {
        return d.calculated[this.id];
    }
}