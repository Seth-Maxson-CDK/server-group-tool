import * as React from 'react';
import { IServerGroupStatus, IServerStatus } from './interfaces';


interface IServerRowProps
{
	server: IServerStatus;
}
class ServerRow extends React.Component<IServerRowProps> {
	render()
	{
		return (
			<tr className={this.props.server.name + " waiting"}>
				<td className="indicator">{this.props.server.running ? <div className="lds-dual-ring"></div> : undefined}</td>
				<td className="name">
					{this.props.server.name}
					{this.props.server.running ? <button className="cancel-login-btn">x</button> : <button className="server-login-btn">Go</button>}
				</td>
				<td className="status">{this.props.server.status}</td>
				<td className="build">{this.props.server.build}</td>
			</tr>
		);
	}
}

interface IServerGroupReportProps
{
	group: IServerGroupStatus;
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
}
interface IResultTrayState
{
	activeGroup: string;
	expanded: boolean;
}
export class ResultTray extends React.Component<IResultTrayProps, IResultTrayState> {
	public static defaultProps = {
		show: false
	};
	constructor(props: IResultTrayProps)
	{
		super(props);
		this.state = {
			activeGroup: props.groups[0].id,
			expanded: false
		}
	}
	render()
	{
		return (
			<div className={"result-tray" + (this.state.expanded ? "" : " hidden")}>
				{
					!this.state.expanded &&
					<button className="result-expand-button" onClick={e => this.setState({ expanded: true })}>
						<span>Results</span>
					</button>
				}
				<div className="server-group-report">
					<h2>
						<button onClick={e => this.setState({ expanded: false })}>
							<span>{">>"}</span>
						</button>
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
					</h2>
					<ServerGroupReport group={this.props.groups.filter(group => group.id == this.state.activeGroup)[0]} />
				</div>
			</div>
		);
	}
}