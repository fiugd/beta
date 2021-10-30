import { getSettings } from '../../utils/State.js';

const { SYSTEM_NAME } = getSettings();

let bar;
function StatusBar(){
	if (bar) {
		return bar;
	}
	const statusBar = document.createElement('div');
	statusBar.id = "status-bar";
	const settings = getSettings();
	const tabSettingsElString = (s) => `${s.indentWithTabs ? 'Tabs' : 'Spaces'}: <span class="tab-size">${s.tabSize}</span>`
	statusBar.innerHTML = `
	<style>
		#status-bar {
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			height: 22px;
			font-size: 12px;
			padding: 2px 10px;
			z-index: 10;
			border-top: 0.5px solid #000A;
			/*
			box-shadow: 0 -1px 5px #000F;
			*/
		}
		#status-bar .bg {
			position: absolute;
			left: 0;
			right: 0;
			top: 0;
			bottom: 0;
			box-sizing: border-box;
			background: #3333;
			pointer-events: none;
			background: #0006;
			z-index: -1;
			/*
			border-top: 1px solid #111a;
			background: #1f476b;
			background: #4f263d;
			background: rgb(var(--main-theme-highlight-color));
			filter: brightness(0.6);
			*/
		}
		#status-bar, #status-bar * {
			cursor: default;
		}
		#status-bar a:hover { color: white }
		#status-bar a { color: #dadada; }

		/*
		#status-bar a { color: var(--main-theme-text-invert-color); }
		#status-bar a { color: white; }
		#status-bar a:hover { color: var(--main-theme-text-color); }
		#status-bar a { color: var(--main-theme-text-color); }
		*/

		.statusbar-item { z-index: 1; }
		.statusbar-item.right a {
			margin-left: 10px;
		}
		#status-bar .editor-status-mode {
			text-transform: capitalize;
		}
		#status-bar .editor-status-mode.uppercase {
			text-transform: uppercase !important;
		}
	</style>

	<div class="bg"></div>

	<div class="statusbar-item statusbar-entry left" statusbar-entry-priority="10000" statusbar-entry-alignment="0">
	</div>

	<div class="statusbar-item right">
		<div class="editor-statusbar-item">
			<a class="editor-status-selection" title="Go to Line" style="">
				Line <span class="line-number">--</span>,
				Col <span class="column-number">--</span>
			</a>
			<a class="editor-status-indentation" title="Select Indentation" style="">${tabSettingsElString(settings)}</a>
			<a class="editor-status-encoding hidden" title="Select Encoding" style="">UTF-8</a>
			<a class="editor-status-eol hidden" title="Select End of Line Sequence" style="">LF</a>
			<a class="editor-status-mode" title="Select Language Mode" style="">--</a>
		</div>
	</div>
`;

	const tabSettingsEl = statusBar.querySelector('.editor-status-indentation');
	tabSettingsEl.addEventListener("click", () => {
		//console.warn('pop up menu to select tab size and indentation style');
		settings.indentWithTabs = !settings.indentWithTabs;
		localStorage.setItem('editorSettings', JSON.stringify(settings));
		tabSettingsEl.innerHTML = tabSettingsElString(settings);
		Editor.setOption("indentWithTabs", settings.indentWithTabs);
	});

	function setLineNumber(number){
		const el = statusBar.querySelector('.editor-status-selection .line-number');
		el.innerHTML = number;
	}
	function setColNumber(number){
		const el = statusBar.querySelector('.editor-status-selection .column-number');
		el.innerHTML = number;
	}
	function setTabSize(number){
		const el = statusBar.querySelector('.editor-status-indentation .tab-size');
		el.innerHTML = number;
	}
	function setDocType(type){
		const el = statusBar.querySelector('.editor-status-mode');
		el.classList.remove('uppercase');
		let docType = type;
		if(type.json){
			docType = 'json';
		}
		if(type.typescript){
			docType = 'TypeScript';
		}
		if(type.assemblyscript){
			docType = 'AssemblyScript';
		}
		if(type.name && type.name.includes('html')){
			docType = 'html';
		}
		const extMap = {
			'default': 'Plain Text',
			'text/x-csrc': 'C',
			'text/x-c++src': 'C++',
			'wat': 'WebAssembly',
			'piskel': 'Piskel',
			'javascript': 'JavaScript',
			'text/apl': 'APL',
		};
		if(extMap[type]){
			docType = extMap[type];
		}
		while(docType.toString().includes('object')){
			if(docType.name){
				docType = docType.name;
				continue;
			}
			docType = 'Plain Text';
		}

		const capThese = ['css', 'html', 'json', 'xml', 'jsx', 'php', 'sql'];
		if(docType.toLowerCase && capThese.includes(docType.toLowerCase())){
			el.classList.add('uppercase');
		}

		el.innerHTML = docType;
	}
	//attachListeners({ setLineNumber, setColNumber, setTabSize, setDocType });

	document.body.appendChild(statusBar);
	return {
		operations: { setLineNumber, setColNumber, setTabSize, setDocType },
		container: statusBar
	};
}
export default StatusBar;
