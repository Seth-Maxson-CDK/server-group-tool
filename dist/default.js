"use strict";
(function () {
    const remote = require('electron').remote;
    function init() {
        var _a, _b, _c;
        (_a = document.getElementById("min-button")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", function (e) {
            const window = remote.getCurrentWindow();
            window.minimize();
        });
        (_b = document.getElementById("max-button")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", function (e) {
            const window = remote.getCurrentWindow();
            if (!window.isMaximized()) {
                window.maximize();
            }
            else {
                window.unmaximize();
            }
        });
        (_c = document.getElementById("close-button")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", function (e) {
            const window = remote.getCurrentWindow();
            window.close();
        });
    }
    ;
    document.onreadystatechange = function () {
        if (document.readyState == "complete") {
            init();
        }
    };
})();
//# sourceMappingURL=default.js.map