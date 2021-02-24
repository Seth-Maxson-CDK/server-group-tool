"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.doShit = exports.ServerGroupReport = void 0;
// import React from 'react';
// import ReactDOM from 'react-dom';
const React = require("react");
const ReactDOM = require("react-dom");
// import './index.css';
class Square extends React.Component {
    render() {
        return (React.createElement("button", { className: "square" }, this.props.value));
    }
}
class Board extends React.Component {
    renderSquare(i) {
        return React.createElement(Square, { value: i });
    }
    render() {
        const status = 'Next player: X';
        return (React.createElement("div", null,
            React.createElement("div", { className: "status" }, status),
            React.createElement("div", { className: "board-row" },
                this.renderSquare(0),
                this.renderSquare(1),
                this.renderSquare(2)),
            React.createElement("div", { className: "board-row" },
                this.renderSquare(3),
                this.renderSquare(4),
                this.renderSquare(5)),
            React.createElement("div", { className: "board-row" },
                this.renderSquare(6),
                this.renderSquare(7),
                this.renderSquare(8))));
    }
}
class Game extends React.Component {
    render() {
        return (React.createElement("div", { className: "game" },
            React.createElement("div", { className: "game-board" },
                React.createElement(Board, null)),
            React.createElement("div", { className: "game-info" },
                React.createElement("div", null),
                React.createElement("ol", null))));
    }
}
class ServerRow extends React.Component {
    render() {
        return (React.createElement("tr", { id: this.props.name + "-report", className: this.props.name + " waiting" },
            React.createElement("td", { className: "indicator" }),
            React.createElement("td", { className: "name" }, this.props.name),
            React.createElement("td", { className: "status" }, "Awaiting...")));
    }
}
class ServerGroupReport extends React.Component {
    render() {
        const rows = [];
        this.props.servers.forEach((server) => {
            rows.push(React.createElement(ServerRow, { name: server, key: server }));
        });
        return (
        // 	<div className="group-report hidden">
        React.createElement("div", { className: "group-report" },
            React.createElement("h2", null, this.props.name),
            React.createElement("table", { className: "results-table" },
                React.createElement("thead", null,
                    React.createElement("tr", null,
                        React.createElement("th", null),
                        React.createElement("th", null, "Server"),
                        React.createElement("th", null, "Status"))),
                React.createElement("tbody", null, rows))));
    }
}
exports.ServerGroupReport = ServerGroupReport;
function doShit(groups) {
    ReactDOM.render(React.createElement(ServerGroupReport, { name: groups[0].name, servers: groups[0].servers, key: groups[0].name }), document.getElementById('webFrame'));
}
exports.doShit = doShit;
// ========================================
// ReactDOM.render(
// 	<Game />,
// 	document.getElementById('root')
// );
//# sourceMappingURL=controls.js.map