import { attachListeners } from './statusBarEvents.mjs';
import packageJson from "/package.json" assert { type: "json" };
const SYSTEM_NAME = `${packageJson.name} v${packageJson.version}`;

let bar;
function StatusBar(){
	if (bar) return bar;
	const statusBar = document.createElement('div');
	statusBar.id = "status-bar";
	statusBar.innerHTML = `
<div class="bg"></div>

<div class="statusbar-item statusbar-entry left" statusbar-entry-priority="10000" statusbar-entry-alignment="0">
	<a title="">${SYSTEM_NAME}</a>
</div>

<div class="statusbar-item right">
	<div class="editor-statusbar-item">
		<a class="editor-status-selection" title="Go to Line" style="">
			Ln <span class="line-number">--</span>,
			Col <span class="column-number">--</span>
		</a>
		<a class="editor-status-indentation" title="Select Indentation" style=""></a>
		<a class="editor-status-encoding hidden" title="Select Encoding" style="">UTF-8</a>
		<a class="editor-status-eol hidden" title="Select End of Line Sequence" style="">LF</a>
		<a class="editor-status-mode" title="Select Language Mode" style="">--</a>
	</div>
</div>
	`;
	attachListeners({});
	document.body.appendChild(statusBar);
}

StatusBar();;
