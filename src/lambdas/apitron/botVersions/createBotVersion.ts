import { MinorVersion, VersionHistory } from "../../model.types";
import { DbBotVersionCreateInput } from "../../_common/dynamo/BotVersionModel";
import { ContextResult, Mutation, MutationContextInput, MutationGetterInput, MutationHandler, MutationResponseInput, ResponseResult } from "../apitron.types";
import { validateShape } from "../utils/validators";

type VersionBumpType = 'minor' | 'major';

interface CreateBotVersionPayload {
	botId: string
	// We receive what version bump type we need for the new version
	type: VersionBumpType
	// We might declare version code to clone, if not, it clones the last one
	sourceNumber?: string
}

const createBotVersionHandler: MutationHandler = {
	name: 'createBotVersion',
	async getContext({body, params, models}: MutationContextInput<any>): Promise<ContextResult> {
		// Validate input
		let {error} = validateShape(body, {
			botId: 'string',
			type: 'botVersionType',
			sourceNumber: 'botVersion?'
		});

		if( error ) return {error: {...error, code: 'invalid_payload'}};

		const {accountId, botId, type} = body;
		const bot = await models.bot.getSingle(botId);
		if( !bot ){
			return {error: {code: 'bot_not_found'}};
		}

		let versionNumber = body.sourceNumber || getLastVersion(bot.versions);
		const sourceVersion = await models.botVersion.getSingle(
			botId, versionNumber
		);

		if( !sourceVersion ){
			return {error: {code: 'source_version_not_found'}};
		}

		return {context: {bot, sourceVersion}};
	},

	getMutations(input: MutationGetterInput): Mutation[] {
		let {bot, sourceVersion} = input.context;
		let {type} = input.body;
		
		// Get updated versions array for the bot
		const nextVersion = getNextVersion( bot.versions, type, sourceVersion.number);
		const minor: MinorVersion = {
			createdAt: Date.now(),
			number: nextVersion[1]
		};

		let versions = [...bot.versions];
		let targetMajor: VersionHistory = versions[ nextVersion[0] ];
		if( !targetMajor ){
			targetMajor = {
				lastMinor: -1,
				available: []
			};
			versions.push( targetMajor );
		}
		targetMajor.lastMinor = minor.number;
		targetMajor.available.push( minor );

		// Get version data
		const version: DbBotVersionCreateInput = {
			botId: bot.id,
			number: `${nextVersion[0]}.${nextVersion[1]}`,
			code: sourceVersion.code
		}

		const botUpdate = {
			accountId: bot.accountId,
			botId: bot.id,
			update: {versions}
		};

		return [
			{model: 'bot', action: 'update', data: botUpdate},
			{model: 'botVersion', action: 'create', data: version }
		];
	},

	getResponse(input: MutationResponseInput): ResponseResult {
		let {number, code} = input.mutations[1].data;
		return {
			status: 200,
			data: { number, code }
		};
	}
}

function getNextVersion(versions: VersionHistory[], type: VersionBumpType, baseVersion?: string ): [number,number]{
	if( type === 'major' ){
		return updateMajor(versions);
	}

	if(!baseVersion){
		baseVersion = getLastVersion( versions );
	}
	return updateMinor( baseVersion, versions );
}

function getLastVersion( versions: VersionHistory[] ){
	let major = versions.length - 1;
	let minor = versions[major].lastMinor;
	return `${major}.${minor}`;
}

function updateMinor( baseVersion: string, versions: VersionHistory[] ): [number,number]{
	let parts = baseVersion.split('.');
	let lastMinor = versions[ parts[0] ].lastMinor;
	return [parseInt(parts[0],10), lastMinor + 1];
}

function updateMajor( versions: VersionHistory[] ): [number,number]{
	return [versions.length, 0];
}

export default createBotVersionHandler;