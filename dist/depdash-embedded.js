"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { ipcRenderer } = require('electron');
ipcRenderer.on('set-server-state', (event, serverName, pass) => {
    try {
        // console.log(`set-server-state for ${serverName}, state: ${pass? "Passed" : "Failed"}`);
        setServerState(serverName, pass);
    }
    catch (error) {
        throw error;
    }
});
ipcRenderer.on('claim-all-servers', (event) => {
    try {
        claimAll();
    }
    catch (error) {
        throw error;
    }
});
ipcRenderer.on('check-group-status', (event) => {
    if (isInteractive()) {
        ipcRenderer.sendToHost('group-deploy-complete', true);
    }
});
ipcRenderer.on('check-login-status', (event) => {
    if (!isInteractive()) {
        ipcRenderer.sendToHost('group-login-complete', true);
    }
});
/**
 * Updates the pass/fail state of a server on the dashboard
 * @param serverName The name of the server to update
 * @param pass Did the server pass?
 */
function setServerState(serverName, pass) {
    let relevantTR = $(`#gvServerList a:contains(${serverName.toUpperCase()})`).closest("tr");
    let control = relevantTR.find(`input[type="checkbox"]`);
    if (control) {
        let checkState = control.attr("checked") == "checked";
        if (checkState !== pass) {
            // console.log(`set-server-state for ${serverName}, clicked the checkbox`);
            control.click();
            // setTimeout(`__doPostBack(\'gvServerList$${controlName}\',\'\')`, 0);
        }
        ;
    }
    else {
        // console.log(`set-server-state for ${serverName}, couldn't find the checkbox`);
    }
}
/**
 * Claim all unclaimed servers
 */
function claimAll() {
    let unclaimed = $(`input[type="submit"][value="Unclaimed"]`);
    if (unclaimed.length > 0) {
        unclaimed[0].click();
    }
    else {
        ipcRenderer.sendToHost('claim-all-complete', true);
    }
}
/**Check if there is currently an interactive server group on the dashboard. This can serve as an indicator of whether the deployment of the most recent server group has finished. */
function isInteractive() {
    return $("#gvServerList a").length > 0;
}
// console.log("depdash-embedded.js loaded");
//# sourceMappingURL=depdash-embedded.js.map