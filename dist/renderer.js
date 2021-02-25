"use strict";
// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
Object.defineProperty(exports, "__esModule", { value: true });
const $ = require("jquery");
const electron_1 = require("electron");
const fs = require("fs");
const deployment_dashboard_1 = require("./deployment-dashboard");
// const fs = require("fs");
const menu = {
    inputs: {
        username: $("#username-entry"),
        password: $("#password-entry")
    },
    buttons: {}
};
var depDashboard;
const loginCredentials = { username: "", password: "" };
var groups = [];
/**
 * Confirm that the user has entered both username and password.
 */
function hasLoginCredentials() {
    loginCredentials.username = "";
    loginCredentials.password = "";
    let un = menu.inputs.username.val();
    let pw = menu.inputs.password.val();
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
function loginToSingleServer(server) {
    let serverID = getSafeServerID(server);
    let reportRow = $(`tr.${serverID}`);
    reportRow.removeClass(["waiting", "good", "bad"]);
    reportRow.addClass("running");
    reportRow.find(`td.indicator`).html(`<div class="lds-dual-ring"></div>`);
    loginToServer(server);
}
/**
 * Login to server and attach event handlers.
 * @param serverName target server name
 */
function loginToServer(serverName) {
    let server = serverName;
    let newtab = $(`<webview id="${server}" src="http://${server}/evo2/fresh/login.asp" webpreferences="disableDialogs" preload="./dist/embedded.js"></webview>`);
    $("#prevPage").append(newtab);
    newtab.one("did-finish-load", function () {
        newtab[0].send('login', loginCredentials.username, loginCredentials.password);
    });
    newtab[0].addEventListener('new-window', (e) => {
        e.preventDefault();
        newtab[0].loadURL(e.url);
    });
    newtab[0].addEventListener('console-message', (e) => {
        // This is not a typo. This is actually what the CRM logs to the console.
        if (e.message.indexOf("to prove that IE can show like all other broswers now") == -1 &&
            e.message.indexOf("%cElectron Security Warning") == -1 &&
            e.message.indexOf("(electron) Security Warning") == -1 &&
            e.message != "false") {
            // e.message = server + ':' + e.message;
            console.log(server + ':', e.message);
        }
    });
    newtab[0].addEventListener('ipc-message', (event) => {
        if (event.channel == 'login-status') {
            updateServerOnReport(server, event.args[0]);
            newtab.remove();
        }
        else if (event.channel == 'login-clicked') {
            newtab.one("load-commit", function () {
                // console.log(server + ": load commit");
                newtab.one("did-navigate", function () {
                    // console.log(server + ": did-navigate");
                    newtab.one("dom-ready", function () {
                        // console.log(server + ": dom-ready");
                        newtab[0].send('check-status');
                    });
                    newtab.one("did-fail-load", function () {
                        // console.log(server + ": did-fail-load. This occurred after did-navigate.")
                        newtab[0].send('check-status');
                    });
                });
            });
        }
        else {
            console.log(event.channel);
        }
    });
}
/**
 * Cancel the login command for specified server.
 * @param server target server name
 */
function killServerLogin(server) {
    let serverID = getSafeServerID(server);
    $(`webview#${serverID}`).remove();
    let row = $(`tr.${serverID}`);
    row.removeClass("bad good running").addClass("waiting");
    row.find(`td.indicator`).html("");
}
/**
 * Creates the reports and controls for the servers.
 * @param serverGroups Collection of ServerGroup objects for the report(s).
 */
function prepareReports(serverGroups) {
    $(".group-report").remove();
    for (let i = 0; i < serverGroups.length; i++) {
        let group = serverGroups[i];
        let table = $(`<table class="results-table">
			<tr>
				<th></th>
				<th>Server</th>
				<th>Status</th>
			</tr>
		</table>`);
        group.servers.forEach(server => {
            let loginButton = $(`<button class="server-login"\>Go</button>`);
            let cancelButton = $(`<button class="cancel-login">x</button>`);
            loginButton.on("click", function () {
                if (hasLoginCredentials())
                    loginToSingleServer(server);
            });
            cancelButton.on("click", function () {
                killServerLogin(server);
            });
            let newRow = $(`
				<tr id="${server}-report" class="${server} waiting">
					<td class="indicator"></td>
					<td class="name">
						${server}
					</td>
					<td class="status">Awaiting...</td>
				</tr>
			`);
            newRow.find(".name").append(loginButton);
            newRow.find(".name").append(cancelButton);
            table.append(newRow);
        });
        let newReport = $(`<div id="group-${i + 1}-report" class="group-report hidden">
			<h2>Group ${i + 1}</h2>
		</div>`).append(table);
        $("#result-tray").append(newReport);
    }
}
/**
 * Update the server report entry for specified server.
 * @param server target server name
 * @param status result of login
 */
function updateServerOnReport(server, status) {
    let serverID = getSafeServerID(server);
    let row = $(`.results-table tr#${serverID}-report`);
    let statusEl = row.find(".status");
    statusEl.text(status);
    row.removeClass("running");
    row.removeClass("waiting");
    row.removeClass("bad");
    row.removeClass("good");
    if (status == "Good") {
        row.addClass("good");
        row.find(".indicator").html("&#10003;");
    }
    else {
        row.addClass("bad");
        row.find(".indicator").html("&#10005;");
    }
    depDashboard.SetServerState(server, status == "Good");
}
/**
 * Manages the displayed tab of the Server report.
 * @param targetID ID of the Server Group to display
 */
function clickTab(targetID) {
    let sender = $("#" + targetID);
    let target = $("#" + targetID + "-report");
    const isHidden = Boolean(target.hasClass('hidden'));
    $(".group-report").addClass("hidden");
    $(".tab-button").removeClass("active");
    if (isHidden == true) {
        target.removeClass('hidden');
        sender.addClass('active');
        $('#result-tray').removeClass('hidden');
    }
    else {
        $('#result-tray').addClass('hidden');
    }
}
/**
 * Basically just attaches event handlers
 */
function init() {
    $(".tab-button").on("click", function () {
        clickTab($(this).attr("id"));
    });
    $(".group-login-button").on("click", function () {
        loginToGroup($(this).attr("id"));
    });
    $("#claim-servers").on("click", function () {
        depDashboard.ClaimAll();
    });
    $("#min-button").on("click", function () {
        const window = electron_1.remote.getCurrentWindow();
        window.minimize();
    });
    $("#max-button").on("click", function () {
        const window = electron_1.remote.getCurrentWindow();
        window.isMaximized() == true ? window.unmaximize() : window.maximize();
    });
    $("#close-button").on("click", function () {
        const window = electron_1.remote.getCurrentWindow();
        window.close();
    });
}
function loginToGroup(buttonId) {
    if (hasLoginCredentials()) {
        let groupId = buttonId.substr(0, buttonId.indexOf("-button"));
        let reportRow = $(`#${groupId}-report tr.waiting, #${groupId}-report tr.bad`);
        reportRow.removeClass("waiting");
        reportRow.addClass("running");
        reportRow.find(`td.indicator`).html(`<div class="lds-dual-ring"></div>`);
        reportRow.each(function () {
            let server = $(this).attr("id");
            server = server.substr(0, server.indexOf("-report"));
            loginToServer(server);
        });
    }
}
/**
 * Loads the server definitions from the external file.
 */
function loadServerDefinitions() {
    var data = fs.readFileSync('//freshbeginnings/share/Development/SethM/Server-Group-Tool/servers.json');
    groups = JSON.parse(data.toString());
}
/**
 * Escapes a string so that it can be used as a CSS selector
 * @param serverName string to be escaped
 */
function getSafeServerID(serverName) {
    return serverName.replace(/\./g, "\\.");
}
$(document).ready(function () {
    loadServerDefinitions();
    prepareReports(groups);
    init();
    depDashboard = new deployment_dashboard_1.DeploymentDashboard();
    $("#depDashFrame").append(depDashboard.WebView);
    // doStuff(groups);
    const myNotification = new Notification('Title', {
        body: 'Notification from the Renderer process'
    });
    myNotification.onclick = () => {
        console.log('Notification clicked');
    };
});
//# sourceMappingURL=renderer.js.map