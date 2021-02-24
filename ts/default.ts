(function ()
{

	const remote = require('electron').remote;

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
			if (!window.isMaximized())
			{
				window.maximize();
			} else
			{
				window.unmaximize();
			}
		});

		document.getElementById("close-button")?.addEventListener("click", function (e)
		{
			const window = remote.getCurrentWindow();
			window.close();
		});
	};

	document.onreadystatechange = function ()
	{
		if (document.readyState == "complete")
		{
			init();
		}
	};
})();