const AWS = require('aws-sdk');
if (process.env.IS_OFFLINE) {
	console.log('OFFLINE DB');
	AWS.config.update({
		endpoint: "http://localhost:8000"
	});
}
else {
	console.log('ONLNE DB');
}

const dynamoDb = new AWS.DynamoDB.DocumentClient();

interface GSIQuery {
	pk: { name: string, value: string } // partition key
	sk: { name: string, value: string } // sort key
}

interface DBModelConfig {
	pkName?: string,
	skName?: string,
	tableName?: string,
}

// @ts-ignore
const ACCOUNTS_TABLE: string = process.env.ACCOUNTS_TABLE;

export class DBModel<T> {
	pkName: string
	skName: string
	tableName: string

	constructor( config?: DBModelConfig ){
		this.pkName = config?.pkName || 'accountId'
		this.skName = config?.skName || 'resourceId'
		this.tableName = config?.tableName || ACCOUNTS_TABLE;
	}

	async put(item: T ): Promise<void> {
		try {
			await dynamoDb.put({
				TableName: this.tableName,
				Item: item
			}).promise();
		}
		catch (err) {
			logError('put', item);
			throw err;
		}
	}

	async getSingle( accountId: string, resourceId: string ): Promise<T|void> {
		const payload = {
			TableName: this.tableName,
			Key: { 
				[this.pkName]: accountId,
				[this.skName]: resourceId
			}
		};
		console.log( payload );
		try {
			let res = await dynamoDb.get(payload).promise();
			return res.Item;
		}
		catch (err) {
			logError('getSingle', accountId, resourceId );
			throw err;
		}
	}

	async getMultiple(accountId: string, resourcePrefix: string): Promise<T[]> {
		try {
			let res = await dynamoDb.query({
				TableName: this.tableName,
				KeyConditionExpression: `${this.pkName} = :a and begins_with(${this.skName}, :r)`,
				ExpressionAttributeValues: {
					':a': accountId,
					':r': resourcePrefix
				}
			}).promise();
			return res.Items;
		}
		catch (err) {
			logError('getMultiple', accountId, resourcePrefix);
			throw err;
		}
	}

	async update(accountId: string, resourceId: string, update: { [attribute: string]: any} ): Promise<void>{
		let AttributeUpdates = {};
		for( let key in update ){
			AttributeUpdates[key] = {Action: 'PUT', Value: update[key]};
		}
		try {
			await dynamoDb.update({
				TableName: this.tableName,
				Key: { 
					[this.pkName]: accountId,
					[this.skName]: resourceId
				},
				AttributeUpdates
			}).promise();
		}
		catch(err) {
			logError('update', resourceId, update);
			throw err;
		}
	}

	async removeAttributes(accountId: string, resourceId: string, attributes: string[]): Promise<void> {
		let AttributeUpdates = {};
		attributes.forEach( key => {
			AttributeUpdates[key] = { Action: 'DELETE' };
		});
		
		try {
			await dynamoDb.update({
				TableName: this.tableName,
				Key: { 
					[this.pkName]: accountId,
					[this.skName]: resourceId
				},
				AttributeUpdates
			}).promise();
		}
		catch (err) {
			logError('removeAttributes', accountId, resourceId, attributes);
			throw err;
		}
	}

	async del( accountId: string, resourceId:string ): Promise<void> {
		try {
			await dynamoDb.delete({
				TableName: this.tableName,
				Key: { 
					[this.pkName]: accountId,
					[this.skName]: resourceId
				}
			}).promise();
		}
		catch (err) {
			logError('delete', accountId, resourceId);
			throw err;
		}
	}

	getIndex(indexName: string ){
		let tableName = this.tableName;
		return {
			async getSingle(input: GSIQuery) {
				const payload = {
					TableName: tableName,
					IndexName: indexName,
					Key: {
						[input.pk.name]: input.pk.value,
						[input.sk.name]: input.sk.value,
					}
				};

				try {
					let res = await dynamoDb.get(payload).promise();
					return res.Item;
				}
				catch (err) {
					logError('getIndex.getSingle', indexName, input);
					throw err;
				}
			},
			async getMultiple(input: GSIQuery) {
				console.log('getting multiple from index', input);

				try {
					let res = await dynamoDb.query({
						TableName: tableName,
						IndexName: indexName,
						KeyConditionExpression: `${input.pk.name} = :pk AND ${input.sk.name} = :sk`,
						ExpressionAttributeValues: {
							':pk': input.pk.value,
							':sk': input.sk.value
						}
					}).promise();
					return res.Items;
				}
				catch (err) {
					logError('getIndex.getMultiple', indexName, input);
					throw err;
				}
			}
		}
	}
}

function logError( method, ...args ){
	console.error(`ERROR IN DYNAMO CALL: ${method}`, args );
}