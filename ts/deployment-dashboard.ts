import * as $ from 'jquery';
import { WebviewTag } from 'electron';

export class DeploymentDashboard
{
	WebView: JQuery<WebviewTag>;
	/**Are we currently in the process of claiming all the active servers on the dashboard? */
	private claimingAll: boolean;
	/**Are we currently waiting for the next server group to finish deploying? */
	private waitingForDeploy: boolean = false;
	/**Are we currently in the process of logging into a server group? */
	private loggingIntoGroup: boolean = false;
	/**Should debug information be shown in the console? */
	private debug = false;
	queue: { serverName: string, pass: boolean }[];
	constructor()
	{
		this.claimingAll = false;
		this.queue = [];
		const deploymentDashboardUrl = "http://supportstats:70/QATools/DeploymentDashBoard.aspx";
		this.WebView = $(`<webview id="Deployment-Dashboard" src="${deploymentDashboardUrl}" webpreferences="disableDialogs" preload="./dist/depdash-embedded.js"></webview>`);
		this.WebView[0].addEventListener('console-message', (e) =>
		{
			if (this.debug) {
				console.log('Deployment Dashboard:', e.message);
			}
		});
		this.WebView[0].addEventListener('ipc-message', (event) =>
		{
			if (event.channel == 'claim-all-complete')
			{
				this.claimingAll = false;
			}
			else if (event.channel == 'group-deploy-complete')
			{
				this.waitingForDeploy = false;
				this.claimingAll = true;
				new Notification('Server Group Deployment Complete', {
					body: 'The deployment for the current server group has finished. Logins can begin now.'
				});
			}
			else if (event.channel == 'group-login-complete')
			{
				this.waitingForDeploy = true;
				new Notification('Server Group Logins', {
					body: 'Logins for this server group have finished. All servers are operational.'
				});
			}
		});
		this.WebView.on("did-finish-load", () =>
		{
			if (this.waitingForDeploy)
			{
				this.WebView[0].send('check-group-status');
			}
			else if (this.claimingAll)
			{
				this.WebView[0].send('claim-all-servers');
			}
			else if (this.queue.length > 0)
			{
				let serverName = this.queue[0].serverName;
				let pass = this.queue[0].pass;
				this.queue.shift();
				if (this.debug)
				{
					console.log(`set-server-state: serverName: ${serverName}, pass: ${pass}`);
				}
				this.WebView[0].send('set-server-state', serverName, pass);
			}
			else if (this.loggingIntoGroup && this.queue.length == 0)
			{
				this.loggingIntoGroup = false;
				this.WebView[0].send('check-login-status');
			}
		});
	}
	ClaimAll()
	{
		this.waitingForDeploy = true;
		this.claimingAll = true;
	}
	/**
	 * Updates the pass/fail state of a server on the dashboard
	 * @param serverName The name of the server to update
	 * @param pass Did the server pass?
	 */
	SetServerState(serverName: string, pass: boolean): void
	{
		this.loggingIntoGroup = true;
		this.queue.push({ serverName: serverName, pass: pass });
	}
}