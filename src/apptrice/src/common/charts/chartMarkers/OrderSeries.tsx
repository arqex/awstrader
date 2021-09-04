import * as React from 'react'
import { Order } from '../../../../../lambdas/lambda.types';
import BuyMarker from './BuyMarker';
import ErrorMarker from './ErrorMarker';
import SellMarker from './SellMarker';

import { GenericChartComponent, getAxisCanvas } from '@react-financial-charts/core';
import { CircleMarker, Square } from '@react-financial-charts/series';

interface OrderSeriesProps {
	orders: any,
	candles: any[]
}

export default class OrderSeries extends React.Component<OrderSeriesProps> {
	drawOnCanvas = (ctx: any, moreProps: any) => {
		const { xScale, chartConfig: { yScale } } = moreProps;
		const { orders, candles } = this.props;

		orders.forEach((order: any) => {
			renderOpening(ctx, xScale, yScale, order);
			renderLine(ctx, xScale, yScale, order, candles);
			renderClosing(ctx, xScale, yScale, order);
		});
	}

	renderSVG = (moreProps: any) => {
		//Not implemented
		return null;
	}
	render() {
		return <GenericChartComponent
			svgDraw={this.renderSVG}
			canvasDraw={this.drawOnCanvas}
			canvasToDraw={getAxisCanvas}
			drawOn={["pan"]}
		/>;
	}
}

function renderOpening(ctx: any, xScale: any, yScale: any, order: Order) {
	if (order.closedAt === order.placedAt) return;

	const color = getColor(order.status, order.direction);
	const point = {
		x: xScale(order.placedAt),
		y: yScale(order.price),
		datum: order
	}

	const styles = {
		stroke: 'white',
		fill: color,
		r: 2,
		opacity: .5,
		strokeWidth: 1,
		point
	}

	CircleMarker.drawOnCanvas(styles, point, ctx);
}

function renderLine(ctx: any, xScale: any, yScale: any, order: Order, candles: any[]) {
	if (order.closedAt === order.placedAt) return;

	let closedAt = order.closedAt || getLastCandleTime(candles);

	ctx.save();

	const color = getColor(order.status, order.direction);
	ctx.strokeStyle = color;
	ctx.lineWidth = 1;
	ctx.setLineDash([1, 2]);
	const p1 = {
		x: xScale(order.placedAt),
		y: yScale(order.price),
	};
	const p2 = {
		x: xScale(closedAt),
		y: yScale(order.price),
	};

	ctx.beginPath();
	ctx.moveTo(p1.x, p1.y);
	ctx.lineTo(p2.x, p2.y);
	ctx.stroke();

	ctx.restore();
}

function renderClosing(ctx: any, xScale: any, yScale: any, order: Order) {
	if (!order.closedAt) return;

	const Marker = getMarker(order);
	const color = getColor(order.status, order.direction);

	let styles = {
		stroke: order.status === 'cancelled' ? 'transparent' : 'white',
		fill: color,
		width: order.status === 'cancelled' ? 4 : 8,
		opacity: order.status === 'cancelled' ? .6 : 1,
		strokeWidth: 1,
	};
	if( order.status === 'error' ){
		styles.stroke = color;
	}
	const point = {
		x: xScale(order.closedAt),
		y: yScale(order.executedPrice || order.price || order.marketPrice)
	}

	Marker.drawOnCanvas(styles, point, ctx);
}


function getMarker(order: any) {
	switch (order.status) {
		case 'completed':
			return order.direction === 'buy' ? BuyMarker : SellMarker;
		case 'cancelled':
			return Square;
		case 'error':
			return ErrorMarker;
		default:
			return CircleMarker;
	}
}

function getColor(status: string, direction: string) {
	if (direction === 'buy') {
		if (status === 'completed') {
			return '#38bb8b';
		}
		else if (status === 'placed') {
			return '#38bb8b';
		}
		return '#38bb8b';
	}

	// sell
	if (status === 'completed') {
		return '#f77694';
	}
	else if (status === 'placed') {
		return '#f77694';
	}
	return '#f77694';
}

function getLastCandleTime(c: any[]) {
	return c[c.length - 1].date.getTime();
}