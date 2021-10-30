import AccountModel from '../_common/dynamo/AccountModel';
import ExchangeAccountModel from '../_common/dynamo/ExchangeAccountModel';
import BotDeploymentModel from '../_common/dynamo/BotDeploymentModel';
import BotModel from '../_common/dynamo/BotModel';
import lambdaUtil from '../_common/utils/lambda';
import deploymentAPI from './deployments/deploymentsAPI';
import exchangesAPI from './exchangeAccounts/exchangesAPI';
import botsAPI from './bots/botsAPI';
import pricesAPI from './prices/pricesAPI';
import candlesAPI from './candles/candlesAPI';

import { readFileSync } from 'fs';
import { join } from 'path';
import * as express from 'express';
import * as serverless from 'serverless-http';
import BotVersionModel from '../_common/dynamo/BotVersionModel';
import botVersionsAPI from './botVersions/botVersionsAPI';
import backtestsAPI from './backtests/backtestsAPI';
import setMarketTestEndpoint from '../_common/markets/marketServiceTester';


const app = express()

app.use(express.json());
app.use(function (req, res, next) {
	res.setHeader('charset', 'utf-8')
	res.setHeader("Access-Control-Allow-Headers", "Content-Type")
	res.setHeader("Access-Control-Allow-Origin", "*")
	res.setHeader("Access-Control-Allow-Methods", "OPTIONS,POST,GET,PATCH,DELETE")
	next();
});

app.get('/', function (req, res) {
	console.log('Hello!');
	res.send('Hello World!')
});

app.get('/accounts/:id', function(req, res){
	res.send('/account/:id not implemented yet');
});

app.post('/schedulator', function( req, res ){
	lambdaUtil.invokeSchedulator().then( result => {
		console.log( 'Schedulator', result );
		res.send(`ok`);
	});
});

app.post('/tickerUpdater', function( req, res ){
	lambdaUtil.invokeTickerUpdater('bitfinex').then( result => {
		console.log('Ticker updater', result );
		res.send('ok');
	})
});

backtestsAPI.initialize(app);
botsAPI.initialize(app);
botVersionsAPI.initialize(app);
deploymentAPI.initialize(app);
exchangesAPI.initialize(app);
pricesAPI.initialize(app);
candlesAPI.initialize(app);

setMarketTestEndpoint(app);

app.post('/runnow', function(req, res) {
	const { accountId, deploymentId } = req.body;
	if (!accountId) return returnMissingAttr(res, 'accountId');
	if (!deploymentId) return returnMissingAttr(res, 'deploymentId');

	console.log('getting deployment');
	BotDeploymentModel.getSingleModel(deploymentId)
		.then( deployment => {
			if (!deployment ){
				return res.status(404)
					.json({error: 'not_found'})
				;
			}

			lambdaUtil.invokeSupplierdo({accountId, deploymentId})
				.then(result => {
					console.log(result);
					res.status(200).end();
				})
			;
		})
	;
})

export const apitron = serverless(app);

async function setTestData() {
	let accountId = '0000000000000000000000';
	let account = await AccountModel.getSingle(accountId);
	if (!account) {
		console.log('Creating test data');
		await AccountModel.create({
			id: accountId
		});

		await ExchangeAccountModel.create({
			accountId,
			id: '1111111111111111111111',
			name: 'Test exchange real',
			provider: 'bitfinex',
			type: 'real',
			credentials: {
				key: 'Mma7B6ISTUNVcnUPOrDJgVgcNRh3VbmeIalaBDvUpml',
				secret: 'U2FsdGVkX1824o9FgiOF9BxzhmGCFb8uif4cOgToOk1l0DLUFhT8Ua1pNmgbZU7odyYY4tdoA4s1c3XrM4tyxQ=='
			}
		});

		await ExchangeAccountModel.create({
			accountId,
			id: '2222222222222222222222',
			name: 'Virtua exchange',
			provider: 'bitfinex',
			type: 'virtual',
			initialBalances: {"BTC": {"asset": "BTC", "free": 0, "total": 0}, "USD": {"asset": "USD", "free": 1000, "total": 1000}}
		});

		await ExchangeAccountModel.create({
			accountId,
			id: '5555555555555555555555',
			name: 'Kucoin real',
			provider: 'kucoin',
			type: 'real',
			credentials: {
				key:"61605408f86ecb0001b6c8eb",
				passphrase:"U2FsdGVkX1+J7wM0grWs8BxMHCHxcpKEy41lTNS8t9Qh9Src/l00V4S/2XQFoNEh",
				secret:"U2FsdGVkX1+J4aKWT6Z/us/ao0Jqbg040AjBpCm0VwgdMVHh8nZZLu/nEaurT5ZNDzr77TCxoGsxeCEvuudn/Q=="
			}
		})

		await BotDeploymentModel.create({
			accountId,
			name: 'Test deployment',
			id: '3333333333333333333333',
			botId: '44444444444444444444440000000000000000000000',
			version: '0.0',
			orders: {
				foreignIdIndex: {},
				items: {},
				openOrderIds: []
			},
			exchangeAccountId: '22222222222222222222220000000000000000000000',
			runInterval: '1h',
			pairs: ['BTC/USD', 'ETH/USD'],
			state: {newState: 'stateNew'},
			active: true,
			portfolioHistory: [
				{
					date: Date.now(),
					balances: {USD: {asset: 'USD', free: 1000, total: 1000, price: 1}}
				}
			]
				
		});

		await BotModel.create({
			name: 'Test bot',
			accountId,
			id: '4444444444444444444444',
			versions: [
				{ lastMinor: 0, available: [{number: 0, createdAt: Date.now()}]}
			]
		});

		await BotVersionModel.create({
			botId: '4444444444444444444444' + accountId,
			number: '0.0',
			code: readFileSync(join(__dirname, '../../../bots/simpleBot.ts'), 'utf8')
		})
	}
	else {
		console.log('Test data was already there');
	}
}

setTestData();


function returnMissingAttr( res, attrName ){
	res.status(400)
		.json({ error: 'invalid_payload', message: `${attrName} not given` })
	;
}