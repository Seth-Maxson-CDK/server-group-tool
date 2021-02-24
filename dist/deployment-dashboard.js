"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeploymentDashboard = void 0;
const $ = require("jquery");
class DeploymentDashboard {
    constructor() {
        this.useLegacySetServerState = false;
        this.claimingAll = false;
        this.queue = [];
        const deploymentDashboardUrl = "http://supportstats:70/QATools/DeploymentDashBoard.aspx";
        this.WebView = $(`<webview id="Deployment-Dashboard" src="${deploymentDashboardUrl}" webpreferences="disableDialogs" preload="./dist/depdash-embedded.js"></webview>`);
        this.WebView[0].addEventListener('console-message', (e) => {
            console.log('Deployment Dashboard:', e.message);
        });
        this.WebView[0].addEventListener('ipc-message', (event) => {
            if (event.channel == 'claim-all-complete') {
                this.claimingAll = false;
            }
        });
        if (!this.useLegacySetServerState) {
            this.WebView.on("did-finish-load", () => {
                if (this.claimingAll) {
                    this.WebView[0].send('claim-all-servers');
                }
                else if (this.queue.length > 0) {
                    let serverName = this.queue[0].serverName;
                    let pass = this.queue[0].pass;
                    this.queue.shift();
                    console.log(`set-server-state: serverName: ${serverName}, pass: ${pass}`);
                    this.WebView[0].send('set-server-state', serverName, pass);
                }
            });
        }
    }
    ClaimAll() {
        this.claimingAll = true;
        if (this.useLegacySetServerState) {
            this.WebView.one("did-finish-load", () => {
                this.WebView[0].send('claim-all-servers');
            });
        }
    }
    /**
     * Updates the pass/fail state of a server on the dashboard
     * @param serverName The name of the server to update
     * @param pass Did the server pass?
     */
    SetServerState(serverName, pass) {
        this.queue.push({ serverName: serverName, pass: pass });
        if (this.useLegacySetServerState) {
            this.WebView.one("did-finish-load", () => {
                this.WebView[0].send('set-server-state', serverName, pass);
            });
        }
    }
}
exports.DeploymentDashboard = DeploymentDashboard;
//# sourceMappingURL=deployment-dashboard.js.map