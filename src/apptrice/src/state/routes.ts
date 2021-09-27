import HomeScreen from "../screens/home/HomeScreen"
import BotListScreen from '../screens/bots/BotListScreen'
import BotScreen from "../screens/singleBot/BotScreen";
import BotDetailsScreen from "../screens/singleBot/botDetails/BotDetailsScreen";
import BotEditorScreen from "../screens/singleBot/botEditor/BotEditorScreen";
import DeploymentsScreen from "../screens/deployments/DeploymentsScreen";
import ExchangesScreen from "../screens/exchanges/ExchangesScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import SingleDeploymentScreen from "../screens/singleDeployment/SingleDeploymentScreen";
import DeploymentOrdersScreen from "../screens/singleDeployment/orders/DeploymentOrdersScreen";
import DeploymentStateScreen from "../screens/singleDeployment/state/DeploymentStateScreen";
import DeploymentLogsScreen from "../screens/singleDeployment/logs/DeploymentLogsScreen";
import DeploymentStatsScreen from "../screens/singleDeployment/stats/DeploymentStatsScreen";
import DeploymentChartsScreen from "../screens/singleDeployment/charts/DeploymentChartsScreen";
import BotBtScreen from "../screens/singleBot/botBt/BotBtScreen";
import BtStats from "../screens/singleBot/botBt/sections/BtStats";
import BtOrders from "../screens/singleBot/botBt/sections/BtOrders";
import BtCharts from "../screens/singleBot/botBt/sections/BtCharts";
import BtState from "../screens/singleBot/botBt/sections/BtState";
import BtLogs from "../screens/singleBot/botBt/sections/BtLogs";
import BacktestsScreen from "../screens/singleBot/botBt/BacktestsScreen";
import BacktestDetailsScreen from "../screens/singleBot/botBt/BacktestDetailsScreen";

const routes = [
	{path: '/', cb: HomeScreen},
	{path: '/deployments', cb: DeploymentsScreen, children: [
		{path: '/:id', cb: SingleDeploymentScreen, children: [
			{path: '/', cb: DeploymentStatsScreen },
			{path: '/stats', cb: DeploymentStatsScreen },
			{path: '/charts', cb: DeploymentChartsScreen },
			{path: '/orders', cb: DeploymentOrdersScreen },
			{path: '/state', cb: DeploymentStateScreen},
			{path: '/logs', cb: DeploymentLogsScreen}
		]}
	]},
	{path: '/bots', cb: BotListScreen, children: [
		{path: '/:id', cb: BotScreen, children: [
			{ path: '/details', cb: BotDetailsScreen },
			{ path: '/editor', cb: BotEditorScreen },
			{ path: '/backtests', cb: BacktestsScreen, children: [
				{path: '/:btid', cb: BacktestDetailsScreen}
			]},
			{ path: '/backtesting', cb: BotBtScreen, children: [
				{path: '/stats', cb: BtStats},
				{path: '/charts', cb: BtCharts},
				{path: '/orders', cb: BtOrders},
				{path: '/state', cb: BtState},
				{path: '/logs', cb: BtLogs},
			]},
			{ path: '*', cb: BotDetailsScreen },
		]}
	]},
	{path: '/exchanges', cb: ExchangesScreen},
	{ path: '/settings', cb: SettingsScreen },
];

export default routes;