import { ChartDataItem } from "../chartUtils";
import { ChartIndicator } from "./ChartIndicator";
import { LineSeries } from '@react-financial-charts/series';
import { ema } from "../../../../../lambdas/_common/indicators/ema";
import { ArrayCandle } from "../../../../../lambdas/lambda.types";

interface ChartSegment {
	x1: number,
	y1: number,
	x2: number,
	y2: number
}

let idIndex = 0;
export class EmaChartIndicator implements ChartIndicator {
	id: string
	period: number
	constructor( args: string[] ){
		this.period = parseInt( args[0] || '14' );
		this.id = `ema${idIndex++}`;
	}

	segments: ChartSegment[] = [];
	augmentData( data: ChartDataItem[] ){
        let emaData = ema( data as unknown as ArrayCandle[], this.period, 'close');
        let augmented: ChartDataItem[] = [];
        data.forEach( (d,i) => {
            augmented.push({
                ...d,
                calculated: {
                    ...d.calculated,
                    [this.id]: emaData[i]
                }
            });
        })

        return augmented;
	}

	render( key: string, styles: any ) {
		return (
            <LineSeries key={key}
                yAccessor={ this._accessor }
                strokeStyle="blue" />
		);
	}

    _accessor = (d: any) => {
        return d.calculated[this.id];
    }
}