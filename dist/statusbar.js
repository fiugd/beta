/*!
	fiug statusbar component
	Version 0.4.6 ( 2022-08-19T20:28:07.313Z )
	https://github.com/fiugd/fiug/statusbar
	(c) 2020-2021 Harrison Cross, MIT License
*/
/*!
	from https://beta.fiug.dev/package.json
*/
var packageJson = {
    name: "fiug",
    version: "0.4.6",
    description: "cloud IDE without the cloud",
    main: "index.js",
    scripts: {
        watch: "browser-sync start --config .browsersync.js",
        test: "jest --watch"
    },
    author: "",
    license: "ISC",
    devDependencies: {
        "browser-sync": "^2.26.14",
        jest: "^26.6.3"
    },
    dependencies: {}
};

const SYSTEM_NAME = `${packageJson.name} v${packageJson.version}`;

function StatusBar() {
    const statusBar = document.createElement("div");
    statusBar.id = "status-bar";
    statusBar.innerHTML = `\n<div class="bg"></div>\n\n<div class="statusbar-item statusbar-entry left" statusbar-entry-priority="10000" statusbar-entry-alignment="0">\n\t<a title="">${SYSTEM_NAME}</a>\n</div>\n\n<div class="statusbar-item right">\n\t<div class="editor-statusbar-item">\n\t\t<a class="editor-status-selection" title="Go to Line" style="">\n\t\t\tLn <span class="line-number">--</span>,\n\t\t\tCol <span class="column-number">--</span>\n\t\t</a>\n\t\t<a class="editor-status-indentation" title="Select Indentation" style=""></a>\n\t\t<a class="editor-status-encoding hidden" title="Select Encoding" style="">UTF-8</a>\n\t\t<a class="editor-status-eol hidden" title="Select End of Line Sequence" style="">LF</a>\n\t\t<a class="editor-status-mode" title="Select Language Mode" style="">--</a>\n\t</div>\n</div>\n\t`;
    document.body.appendChild(statusBar);
}

StatusBar();