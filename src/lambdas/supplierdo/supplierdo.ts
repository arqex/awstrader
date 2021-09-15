import { runBotIteration } from '../_common/botRunner/runBotIteration';
import { SupplierdoRunner } from '../_common/botRunner/SupplierdoRunner';

export async function supplierdo({ accountId, deploymentId }) {
	try {
		console.log('Handling run request', accountId, deploymentId);
		await handleRunRequest( accountId, deploymentId );
	}
	catch(err) {
		console.error(err);
		return {error: err.code};
	}

	return {error: false};
}

async function handleRunRequest( accountId: string, deploymentId: string ) {
	return runBotIteration(accountId, deploymentId + accountId, SupplierdoRunner);
}