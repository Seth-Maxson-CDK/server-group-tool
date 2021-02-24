"use strict";
const { ipcRenderer } = require('electron');
const statuses = {
    bad: "Borked",
    good: "Good"
};
ipcRenderer.on('check-status', (event) => {
    console.log("check-status");
    var status = statuses.bad;
    if (document.getElementById("imageProduct") != null) {
        status = statuses.good;
    }
    ipcRenderer.sendToHost('login-status', status);
});
ipcRenderer.on('login', (event, username, password) => {
    console.log("login");
    try {
        $("#user").val(username);
        $("#password").val(password);
        loginForm.submit();
        ipcRenderer.sendToHost('login-clicked');
    }
    catch (error) {
        // console.log("couldn't even log in correctly.");
        // console.log(error);
        // JQuery didn't load because the standard login screen was bypassed (probably to an error message page)
        if (error.message.indexOf("ReferenceError: $ is not defined") != 1) {
            ipcRenderer.sendToHost('login-status', statuses.bad);
        }
        throw error;
    }
});
ipcRenderer.on('check-500', (event) => {
    try {
        let header = $("#header h1").val();
        if (header != undefined && header != "" && header.indexOf("Server Error") != -1) {
            ipcRenderer.sendToHost('login-status', statuses.bad);
        }
    }
    catch (error) {
        throw error;
    }
});
// Prevent annoying release note popups
let script = document.createElement('script');
script.innerText = `window.oldAlert=window.alert;window.alert=(msg)=>{ console.log('alert msg:', msg); };` +
    `window.oldConfirm=window.confirm;window.confirm=(msg)=>{ console.log('confirm msg:', msg); return true; };` +
    `window.oldPrompt=window.prompt;window.prompt=(msg, value) => { console.log('prompt msg:', msg, 'value:', value); return true; };`;
document.appendChild(script);
document.removeChild(script);
//# sourceMappingURL=embedded.js.map