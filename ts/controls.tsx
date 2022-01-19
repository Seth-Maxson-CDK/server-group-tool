import * as React from 'react';
import { IServerGroupStatus, IServerStatus } from './interfaces';

interface IServerRowProps
{
	server: IServerStatus;
	killLogin: { (serverName: string): void };
	login: { (serverName: string): void }
}
class ServerRow extends React.Component<IServerRowProps> {
	render()
	{
		return (
			<tr className={this.props.server.name + " " + this.props.server.status.toLowerCase()}>
				<td className="indicator">{this.props.server.running ? <div className="lds-dual-ring"></div> : undefined}</td>
				<td className="name">
					{this.props.server.name}
					{
						this.props.server.running ?
							<button className="cancel-login-btn" onClick={() => this.props.killLogin(this.props.server.name)}>x</button> :
							<button className="server-login-btn" onClick={() => this.props.login(this.props.server.name)}>Go</button>
					}
				</td>
				<td className="status">{this.props.server.status == "waiting"? "Awaiting..." : this.props.server.status}</td>
				<td className="build">{this.props.server.build}</td>
			</tr>
		);
	}
}

interface IServerGroupReportProps
{
	group: IServerGroupStatus;
	killLogin: { (serverName: string): void };
	login: { (serverName: string): void }
}
interface IServerGroupReportState { }
export class ServerGroupReport extends React.Component<IServerGroupReportProps, IServerGroupReportState> {
	render()
	{
		return (
			<div className="group-report">
				<h2>{this.props.group.name}</h2>
				<table className="results-table">
					<thead>
						<tr>
							<th></th>
							<th>Server</th>
							<th>Status</th>
							<th>Build</th>
						</tr>
					</thead>
					<tbody>
						{this.props.group.servers.map((server, index: number) =>
							<ServerRow
								server={server}
								killLogin={this.props.killLogin}
								login={this.props.login}
								key={server.name}
							/>
						)}
					</tbody>
				</table>
			</div>
		);
	}
}

interface IResultTrayProps
{
	groups: IServerGroupStatus[];
	killLogin: { (serverName: string): void };
	login: { (serverName: string): void };
	loginToGroup: { (groupID: string): void };
}
interface IResultTrayState
{
	activeGroup: string;
	expanded: boolean;
}
export class ResultTray extends React.Component<IResultTrayProps, IResultTrayState> {
	// public static defaultProps = {
	// 	show: false
	// };
	constructor(props: IResultTrayProps)
	{
		super(props);
		this.state = {
			activeGroup: props.groups[0].id,
			expanded: true
		}
	}
	render()
	{
		const activeGroup = this.props.groups.filter(group => group.id == this.state.activeGroup)[0] as IServerGroupStatus;
		return (
			<div className={"result-tray" + (this.state.expanded ? "" : " hidden")}>
				<button className={"result-expand-button fold-button" + (this.state.expanded? " active" : "")} onClick={e => this.setState({ expanded: !this.state.expanded })}>
					<span>Results</span>
				</button>
				<div className="server-group-report">
					<h2>
						<select
							className="server-group-select"
							onChange={e => this.setState({ activeGroup: e.target.value })}
							value={this.state.activeGroup}
						>
							{this.props.groups.map((group, index: number) =>
								<option value={group.id} key={group.id} >
									{group.name}
								</option>
							)}
						</select>
						<button
							className="group-login-button"
							onClick={e => this.props.loginToGroup(this.state.activeGroup)}
						>
							{`Login to entire group`}
						</button>
					</h2>
					{/* <div className="additional-controls">
						<button
							className="group-login-button"
							onClick={e => this.props.loginToGroup(this.state.activeGroup)}
						>
							{`Login to ${activeGroup.name}`}
						</button>
					</div> */}
					<ServerGroupReport
						group={activeGroup}
						killLogin={this.props.killLogin}
						login={this.props.login}
					/>
				</div>
			</div>
		);
	}
}