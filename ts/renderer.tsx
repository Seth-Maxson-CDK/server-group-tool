// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

import * as $ from 'jquery';
import { remote, WebviewTag } from 'electron';
import * as fs from 'fs';
import { DeploymentDashboard } from './deployment-dashboard';
import { AppMain } from './components/main';
import { IReleaseInfo, IServerGroup, IServerGroupStatus } from './interfaces';
import ReactDOM = require('react-dom');
import React = require('react');

export var depDashboard: DeploymentDashboard;
let groups: IServerGroup[] = [];
let groupStatus: IServerGroupStatus[] = [];

//@ts-ignore
alert = function (message: string)
{
	var options = {
		type: 'warning',
		buttons: ["Ok"],
		defaultId: 0,
		cancelId: 0,
		detail: message,
		message: ''
	}
	remote.dialog.showMessageBoxSync(options);
}

/**
 * Gets the releaseinfo.json for the chosen server.
 */
export function getReleaseInfoJson(serverName: string)
{
	return $.ajax({
		url: `http://${serverName}/evo2/releaseinfo.json`,
	});
}

/**
 * Escapes a string so that it can be used as a CSS selector
 * @param serverName string to be escaped
 */
export function getSafeServerID(serverName: string): string
{
	return serverName.replace(/\./g, "\\.");
}

/**
 * Basically just attaches event handlers
 */
function init()
{
	document.getElementById("min-button")?.addEventListener("click", function (e)
	{
		const window = remote.getCurrentWindow();
		window.minimize();
	});

	document.getElementById("max-button")?.addEventListener("click", function (e)
	{
		const window = remote.getCurrentWindow();
		window.isMaximized() ? window.unmaximize() : window.maximize();
	});

	document.getElementById("close-button")?.addEventListener("click", function (e)
	{
		const window = remote.getCurrentWindow();
		window.close();
	});
}

/**
 * Loads the server definitions from the external file.
 */
function loadServerDefinitions()
{
	let data = fs.readFileSync('//freshbeginnings/share/Development/SethM/Server-Group-Tool/servers.json');
	groups = JSON.parse(data.toString());
	groupStatus = groups.map((group) =>
	{
		return {
			id: group.id,
			name: group.name,
			servers: group.servers.map(server =>
			{
				return {
					name: server,
					status: "waiting",
					build: "Not yet known",
					running: false,
				}
			})
		}
	});
}

$(document).ready(function ()
{
	loadServerDefinitions();
	ReactDOM.render(
		<AppMain groups={groupStatus} />,
		document.getElementById('react-container')
	);
	init();
	depDashboard = new DeploymentDashboard();
	$("#depDashFrame").append(depDashboard.WebView);
})