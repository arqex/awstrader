import { ActiveInterval, DeploymentOrders, PlotterData, RunInterval } from "../../../../lambdas/model.types";

export interface ChartableDeployment {
	activeIntervals: ActiveInterval[],
	lastRunAt?: number,
	orders: DeploymentOrders,
	pairs: string[]
	plotterData: PlotterData,
	runInterval: RunInterval,
} 