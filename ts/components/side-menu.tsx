import * as React from 'react';

interface ISideMenuProps
{
	username: string;
	password: string;
	claimAllServers: boolean;
	checkBuild: boolean;
	toggleClaimAllServers: { (value: boolean): void };
	toggleCheckBuild: { (value: boolean): void };
	updateUsername: { (value: string): void };
	updatePassword: { (value: string): void };
}
export class SideMenu extends React.Component<ISideMenuProps> {
	public static defaultProps = {
		checkBuild: false,
		claimAllServers: false
	};
	render()
	{
		return (
			<div className="side-menu">
				<input
					type="text"
					id="username-entry"
					placeholder="username"
					value={this.props.username}
					onChange={e => this.props.updateUsername(e.target.value)}
					tabIndex={1}
				/>
				<input
					type="password"
					id="password-entry"
					placeholder="password"
					value={this.props.password}
					onChange={e => this.props.updatePassword(e.target.value)}
					tabIndex={2}
				/>
				<div className="no-select">
					<div className="control" style={{ width: "100%", marginTop: "50px" }}>
						<span className="control-name">
							Claim All Servers
						</span>
						<label className="switch">
							<input type="checkbox" id="check-claim-servers" checked={this.props.claimAllServers} onChange={e => this.props.toggleClaimAllServers(e.target.checked)} />
							<span className="slider"></span>
						</label>
					</div>
					<div className="control" style={{ width: "100%" }}>
						<span className="control-name">
							Check Build
						</span>
						<label className="switch">
							<input type="checkbox" id="check-check-build" checked={this.props.checkBuild} onChange={e => this.props.toggleCheckBuild(e.target.checked)} />
							<span className="slider"></span>
						</label>
					</div>
				</div>
			</div>
		);
	}
}