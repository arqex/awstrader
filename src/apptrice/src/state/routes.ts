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
import BacktestsScreen from "../screens/singleBot/botBt/BacktestsScreen";
import BacktestDetailsScreen from "../screens/singleBot/botBt/BacktestDetailsScreen";

const routes = [
	{path: '/', cb: HomeScreen},
	{path: '/deployments', cb: DeploymentsScreen, children: [
		{path: '/:id', cb: SingleDeploymentScreen, children: [
			{path: '/charts', cb: DeploymentChartsScreen },
			{path: '/orders', cb: DeploymentOrdersScreen },
			{path: '/state', cb: DeploymentStateScreen},
			{path: '/logs', cb: DeploymentLogsScreen},
			{path: '*', cb: DeploymentStatsScreen },
		]}
	]},
	{path: '/bots', cb: BotListScreen, children: [
		{path: '/:id', cb: BotScreen, children: [
			{ path: '/details', cb: BotDetailsScreen },
			{ path: '/editor', cb: BotEditorScreen },
			{ path: '/backtests', cb: BacktestsScreen, children: [
				{path: '/:btid', cb: BacktestDetailsScreen}
			]},
			{ path: '*', cb: BotDetailsScreen },
		]}
	]},
	{path: '/exchanges', cb: ExchangesScreen},
	{path: '/settings', cb: SettingsScreen },
];

export default routes;