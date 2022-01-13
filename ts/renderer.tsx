// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

import * as $ from 'jquery';
import { remote, WebviewTag } from 'electron';
import * as fs from 'fs';
import { DeploymentDashboard } from './deployment-dashboard';
import { ResultTray } from './controls';
import { IReleaseInfo, IServerGroup, IServerGroupStatus } from './interfaces';
import ReactDOM = require('react-dom');
import React = require('react');

const menu = {
	inputs: {
		username: $("#username-entry"),
		password: $("#password-entry")
	},
	buttons: {

	}
}
var depDashboard: DeploymentDashboard;

const loginCredentials = { username: "", password: "" };
let groups: IServerGroup[] = [];
let groupStatus: IServerGroupStatus[] = [];
let checkBuildOnServer: boolean = false;


/**
 * Manages the displayed tab of the Server report.
 * @param targetID ID of the Server Group to display
 */
 function clickTab(targetID: string) {
	let sender = $("#" + targetID);
	let target = $("#" + targetID + "-report");
	const isHidden = Boolean(target.hasClass('hidden'));

	$(".group-report").addClass("hidden");
	$(".tab-button").removeClass("active");
	if (isHidden == true)
	{
		target.removeClass('hidden');
		sender.addClass('active');
		$('#result-tray').removeClass('hidden');
	} else
	{
		$('#result-tray').addClass('hidden');
	}
}

/**
 * Gets the releaseinfo.json for the chosen server.
 */
function getReleaseInfoJson(serverName: string) {
	return $.ajax({
		url: `http://${serverName}/evo2/releaseinfo.json`,
	});
}

/**
 * Escapes a string so that it can be used as a CSS selector
 * @param serverName string to be escaped
 */
function getSafeServerID(serverName: string): string
{
	return serverName.replace(/\./g, "\\.");
}

/**
 * Confirm that the user has entered both username and password.
 */
function hasLoginCredentials()
{
	loginCredentials.username = "";
	loginCredentials.password = "";
	let un = menu.inputs.username.val() as string;
	let pw = menu.inputs.password.val() as string;

	if (un.length == 0) {
		alert("You need a username for that!");
		return false;
	}
	if (pw.length == 0) {
		alert("You need a password for that!");
		return false;
	}
	loginCredentials.username = un;
	loginCredentials.password = pw;
	return true;
}

/**
 * Basically just attaches event handlers
 */
function init()
{
	$(".tab-button").on("click", function() {
		clickTab($(this).attr("id") as string);
	});

	$(".group-login-button").on("click", function ()
	{
		const buttonId = $(this).attr("id") as string;
		const groupId = buttonId.substr(0, buttonId.indexOf("-button"));
		loginToGroup(groupId);
	});

	$("#claim-servers").on("click", function () {
		depDashboard.ClaimAll();
	});

	$("#min-button").on("click", function () {
		const window = remote.getCurrentWindow();
		window.minimize();
	});

	$("#max-button").on("click", function () {
		const window = remote.getCurrentWindow();
		window.isMaximized() == true? window.unmaximize() : window.maximize();
	});

	$("#close-button").on("click", function () {
		const window = remote.getCurrentWindow();
		window.close();
	});

	$("#check-check-build").on("click", function () {
		getReleaseInfoJson("LASPELWB002G01");
		checkBuildOnServer != checkBuildOnServer;
	});
}

/**
 * Cancel the login command for specified server.
 * @param server target server name
 */
function killServerLogin(server: string)
{
	let serverID = getSafeServerID(server);
	$(`webview#${serverID}`).remove();
	let row = $(`tr.${serverID}`);
	row.removeClass("bad good running").addClass("waiting");
	row.find(`td.indicator`).html("");
}

/**
 * Loads the server definitions from the external file.
 */
function loadServerDefinitions() {
	var data = fs.readFileSync('//freshbeginnings/share/Development/SethM/Server-Group-Tool/servers.json');
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
					status: "Awaiting...",
					build: "Not yet known",
					running: false,
				}
			})
		}
	});
}

function loginToGroup(groupId: string) {
	if (hasLoginCredentials())
	{
		const reportRow = $(`#${groupId}-report tr.waiting, #${groupId}-report tr.bad`) as JQuery<HTMLTableRowElement>;
		reportRow.removeClass("waiting");
		reportRow.addClass("running");
		reportRow.find(`td.indicator`).html(`<div class="lds-dual-ring"></div>`);
		reportRow.each(function() {
			let server = $(this).attr("id") as string;
			server = server.substr(0, server.indexOf("-report"));
			loginToServer(server);
		});
	}
}

/**
 * Login to server and attach event handlers.
 * @param serverName target server name
 */
function loginToServer(serverName: string) {
	let server = serverName;
	let newtab: JQuery<WebviewTag> = $(`<webview id="${server}" src="http://${server}/evo2/fresh/login.asp" webpreferences="disableDialogs" preload="./build/embedded.js"></webview>`);
	$("#prevPage").append(newtab);
	newtab.one("did-finish-load", function(){
		newtab[0].send('login', loginCredentials.username, loginCredentials.password);
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

			// e.message = server + ':' + e.message;
			console.log(server + ':', e.message);
		}
	})
	newtab[0].addEventListener('ipc-message', (event) =>
	{
		if (event.channel == 'login-status')
		{
			updateServerOnReport(server, event.args[0]);
			newtab.remove();
		}
		else if (event.channel == 'login-clicked'){
			newtab.one("load-commit", function(){
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

function loginToSingleServer(server: string) {
	let serverID = getSafeServerID(server);
	let reportRow = $(`tr.${serverID}`);
	reportRow.removeClass(["waiting", "good", "bad"]);
	reportRow.addClass("running");
	reportRow.find(`td.indicator`).html(`<div class="lds-dual-ring"></div>`);

	loginToServer(server);
}

/**
 * Creates the reports and controls for the servers.
 * @param serverGroups Collection of ServerGroup objects for the report(s).
 */
function prepareReports(serverGroups: IServerGroup[])
{
	$(".group-report").remove();
	for (let i = 0; i < serverGroups.length; i++) {
		let group = serverGroups[i];
		let table = $(`<table class="results-table">
			<tr>
				<th></th>
				<th>Server</th>
				<th>Status</th>
				<th class="build">Build</th>
			</tr>
		</table>`);
		group.servers.forEach(server => {
			let loginButton = $(`<button class="server-login"\>Go</button>`);
			let cancelButton = $(`<button class="cancel-login">x</button>`);

			loginButton.on("click", function() {
				if (hasLoginCredentials()) loginToSingleServer(server);
			});
			cancelButton.on("click", function() {
				killServerLogin(server);
			});

			let newRow = $(`
				<tr id="${server}-report" class="${server} waiting">
					<td class="indicator"></td>
					<td class="name">
						${server}
					</td>
					<td class="status">Awaiting...</td>
					<td class="build">Not yet known</td>
				</tr>
			`);
			newRow.find(".name").append(loginButton);
			newRow.find(".name").append(cancelButton);
			table.append(newRow);
		});

		let newReport = $(`<div id="group-${i+1}-report" class="group-report hidden">
			<h2>Group ${i+1}</h2>
		</div>`).append(table);
		$("#result-tray").append(newReport);
		ReactDOM.render(
			<ResultTray groups={groupStatus} />,
			document.getElementById('result-tray')
		);
	}
}

/**
 * Update the server report entry for specified server.
 * @param serverName target server name
 * @param status result of login
 * @param build Optional. The build on the server.
 */
 function setServerStatus(serverName: string, status: string, build?: string)
 {
	 groupStatus.forEach(group =>
	 {
		 const matches = group.servers.filter(server => server.name == serverName);
		 matches.forEach(server => {
			 server.status = status;
			 if (build) {
				 server.build = build;
			 }
		 });
	 });
	 depDashboard.SetServerState(serverName, status == "Good");
 }

/**
 * Update the server report entry for specified server.
 * @param serverName target server name
 * @param status result of login
 */
function updateServerEntry(serverName: string, status: string)
{
	if (checkBuildOnServer) {
		getReleaseInfoJson(serverName).done(function (releaseInfo: IReleaseInfo)
		{
			setServerStatus(serverName, status, releaseInfo.BuildInfo.BUILD_BUILDNUMBER);
		});
	}
	else
	{
		setServerStatus(serverName, status);
	}
}

/**
 * Update the server report entry for specified server.
 * @param server target server name
 * @param status result of login
 */
function updateServerOnReport(server: string, status: string)
{
	let serverID = getSafeServerID(server);
	let row = $(`.results-table tr#${serverID}-report`);
	let statusEl = row.find(".status");

	statusEl.text(status)
	row.removeClass("running");
	row.removeClass("waiting");
	row.removeClass("bad");
	row.removeClass("good");
	if (status == "Good") {
		row.addClass("good");
		row.find(".indicator").html("&#10003;");
	} else {
		row.addClass("bad");
		row.find(".indicator").html("&#10005;");
	}
	depDashboard.SetServerState(server, status == "Good");
}

$(document).ready(function(){
	loadServerDefinitions();
	prepareReports(groups);
	init();
	depDashboard = new DeploymentDashboard();
	$("#depDashFrame").append(depDashboard.WebView);
})