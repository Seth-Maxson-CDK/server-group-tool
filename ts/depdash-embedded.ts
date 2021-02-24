export { };
const { ipcRenderer } = require('electron');

ipcRenderer.on('set-server-state', (event: any, serverName: string, pass: boolean) =>
{
	try
	{
		// console.log(`set-server-state for ${serverName}, state: ${pass? "Passed" : "Failed"}`);
		setServerState(serverName, pass);
	} catch (error)
	{
		throw error;
	}
})


ipcRenderer.on('claim-all-servers', (event: any)=>
{
	try
	{
		// console.log("claim-all-servers called");
		claimAll();
	} catch (error)
	{
		throw error;
	}
})

/**
 * Updates the pass/fail state of a server on the dashboard
 * @param serverName The name of the server to update
 * @param pass Did the server pass?
 */
function setServerState(serverName: string, pass: boolean)
{
	let relevantTR = $(`#gvServerList a:contains(${serverName.toUpperCase()})`).closest("tr");
	let control = relevantTR.find(`input[type="checkbox"]`);
	if (control) {
		let checkState = control.attr("checked") == "checked";
		if (checkState !== pass)
		{
			// console.log(`set-server-state for ${serverName}, clicked the checkbox`);
			control.click();
			// setTimeout(`__doPostBack(\'gvServerList$${controlName}\',\'\')`, 0);
		};
	}
	else
	{
		// console.log(`set-server-state for ${serverName}, couldn't find the checkbox`);
	}
}


/**
 * Claim all unclaimed servers
 */
function claimAll()
{
	let unclaimed = $(`input[type="submit"][value="Unclaimed"]`);
	if (unclaimed.length >0) {
		unclaimed[0].click();
	} else
	{
		ipcRenderer.sendToHost('claim-all-complete', true);
	}
}


// console.log("depdash-embedded.js loaded");