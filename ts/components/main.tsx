import * as React from 'react';
import * as $ from 'jquery';
import { IReleaseInfo, IServerGroupStatus } from '../interfaces';
import { ResultTray } from '../controls';
import { SideMenu } from './side-menu';
import { TitleBar } from './title-bar';
import { depDashboard, getReleaseInfoJson, getSafeServerID } from '../renderer';
import { WebviewTag } from 'electron';

interface IAppMainProps
{
	groups: IServerGroupStatus[];
}
interface IAppMainState
{
	checkBuild: boolean;
	claimAllServers: boolean;
	displayDeploymentDashboard: boolean;
	serverGroups: IServerGroupStatus[];
	username: string;
	password: string;
}
export class AppMain extends React.Component<IAppMainProps, IAppMainState> {
	// public static defaultProps = {
	// 	mac: false
	// };
	constructor(props: IAppMainProps)
	{
		super(props);

		this.state = {
			checkBuild: false,
			claimAllServers: false,
			displayDeploymentDashboard: false,
			serverGroups: JSON.parse(JSON.stringify(props.groups)),
			username: "",
			password: "",
		}
	}
	render()
	{
		return (
			<>
				<TitleBar />
				<div className="maincontainer">
					<div id="main">
						<SideMenu
							checkBuild={this.state.checkBuild}
							claimAllServers={this.state.claimAllServers}
							password={this.state.password}
							username={this.state.username}
							toggleCheckBuild={value => this.setState({ checkBuild: value })}
							toggleClaimAllServers={
								value =>
								{
									this.setState({ claimAllServers: value });
									depDashboard.ClaimAll(value);
								}
							}
							updatePassword={value => this.setState({ password: value })}
							updateUsername={value => this.setState({ username: value })}
						/>
						<div id="webFrame">
							<div
								id="depDashFrame"
								className={this.state.displayDeploymentDashboard ? undefined : "hidden"}
							>
								<button
									className="fold-button deployment-dashboard-fold"
									onClick={e => this.setState({ displayDeploymentDashboard: !this.state.displayDeploymentDashboard })}
								>
									{"Deployment Dashboard " + (this.state.displayDeploymentDashboard ? "▲" : "▼")}
								</button>
							</div>
							<div className="prevPage" id="prevPage"></div>
						</div>
					</div>
					<ResultTray
						groups={this.state.serverGroups}
						killLogin={this.killServerLogin}
						login={this.loginToSingleServer}
						loginToGroup={this.loginToGroup}
					/>
				</div>
			</>
		);
	}

	/**Confirm that the user has entered both username and password. */
	hasLoginCredentials = () =>
	{
		if (this.state.username.length == 0)
		{
			alert("You need a username for that!");
			this.windowsFocusFix();
			return false;
		}
		if (this.state.password.length == 0)
		{
			alert("You need a password for that!");
			this.windowsFocusFix();
			return false;
		}
		return true;
	}

	/**
	 * Cancel the login command for specified server.
	 * @param server target server name
	 */
	killServerLogin = (serverName: string) =>
	{
		this.setServerStatus(serverName, "waiting", false);
		let serverID = getSafeServerID(serverName);
		$(`webview#${serverID}`).remove();
	}

	loginToGroup = (groupId: string) =>
	{
		if (this.hasLoginCredentials())
		{
			const group = this.state.serverGroups.filter(group => group.id == groupId)[0];
			const targetServers = group.servers.filter(server => server.status != "Good" && !server.running);

			//#region Mark servers as running
			const targetServerNames = targetServers.map(server => server.name);
			const newServerGroupStatus = JSON.parse(JSON.stringify(this.state.serverGroups)) as IServerGroupStatus[];
			newServerGroupStatus.forEach(group =>
			{
				const matches = group.servers.filter(server => targetServerNames.includes(server.name));
				matches.forEach(server =>
				{
					server.status = "waiting";
					server.running = true;
				});
			});
			this.setState({ serverGroups: newServerGroupStatus });
			//#endregion Mark servers as running

			targetServers.forEach(server =>
			{
				this.loginToServer(server.name);
			});
		}
	}

	loginToSingleServer = (serverName: string) =>
	{
		if (this.hasLoginCredentials())
		{
			this.setServerStatus(serverName, "waiting", true);
			this.loginToServer(serverName);
		}
	}

	/**
	 * Login to server and attach event handlers.
	 * @param serverName target server name
	 */
	loginToServer = (serverName: string) =>
	{
		const self = this;
		const server = serverName;
		const serverID = getSafeServerID(serverName);
		const newtab: JQuery<WebviewTag> = $(`<webview id="${serverID}" src="http://${server}/evo2/fresh/login.asp" webpreferences="disableDialogs" preload="./build/embedded.js"></webview>`);
		$("#prevPage").append(newtab);
		newtab.one("did-finish-load", function ()
		{
			newtab[0].send('login', self.state.username, self.state.password);
		});
		newtab[0].addEventListener('new-window', (e) =>
		{
			e.preventDefault();
			newtab[0].loadURL(e.url);
		});
		newtab[0].addEventListener('console-message', (e) =>
		{
			// This is not a typo. This is actually what the CRM logs to the console.
			if (
				e.message.indexOf("to prove that IE can show like all other broswers now") == -1 &&
				e.message.indexOf("%cElectron Security Warning") == -1 &&
				e.message.indexOf("(electron) Security Warning") == -1 &&
				e.message != "false"
			)
			{
				console.log(server + ':', e.message);
			}
		})
		newtab[0].addEventListener('ipc-message', (event) =>
		{
			if (event.channel == 'login-status')
			{
				this.updateServerEntry(server, event.args[0]);
				newtab.remove();
			}
			else if (event.channel == 'login-clicked')
			{
				newtab.one("load-commit", function ()
				{
					// console.log(server + ": load commit");
					newtab.one("did-navigate", function ()
					{
						// console.log(server + ": did-navigate");
						newtab.one("dom-ready", function ()
						{
							// console.log(server + ": dom-ready");
							newtab[0].send('check-status');
						});
						newtab.one("did-fail-load", function ()
						{
							// console.log(server + ": did-fail-load. This occurred after did-navigate.")
							newtab[0].send('check-status');
						});
					});
				});
			}
			else
			{
				console.log(event.channel)
			}
		});
	}

	/**
	 * Update the server report entry for specified server.
	 * @param serverName target server name
	 * @param status result of login
	 * @param build Optional. The build on the server.
	 */
	setServerStatus = (serverName: string, status: string, running: boolean = false, build?: string) =>
	{
		const newServerGroupStatus = JSON.parse(JSON.stringify(this.state.serverGroups)) as IServerGroupStatus[];
		newServerGroupStatus.forEach(group =>
		{
			const matches = group.servers.filter(server => server.name == serverName);
			matches.forEach(server =>
			{
				server.status = status;
				server.running = running;
				console.log(`~~~~~~~~~~~~~~~~~~~~~~~`);
				console.log(`Server name: ${serverName}`);
				console.log(`Status: ${status}`);
				if (build)
				{
					server.build = build;
					console.log(`Build: ${build}`);
				}
			});
		});
		this.setState({ serverGroups: newServerGroupStatus });
	}

	/**
	 * Update the server report entry for specified server.
	 * @param serverName target server name
	 * @param status result of login
	 */
	updateServerEntry = (serverName: string, status: string) =>
	{
		if (this.state.checkBuild)
		{
			getReleaseInfoJson(serverName).done((releaseInfo: IReleaseInfo) =>
			{
				this.setServerStatus(serverName, status, false, releaseInfo.BuildInfo.BUILD_BUILDNUMBER);
			});
		}
		else
		{
			this.setServerStatus(serverName, status);
		}
		depDashboard.SetServerState(serverName, status == "Good");
	}

	/**Corrects a behavior bug in windows where focus is not returned to the window after an alert. */
	windowsFocusFix = () =>
	{
		window.blur();
		window.focus();
	}
}