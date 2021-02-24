// import React from 'react';
// import ReactDOM from 'react-dom';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { ServerGroup } from './interfaces';
// import './index.css';

class Square extends React.Component<{ value: string }, {}> {
	render() {
		return (
			<button className="square">
				{this.props.value}
			</button>
		);
	}
}

class Board extends React.Component {
	renderSquare(i: number|string) {
		return <Square value={i as string} />;
	}

	render() {
		const status = 'Next player: X';

		return (
			<div>
				<div className="status">{status}</div>
				<div className="board-row">
					{this.renderSquare(0)}
					{this.renderSquare(1)}
					{this.renderSquare(2)}
				</div>
				<div className="board-row">
					{this.renderSquare(3)}
					{this.renderSquare(4)}
					{this.renderSquare(5)}
				</div>
				<div className="board-row">
					{this.renderSquare(6)}
					{this.renderSquare(7)}
					{this.renderSquare(8)}
				</div>
			</div>
		);
	}
}

class Game extends React.Component {
	render() {
		return (
			<div className="game">
				<div className="game-board">
				<Board />
				</div>
				<div className="game-info">
				<div>{/* status */}</div>
				<ol>{/* TODO */}</ol>
				</div>
			</div>
		);
	}
}

class ServerRow extends React.Component<{ name: string }, {}> {
	render() {
	  return (
		<tr id={this.props.name + "-report"} className={this.props.name + " waiting"}>
			<td className="indicator"></td>
			<td className="name">
				{this.props.name}
			</td>
			<td className="status">Awaiting...</td>
		</tr>
	  );
	}
  }

export class ServerGroupReport extends React.Component<{ name: string, servers: string[] }, {}> {
	render()
	{
		const rows: JSX.Element[] = [];

		this.props.servers.forEach((server) => {
		  rows.push(
			<ServerRow
				  name={server}
				  key={server}
			/>
		  );
		});
		return (
			// 	<div className="group-report hidden">
			<div className="group-report">
				<h2>{this.props.name}</h2>
				<table className="results-table">
					<thead>
						<tr>
							<th></th>
							<th>Server</th>
							<th>Status</th>
						</tr>
					</thead>
					<tbody>
						{rows}
					</tbody>
				</table>
			</div>
		);
	}
}

export function doShit(groups: ServerGroup[]) {
	ReactDOM.render(
		<ServerGroupReport name={groups[0].name} servers={groups[0].servers} key={groups[0].name} />,
		document.getElementById('webFrame')
	);
}

// ========================================

// ReactDOM.render(
// 	<Game />,
// 	document.getElementById('root')
// );
