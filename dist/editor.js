/*!
	fiug editor component
	Version v0.4.6
	Build Date 2021-10-30T04:42:44.687Z
	https://github.com/crosshj/fiug
	(c) 2011-2012 Harrison Cross.
*/

let allServices;
let currentService$1;

const dummyFunc = (fnName, returns='') => (...args) => {
	console.log({ ...args, fnName });
	return returns;
};

const getCurrentFile = dummyFunc('getCurrentFile');
const getCurrentFileFull = () => currentService$1.state.selected;
const setCurrentFile = ({ filePath }) => {
	const found = currentService$1.code
		.find(x => x.name === filePath ||
			x.path === '/'+filePath ||
			x.path === '/'+currentService$1.name+'/'+filePath
		);
	if(found){		currentService$1.state.selected = found;
		currentService$1.state.selected.filename = found.name;
		return;
	}
	console.error(`could not find ${filePath}`);
};


const getAllServices = () => allServices;

const getCurrentService = () => currentService$1;

const getState$1 = dummyFunc('getState');
const setState = dummyFunc('setState');

const getSettings = dummyFunc('getSettings', { indentWithTabs: true, tabSize: 2 });

const initState = (all, current) => {
	allServices = all;
	currentService$1 = current;
};

var ext = {
		"mp3": "audio",
		"wav": "audio",
		"ogg": "audio",
		"adb": "ada",
		"ads": "ada",
		"adoc": "asciidoc",
		"apl": "apl",
		"bowerrc": "bower",
		"bf": "brainfuck",
		"cs": "csharp",
		"c": "c",
		"h": "c",
		"m": "c",
		"ctp": "cake_php",
		"clj": "clojure",
		"cljc": "clojure",
		"cljs": "clojure",
		"cjsx": "react",
		"jsx": "react",
		"tmp": "clock",
		"coffee": "coffee",
		"cfc": "coldfusion",
		"cfm": "coldfusion",
		"config": "config",
		"cpp": "cpp",
		"cr": "crystal",
		"cs": "csharp",
		"css": "css",
		"dart": "dart",
		"sss": "css",
		"csv": "csv",
		"edn": "clojure",
		"editorconfig": "config",
		"ejs": "ejs",
		"elm": "elm",
		"ttf": "font",
		"woff": "font",
		"woff2": "font",
		"eot": "font",
		"gitkeep": "git",
		"gitconfig": "git",
		"gitattributes": "git",
		"gitmodules": "git",
		"gitignore": "git",
		"go": "go",
		"gradle": "gradle",
		"grails": "grails",
		"groovy": "grails",
		"hh": "hacklang",
		"haml": "haml",
		"hs": "haskell",
		"lhs": "haskell",
		"lisp": "lisp",
		"htm": "html",
		"html": "html",
		"shtml": "html",
		"dhtml": "html",
		"ai": "ai",
		"png": "image",
		"ico": "image",
		"jpg": "image",
		"bmp": "image",
		"jpeg": "image",
		"gif": "image",
		"jade": "jade",
		"java": "java",
		"mjs": "javascript",
		"js": "javascript",
		"es6": "javascript",
		"es7": "javascript",
		"erl": "erlang",
		"ex": "elixir",
		"gltf": "json",
		"ipynb": "json",
		"json": "json",
		"jl": "julia",
		"less": "less",
		"license": "license",
		"liquid": "liquid",
		"ls": "livescript",
		"lua": "lua",
		"md": "markdown",
		"mustache": "mustache",
		"handlebars": "mustache",
		"hbs": "mustache",
		"hjs": "mustache",
		"stache": "mustache",
		"npmignore": "npm",
		"ml": "ocaml",
		"mli": "ocaml",
		"cmx": "ocaml",
		"cmxa": "ocaml",
		"pdf": "pdf",
		"pl": "perl",
		"pro": "prolog",
		"psd": "photoshop",
		"php": "php",
		"php.inc": "php",
		"pug": "pug",
		"pp": "puppet",
		"py": "python",
		"rb": "ruby",
		"erb.html": "ruby",
		"html.erb": "ruby",
		"rs": "rust",
		"sass": "sass",
		"scss": "sass",
		"scm": "scheme",
		"sbt": "sbt",
		"scala": "scala",
		"sql": "sql",
		"sh": "shell",
		"cmd": "shell",
		"zsh": "shell",
		"fish": "shell",
		"profile": "shell",
		"slim": "slim",
		"smarty": "smarty",
		"smarty.tpl": "smarty",
		"styl": "stylus",
		"svg": "svg",
		"swift": "swift",
		"tf": "terraform",
		"tf.json": "terraform",
		"tex": "tex",
		"sty": "tex",
		"cls": "tex",
		"dtx": "tex",
		"ins": "tex",
		"txt": "default",
		"twig": "twig",
		"as": "assemblyscript",
		"ts": "typescript",
		"tsx": "react",
		"direnv": "config",
		"env": "config",
		"static": "config",
		"slugignore": "config",
		"vala": "vala",
		"wmv": "video",
		"mov": "video",
		"ogv": "video",
		"webm": "video",
		"avi": "video",
		"mpg": "video",
		"mp4": "video",
		"xml": "xml",
		"yml": "yml",
		"yaml": "yml",
		"vue": "vue",
		"babelrc": "babel",
		"eslintrc": "eslint",
		"jshintrc": "jshint",
		"xcodeproj": "xcode",
		"zip": "zip",
		"rar": "zip",
		"gz": "zip",
		"iso": "zip",
		"key": "key",
		"pem": "key",
		"fs": "fsharp",
		"vimrc": "vim",
		"vim": "vim",
		"viminfo": "vim",
		"sql": "sql",
		"bat": "shell",
		"htaccess": "apache",
		"wxml": "wxml",
		"wxss": "wxss",
		"ini": "config",
		"clj": "clojure",
		"r": "r",
		"lock": "lock",
		"asp": "asp",
		"flowconfig": "flow",
		"nim": "nim",
		"kt": "kotlin",
		"ink": "ink",
		"zig": "zig",
		"pas": "pascal",
		"raku": "raku",
		"fth": "forth",
		"d": "d",
		"pony": "pony",

		"ppm": "ppm",
		"wat": "wat",
		"piskel": "image",

		"scratch": "smarty",
		"bugs": "platformio"
};

function codemirrorModeFromFileType(fileType){
	const conversions = {
		assemblyscript: { name: 'javascript', typescript: true, assemblyscript: true },
		apl: 'text/apl',
		config: 'text/x-properties',
		typescript: { name: 'javascript', typescript: true },
		react: 'jsx',
		svg: 'xml',
		html: {
			name: 'htmlmixed',
			tags: {
				style: [
					["type", /^text\/(x-)?scss$/, "text/x-scss"],
					[null, null, "css"]
				],
				custom: [[null, null, "customMode"]]
			}
		},
		sass: 'text/x-scss',
		less: 'text/x-less',
		image: { name  : 'default' },
		bat: { name: 'default' },
		mjs: { name: 'javascript' },
		json: { name: 'javascript', json: true },
		c: 'text/x-csrc',
		cpp: 'text/x-c++src',
		ocaml: 'text/x-ocaml',
		fsharp: 'text/x-fsharp',
		csharp: 'text/x-csharp',
		java: 'text/x-java',
		kotlin: 'text/x-kotlin',
		lisp: 'commonlisp',
		raku: 'perl6',
		yml: 'text/x-yaml',
		zig: 'rust',
		sql: 'text/x-pgsql',
	};
	//console.log({ fileType, conversions: conversions[fileType] });
	return conversions[fileType] || fileType;
}

// TODO: maybe use insertAdjacentHTML for this instead
// this works like jquery append ^^^
function htmlToElement(html) {
	var template = document.createElement("template");
	html = html.trim(); // Never return a text node of whitespace as the result
	template.innerHTML = html;
	//also would be cool to remove indentation from all lines
	return template.content.firstChild;
}

let getMime = () => {};
(async () => {
	const source = await (await fetch('/modules/service-worker.utils.js')).text();
	const SWUtils = eval(`
		(function(){
		const module = { exports: {} };
		${source}
		const { exports } = module;
		return exports;
		})()
	`);
	SWUtils.initMimeTypes();
	getMime = SWUtils.getMime;
})();

const getExtension = (fileName) =>
	((fileName.match(/\.[0-9a-z]+$/i) || [])[0] || "").replace(/^\./, "");

function getFileType(fileName = "") {
	const mime = getMime(fileName) || {};

	let type = "default";
	const extension = getExtension(fileName);
	if(mime?.contentType ){
		type = mime.contentType;
	}
	
	//TODO: most of this should be able to go away with addition of getExtension above...
	if (fileName.toLowerCase() === ".git/config") {
		type = "config";
	}
	if (fileName.toLowerCase() === "license") {
		type = "license";
	}
	if (ext[extension]) {
		type = ext[extension];
	}
	if (extension === "bat") {
		type = "bat";
	}
	if (extension === "scratch") {
		type = "markdown";
	}
	if (extension === "piskel") {
		type = "application/json";
	}
	if (extension === "bugs") {
		type = "markdown";
	}
	if (extension === "wat") {
		type = "text/webassembly";
	}
	if (extension === "htm" || extension === "html") {
		type = {
			name: "htmlmixed",
			mimeType: "application/x-ejs",
			icon: 'html'
		};
	}
	if (extension === 'hbs'){
		type = {name: "handlebars", base: "text/html"};
	}
	return type;
}

function friendlyModeName(type, mode){
	if(type.includes && type.includes('sharp')) return type.replace('sharp', '#');
	if('cpp' === type) return 'C++';
	if('ocaml' === type) return { name: 'OCaml' };
	if(['bat', 'cpp', 'lisp', 'raku', 'zig'].includes(type)) return type;
	if(mode.includes && mode.includes('text/x-')) return type;
	return mode;
}

// from tabs
// function getFileType(fileName = "") {
// 	let type = "default";
// 	const extension = ((fileName.match(/\.[0-9a-z]+$/i) || [])[0] || "").replace(
// 		/^\./,
// 		""
// 	);

// 	//console.log(extension)
// 	if (ext[extension]) {
// 		type = ext[extension];
// 	}
// 	if (extension === "md") {
// 		type = "info";
// 	}
// 	return type;
// }

const showFileInEditor = (filename, contents) => {
	const fileType = getFileType(filename);
	return !["image", "font", "audio", "video", "zip"].includes(fileType) &&
		!(typeof fileType === "string" && fileType.includes('image/'));
};

const noFrontSlash = (path) => {
	try {
		if(!path) return path;
		if(!path.includes('/')) return path;
		if(path[0] === '/') return path.slice(1);
		return path;
	} catch(e){ debugger}
};

const pathNoServiceName = (service, path) => {
	if(!path.includes('/')) return path;
	if(!path.includes(service.name)) return noFrontSlash(path);
	return noFrontSlash(
		noFrontSlash(path).replace(service.name, '')
	);
};

const getFilePath$1 = (getCurrentService) => ({ name="", parent="", path="", next="", nextPath="" }) => {
	const nameWithPathIfPresent = (_path, _name) => _path
		? _path.endsWith(_name)
			? noFrontSlash(_path)
			: noFrontSlash(`${_path}/${_name}`)
		: noFrontSlash(_name);
	const fileNameWithPath = next
		? nameWithPathIfPresent(nextPath, next)
		: nameWithPathIfPresent(parent || path, name);
	const service = getCurrentService({ pure: true });
	return pathNoServiceName(service, fileNameWithPath);
};

/*
	Example usage of flatFromProp:

	const input = [{
		one: '1',
		two: [
			{ three: 'a' },
			{ three: 'b'}
		]
	}];
	const output = flatFromProp(input, "two")
	assert(output === [
		{ one: '1', three: 'a'},
		{ one: '1', three: 'b'},
	])

*/
const flatFromProp = (arr, prop) => arr.flatMap(
	({ [prop]: p, ...x }) => typeof p !== 'undefined' && p.length
		? p.map(y => ({ ...x, ...y }))
		: x
);

const formatHandlers = (namespace, x) => Object.entries(x)
	.reduce((all, [key, value]) => {
		return {
			...all,
			[key]: {
				listener: value,
				name: namespace
			}
		};
	}, {});

function scrollToChild(child) {
	window.parent = child.parentNode;
	const parentWindowMin = parent.scrollLeft;
	const parentWindowMax = parent.scrollLeft + parent.clientWidth;
	const parentMaxScrollLeft = parent.scrollWidth - parent.clientWidth;

	const childMin = child.offsetLeft;
	const childMax = child.offsetLeft + child.clientWidth;
	const childCenter = (childMin + childMax) / 2;
	const idealScrollLeft = childCenter - parent.clientWidth / 2;

	const idealScrollMin =
		childMax > parentWindowMin && childMin < parentWindowMin
			? parent.scrollLeft - (parentWindowMin - childMin) - 20
			: undefined;

	const idealScrollMax =
		childMax > parentWindowMax && childMin < parentWindowMax
			? parent.scrollLeft + (childMax - parentWindowMax) + 20
			: undefined;

	// console.log({
	// 	childMin, childMax, parentWindowMin, parentWindowMax, parentMaxScrollLeft
	// });

	if (childMin === 0) {
		//parent.scrollLeft = 0;
		parent.scrollTo({
			top: 0,
			left: 0,
			behavior: "smooth",
		});
		return;
	}

	if (childMax === parent.scrollWidth) {
		//parent.scrollLeft = parentMaxScrollLeft;
		parent.scrollTo({
			top: 0,
			left: parentMaxScrollLeft,
			behavior: "smooth",
		});
		return;
	}

	const childVisible =
		childMin >= parentWindowMin && childMax <= parentWindowMax;

	if (childVisible) return;

	if (idealScrollMin) {
		console.log({ idealScrollMin });
		parent.scrollTo({
			top: 0,
			left: idealScrollMin,
			behavior: "smooth",
		});
		return;
	}

	if (idealScrollMax) {
		console.log({ idealScrollMax });
		parent.scrollTo({
			top: 0,
			left: idealScrollMax,
			behavior: "smooth",
		});
		return;
	}

	// console.log({
	// 	childCenter, idealScrollLeft, parentMaxScrollLeft
	// });

	if (idealScrollLeft <= 0) {
		//parent.scrollLeft = 0;
		parent.scrollTo({
			top: 0,
			left: 0,
			behavior: "smooth",
		});
		return;
	}
	if (idealScrollLeft <= parentMaxScrollLeft) {
		//parent.scrollLeft = idealScrollLeft;
		parent.scrollTo({
			top: 0,
			left: idealScrollLeft,
			behavior: "smooth",
		});
		return;
	}
	//parent.scrollLeft = parentMaxScrollLeft;
	parent.scrollTo({
		top: 0,
		left: parentMaxScrollLeft,
		behavior: "smooth",
	});

	///window.child = child;
	//parent.scrollLeft = child.offsetLeft; // - child.clientWidth/2;
	// console.log({
	// 	left: parent.scrollLeft,
	// 	width: parent.clientWidth,
	// 	scroll: parent.scrollWidth
	// })
}

const createTab = (parent, init) => (tabDef) => {
	const tab = document.createElement("div");
	tab.id = tabDef.id;
	tab.classList.add("tab");
	if (!init) {
		tab.classList.add("new");
	} else {
		tab.classList.remove("new");
	}
	tabDef.changed && tab.classList.add("changed");
	tabDef.touched && tab.classList.add("touched");

	let systemType, systemName, systemClass;
	if (tabDef.name.includes("system::")) {
		systemType = "config";
		systemName = {
			"add-service-folder": "Open Folder",
			"connect-service-provider": "Connect to a Provider",
			"open-previous-service": "Open Previous Service",
			"open-settings-view": "Settings",
		}[tabDef.name.replace("system::", "")];
		systemClass = "italic";
	}
	tab.title = `${tabDef.parent ? (tabDef.parent+'/') : ''}${tabDef.name.split('/').pop()}`;
	const fileType = getFileType(tabDef.name);
	const icon = systemType || fileType.icon || fileType;
	tab.innerHTML = `
		<span style="pointer-events: none;"
			class="${systemClass ? systemClass + " " : ""}icon-${icon}"
		>${systemName || tabDef.name.split('/').pop()}</span>
		<div class="tab-close">
			<div class="monaco-action-bar animated">
				<ul class="actions-container" role="toolbar" aria-label="Tab actions">
					<li class="action-item" role="presentation">
						<a class="action-label icon close-editor-action"
							data-name="${tabDef.name}"
							data-parent="${tabDef.parent||''}"
							role="button"
							title="Close"
						>
						</a>
					</li>
				</ul>
			</div>
		</div>
	`;
	//	const oldScroll = parent.scrollLeft;
	parent.appendChild(tab);
	//parent.scrollLeft = oldScroll;
	//parent.scrollLeft = parent.scrollWidth;
	//setTimeout(() => scrollToChild(tab), 100);
	scrollToChild(tab);
	if (tabDef.active) {
		tab.classList.add("active");
		tab.classList.remove("new");
	}

	const remainingTabs = Array.from(parent.querySelectorAll(".tab"));
	if (!remainingTabs.length) {
		return;
	}
};

const updateTab = (parent) => (tabDef) => {
	const child = parent.querySelector("#" + tabDef.id);
	if (!child) return;
	if (!tabDef.active && child.classList.contains("active")) {
		child.classList.remove("active");
	}
	if (tabDef.active && !child.classList.contains("active")) {
		child.classList.add("active");
		scrollToChild(child);
	}
	if (tabDef.changed && !child.classList.contains("changed")) {
		child.classList.add("changed");
		scrollToChild(child);
	}
	if (!tabDef.changed && child.classList.contains("changed")) {
		child.classList.remove("changed");
	}

	if (!tabDef.touched && child.classList.contains("touched")) {
		child.classList.remove("touched");
	}
	if (tabDef.touched) {
		child.classList.add("touched");
	}
};

const removeTab = (parent) => async (tabDef) => {
	if(!tabDef) return console.error('attempt to remove tab without a tab definition');

	const child = parent.querySelector("#" + tabDef.id);
	child.parentNode.removeChild(child);

	const remainingTabs = Array.from(parent.querySelectorAll(".tab"));
	if (!remainingTabs.length) {
		return;
	}
	//TODO: scroll parent to put newly active tab in view
};

// const removeTab = (parent) => (tabDef) => {
// 	//console.log(tabDef)
// 	if(tabDef.parentNode){
// 		tabDef.parentNode.removeChild(tabDef);
// 		return;
// 	}
// 	const child = parent.querySelector(tabDef.id);
// 	console.log(child)
// 	child && parent.removeChild(child)
// };

const scrollHorizontally = (el) =>
	function (e) {
		e = window.event || e;
		el.scrollLeft -= e.wheelDelta || -e.detail;
	};

function attachWheel(el) {
	if (!el) return;

	if (el.addEventListener) {
		el.addEventListener("mousewheel", scrollHorizontally(el), {
			passive: true,
		});
		el.addEventListener("DOMMouseScroll", scrollHorizontally(el), {
			passive: true,
		});
	} else {
		el.attachEvent("onmousewheel", scrollHorizontally(el));
	}
}

function attachDoubleClick(el, context) {
	if (!el) return;
	el.addEventListener("dblclick", (e) => {
		const { triggers } = context;
		triggers.addFileUntracked(e);
	});
}

const initTabs = (parent) => (tabDefArray = [], context) => {
	Array.from(parent.querySelectorAll(".tab")).map(removeTab(parent));
	const init = true;
	tabDefArray.map(createTab(parent, init));
	setTimeout(() => {
		const tabs = document.querySelector("#editor-tabs");
		attachWheel(tabs);
		attachDoubleClick(tabs, context);
		const activeTab = document.querySelector("#editor-tabs-container .active");
		if (activeTab) {
			activeTab.scrollIntoView();
		}
	}, 1000); //TODO: this sucks
};

let tabsContainer;
let tabsList;
function EditorTabs(tabsArray = [{ name: "loading...", active: true }]) {
	if (tabsContainer) {
		//console.log('already exists');
		tabsList = tabsList || tabsContainer.querySelector("#editor-tabs");
		//should not be doing this, rely on event instead!!!
		//tabsArray && initTabs(tabsList)(tabsArray);
		return tabsContainer;
	}
	tabsContainer = document.createElement("div");
	tabsContainer.innerHTML = `
		<style>
			#editor-tabs-container .scrollbar {
				position: absolute;
				width: 575px;
				height: 3px;
				left: 0px;
				bottom: 0px;
				background: transparent;
				right: -3px;
				width: auto;
			}
			#editor-tabs-container .slider {
				position: absolute;
				top: 0px;
				left: 0px;
				height: 3px;
				will-change: transform;
				width: 508px;
			}
			#editor-tabs-container:hover .slider {
				background: #ffffff20;
				display: none;
			}
			#editor-tabs-container .tab:not(.touched):not(.changed) > span {
				font-style: italic;
			}
		</style>
		<div class="scrollable hide-native-scrollbar" id="editor-tabs-container">
			<div id="editor-tabs" class="row no-margin">
			</div>
			<div class="invisible scrollbar horizontal fade">
				<div class="slider">
				</div>
			</div>
		</div>
	`;

	tabsList = tabsList || tabsContainer.querySelector("#editor-tabs");

	/*

	TODO:
	when tabs change, update the width of slider

	when editor tabs scroll position changes, move the slider with it

	when this is done, change from display: none

	ALSO:
	there is something very screwed up happening with tab bar
	for example, when I try to add padding or margin to left/right of tabs, left works and right fails
	I have tried mulitple ways of fixing this, including first-child/last-child and wrapping in a container div
	nothing seems to work and I don't have time for the frustration right now

	one idea I have not tried is to put padding divs to the left and right of tabs list; maybe later
	*/

	const operations = {
		initTabs: initTabs(tabsList),
		createTab: createTab(tabsList),
		updateTab: updateTab(tabsList),
		removeTab: removeTab(tabsList),
	};
	//triggers = [];
	// triggers = attachListener(tabsContainer, operations);

	//'modal-menu-show'

	//should not be doing this, rely on event instead!!!
	//tabsArray && initTabs(tabsList)(tabsArray);
	
	tabsContainer.sysDocNames = {
		"add-service-folder": "Open Folder",
		"connect-service-provider": "Connect to a Provider",
		"open-previous-service": "Open Previous Service",
		"open-settings-view": "Settings",
	};

	tabsContainer.operations = operations;


	function clearLastTab({ tabs, removeTab }) {
		if(!tabs.length) return;
		const lastTab = tabs[tabs.length - 1];
		if (lastTab.changed || lastTab.touched || lastTab.name.includes("Untitled-"))
			return;
		tabs = tabs.filter((t) => t.id !== lastTab.id);
		removeTab(lastTab);
		return { tabs, cleared: lastTab };
	}

	function getTabsToUpdate(filePath) {
		const name = filePath?.split('/').pop();
		const tabsToUpdate = [];
		let foundTab;
		for (var i = 0, len = tabs.length; i < len; i++) {
			if (name === tabs[i].name) {
				foundTab = tabs[i];
			}
			// update: if tab exists and not active, activate it
			if (name === tabs[i].name && !tabs[i].active) {
				tabs[i].active = true;
				tabsToUpdate.push(tabs[i]);
			}
			// update: remove active state from active tab
			if (name !== tabs[i].name && tabs[i].active) {
				delete tabs[i].active;
				tabsToUpdate.push(tabs[i]);
			}
		}
		return { foundTab, tabsToUpdate };
	}

	let tabs = [];
	tabsContainer.api = {
		list: () => tabs,
		find: (x) => tabs.find(x),
		update: (t) => tabs = t,
		push: (t) => tabs.push(t),
		clearLast: clearLastTab,
		toUpdate: getTabsToUpdate
	};

	return tabsContainer;
}

getSettings();
function StatusBar(){
	const statusBar = document.createElement('div');
	statusBar.id = "status-bar";
	const settings = getSettings();
	const tabSettingsElString = (s) => `${s.indentWithTabs ? 'Tabs' : 'Spaces'}: <span class="tab-size">${s.tabSize}</span>`;
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

//import CodeMirror from "https://cdn.jsdelivr.net/npm/codemirror@5.49.0/lib/codemirror.js";
//import "https://dev.jspm.io/codemirror@5.49.0/mode/javascript/javascript.js";
//import "https://dev.jspm.io/codemirror@5.49.0/mode/markdown/markdown.js";

// const codeMirrorCssUrl = "https://cdn.jsdelivr.net/npm/codemirror@5.49.0/lib/codemirror.css";
// const codeMirrorBespinThemeCssUrl = "https://cdn.jsdelivr.net/npm/codemirror@5.49.0/theme/bespin.css";
// const codeMirrorJsUrl = "https://cdn.jsdelivr.net/npm/codemirror@5.49.0/lib/codemirror.js";
// const codeMirrorJsSyntaxUrl = "https://cdn.jsdelivr.net/npm/codemirror@5.49.0/mode/javascript/javascript.js";


/*
use something like this to hide scrollbars after scrolling has stopped
(or show them once scrolling has started


// Run a callback function after scrolling has stopped
// (c) 2017 Chris Ferdinandi, MIT License, https://gomakethings.com
// @param  {Function} callback The function to run after scrolling

var scrollStop = function (callback) {

	// Make sure a valid callback was provided
	if (!callback || typeof callback !== 'function') return;

	// Setup scrolling variable
	var isScrolling;

	// Listen for scroll events
	window.addEventListener('scroll', function (event) {

		// Clear our timeout throughout the scroll
		window.clearTimeout(isScrolling);

		// Set a timeout to run after scrolling ends
		isScrolling = setTimeout(function() {

			// Run the callback
			callback();

		}, 66);

	}, false);

};



*/


const codeMirrorCssUrl = "../shared/css/codemirror.css";
const codeMirrorBespinThemeCssUrl = "../shared/css/bespin.css";
const cmVSCodeUrl = "../shared/css/vscode.codemirror.css";

const codeMirrorJsUrl = "../shared/vendor/codemirror.js";

const codeMirrorJsSyntaxUrl = "../shared/vendor/codemirror/mode/javascript.js";

const codeMirrorAddonBundleUrl = '../shared/vendor/codemirror/addon.bundle.js';

const appendScript = (url, callback) => {
	var script = document.createElement('script');
	script.crossOrigin = "anonymous";
	script.onload = callback;
	script.src = url;
	document.head.appendChild(script);
	return script;
};

const appendStyleSheet = (url, callback) => {
	var style = document.createElement('link');
	style.rel = "stylesheet";
	style.crossOrigin = "anonymous";
	style.onload = callback;
	style.href = url;
	document.head.appendChild(style);
};

const codeMirrorCss = (callback) => {
	appendStyleSheet(codeMirrorCssUrl, () => {
		appendStyleSheet(cmVSCodeUrl, () => {
			appendStyleSheet(codeMirrorBespinThemeCssUrl, callback);
		});
	});
};

const codeMirrorJs = (callback) => {
	appendScript(codeMirrorJsUrl, () => {
		appendScript(codeMirrorAddonBundleUrl, callback);
	});
};

const codeMirrorModeJs = (mode, callback) => {
	const scriptId = `cm-syntax-${mode}`;
	const scriptExists = !!document.getElementById(scriptId);
	if(scriptExists){
		callback();
		return;
	}
	const modeUrl = codeMirrorJsSyntaxUrl.replace('javascript', mode.name || mode);
	const script = appendScript(modeUrl, callback);
	script.id = scriptId;
};

const setupEditor = (text, opts) => {
	const darkEnabled = window.localStorage.getItem('themeDark') === "true";
	const defaultOptions = {
		lineNumbers: true,
		mode: opts.mode,
		theme: darkEnabled ? "vscode-dark" : "",
		styleActiveLine: true,
		matchBrackets: true
	};
	const options = { ...defaultOptions, ...opts };

	//console.log({ mimeModes: CodeMirror.mimeModes, modes: CodeMirror.modes })
	const textArea = document.querySelector('.simulation .functionInput');
	if(!textArea){
		return;
	}
	const editor = CodeMirror.fromTextArea(textArea, options);

	//console.log({ options });
	CodeMirror.keyMap.default["Shift-Tab"] = "indentLess";
	CodeMirror.keyMap.default["Tab"] = "indentMore";
  
	editor.getDoc().setValue(text);
	return editor;
};

// has side effects of changing opts.mode in some cases
const getModeWithEffects = (opts) => {
	let mode = opts.mode || "javascript";
	try {
		mode = opts.mode.name || mode;
	} catch(e){}

	if(mode === 'lisp'){
		opts.mode = 'commonlisp';
		mode = 'commonlisp';
	}
	if(mode === "ink"){
		opts.mode = "go";
		mode = "go";
	}
	if(mode === "raku"){
		opts.mode = "perl6";
		mode = "perl6";
	}
	if(mode === "zig"){
		opts.mode = "rust";
		mode = "rust";
	}
	if(mode === 'sql'){
		opts.mode = 'text/x-pgsql';
	}
	if(mode === 'cpp'){
		opts.mode = 'text/x-c++src';
	}
	if(['ocaml', 'csharp', 'fsharp', 'java', 'kotlin'].includes(mode)){
		opts.mode = 'text/x-' + mode;
	}
	if(mode === 'c'){
		opts.mode = 'text/x-' + mode;
	}
	if(mode === 'config'){
		opts.mode = 'text/x-properties';
	}
	return mode;
};

async function loadDeps(_text, opts, callback) {
	codeMirrorCss(() => {
		codeMirrorJs(() => {
			codeMirrorModeJs("../mode.bundle", () => {
				if (stack.length > 0) {
					({ text: _text, opts, callback } = stack.pop());
					stack = [];
				}
				let theEditor = setupEditor(_text, opts || {});
				if (!theEditor) {
					setTimeout(() => {
						theEditor = setupEditor(_text, opts || {});
						if (!theEditor) {
							console.log('STUBBORN editor...');
							debugger;
						}
						window.EditorLoading = false;
						window.Editor = theEditor;
						callback(null, theEditor);
					}, 1000);
					return;
				}
				//theEditor.setOption("mode", opts.mode);
				//theEditor.setOption("theme", "default");
				window.EditorLoading = false;
				window.Editor = theEditor;
				callback(null, theEditor);
			});
		});
	});
}
let stack = [];
const allTheEditorThings = ({ text='', ...opts } = {}, callback) => {
	let _text = text;
	if(typeof _text !== 'string'){
		_text = '\n';
		console.warn(`Editor received bad text!`);
		console.warn({ text, opts });
	}
	let mode = getModeWithEffects(opts);
	if(window.EditorLoading){
		stack.push({
			text: _text, opts,
			callback
		});
		return;
	}
	if(window.Editor){
		opts.mode = opts.mode.mimeType || opts.mode || mode;
		window.Editor.toTextArea();
		const theEditor = setupEditor(_text, opts || {});
		window.Editor = theEditor;
		callback(null, theEditor);
		return;
	}
	window.EditorLoading= true;

	// do not await this next function call
	loadDeps(_text, opts, callback);
};

//This is used by inlineEditor
const Container = () => {
	const prevConatiner = document.querySelector("#full-page-container");
	if (prevConatiner) {
		prevConatiner.parentNode.removeChild(prevConatiner);
	}
	const containerDiv = document.createElement("div");
	containerDiv.innerHTML = `
		<div class="editor-space hide-on-med-and-down"></div>
		<div class="contain"></div>
	`;
	containerDiv.classList.add("section", "simulation", "editor");
	containerDiv.id = "full-page-container";
	containerDiv.classList.add("section", "simulation", "editor");

	document.querySelector("#editor").appendChild(containerDiv);
	return containerDiv;
};

const Search = () => {
	const searchDiv = document.createElement("div");
	searchDiv.id = "file-search";
	searchDiv.innerHTML = `
		<style>
			#file-search {
				visibility: hidden;
				position: absolute;
				background: var(--main-theme-color);
				height: 34px;
				box-shadow: inset 0px -2px 0px 0px var(--theme-subdued-color);
				/* border: 3px solid var(--main-theme-color); */
				display: flex;
				justify-content: space-between;
				align-items: center;
				cursor: default;
				border-bottom: 6px solid var(--main-theme-color);
				box-sizing: content-box;
				right: 8px;
				left: 0;
				width: auto;
				padding: 0.45em;
				z-index: 10;
			}
			.collapse-handle {
				width: 1.5em;
				text-align: center;
				font-stretch: expanded;
				font-family: system-ui, monospace;
				font-size: 1.2em;
			}
			.search-field {
				margin-left: 0;
				flex: 1;
				height: 75%;
			}
			.search-field input {
				height: 100% !important;
				background: var(--main-theme-background-color) !important;
				margin: 0 !important;
				border: 0 !important;
				color: var(--main-theme-text-color);
				padding-left: .5em !important;
				padding-right: .5em !important;
				font-size: 1.1em !important;
				box-sizing: border-box !important;
				transition: unset !important;
			}
			.search-field input:focus {
				border: 1px solid !important;
				box-shadow: none !important;
				border-color: rgb(var(--main-theme-highlight-color)) !important;
			}
			.search-count,
			.search-no-results {
				margin-left: 1.2em;
				margin-right: auto;
				min-width: 5em;
			}
			.search-controls {
				margin-right: 0.5em;
				margin-left: 1em;
				font-family: system-ui, monospace;
				font-size: 1.1em;
				user-select: none;
			}
			.search-controls span {
				min-width: 1.4em;
				display: inline-block;
				cursor: pointer;
				text-align: center;
			}
			#file-search ::placeholder {
				color: var(--main-theme-text-invert-color);
			}
		</style>
		<div class="collapse-handle">></div>
		<div class="search-field">
			<input
				type="text"
				autocomplete="off"
				autocorrect="off"
				autocapitalize="off"
				spellcheck="false"
				placeholder="Find"
			/>
		</div>
		<div class="search-count hidden">
			<span class="search-count-current">X</span>
			<span>of</span>
			<span class="search-count-total">Y</span>
		</div>
		<span class="search-no-results">No results</span>
		<div class="search-controls">
			<span class="search-up">↑</span>
			<span class="search-down">↓</span>
			<span class="search-close">X</span>
		</div>
	`;
	return searchDiv;
};

function attachGutterHelper(editorGutter){
	const getSizers = () => Array.from(document.querySelectorAll(".CodeMirror-sizer"));
	const getGutter = () => editorGutter || document.body.querySelector('.CodeMirror-gutters');

	let gutter = getGutter();
	let inGutter;
	let gutterNoted;

	const removeGutterHovered = () => {
		const cmSizers = getSizers();
		if(!cmSizers.length) return;
		cmSizers.forEach(x => x.classList.remove('gutter-hovered'));
		gutterNoted = false;
	};
	const addGutterHovered = () => {
		const cmSizers = getSizers();
		if(!cmSizers.length) return;
		cmSizers.forEach(x => x.classList.add('gutter-hovered'));
		gutterNoted = true;
	};

	const gutterHandler = (e) => {
		gutter = getGutter();
		if(!gutter) return removeGutterHovered();

		const { className="", classList } = e.target;
		inGutter = gutter.contains(e.target) ||
			classList.contains('CodeMirror-gutters') ||
			classList.contains('gutter-elt') ||
			classList.contains('guttermarker') ||
			(className.includes && className.includes('CodeMirror-guttermarker'));

		if(inGutter && !gutterNoted) return addGutterHovered();
		if(!inGutter && gutterNoted) return removeGutterHovered();
	};

	const listenOpts = { passive: true, capture: false };
	document.body.addEventListener("mouseover", gutterHandler, listenOpts);
}

const { indentWithTabs, tabSize } = getSettings();

let editorGutter;
let cmDom;
let prevDoc;

const BLANK_CODE_PAGE = "";
const InlineEditor = (
	ChangeHandler,
	EditorTabs,
	CursorActivityHandler
) => ({
	code = BLANK_CODE_PAGE,
	line: loadLine,
	column: loadColumn,
	name,
	id,
	filename,
	path,
	callback,
} = {}) => {
	const prevEditor = document.querySelector("#editor-container");
	let editorDiv = prevEditor;
	if (!editorDiv) {
		const containerDiv = Container();
		editorDiv = document.createElement("div");
		editorDiv.id = "editor-container";
		editorDiv.innerHTML = `
			<div id="service-fields" class="row no-margin">
				<div class="input-field col s6">
					<input id="service_name" type="text" class="" value="${name}">
					<label for="service_name">Name</label>
				</div>
				<div class="input-field col s6">
					<input id="service_id" type="text" class="" value="${id}">
					<label for="service_id">ID</label>
				</div>
			</div>
		`;

		editorDiv.appendChild(
			EditorTabs(name ? [{ name, active: true }] : undefined)
		);

		editorDiv.appendChild(Search());

		const editorTextArea = document.createElement("textarea");
		editorTextArea.id = "service_code";
		editorTextArea.classList.add("functionInput");
		editorTextArea.classList.add("hidden");
		editorDiv.appendChild(editorTextArea);
		containerDiv.querySelector(".contain").appendChild(editorDiv);
	}

	window.M && M.updateTextFields();

	//const editorPane = document.querySelector('#editor');
	//editorPane.style.width = editorPane.clientWidth + 'px';
	const darkEnabled = window.localStorage.getItem("themeDark") === "true";
	const handlerBoundToDoc = ChangeHandler({ code, name, id, filename });

	var currentHandle = null,
		currentLine;
	function updateLineInfo(cm, line) {
		var handle = cm.getLineHandle(line - 1);
		if (handle == currentHandle && line == currentLine) return;
		if (currentHandle) {
			cm.removeLineClass(currentHandle, null, null);
			//cm.clearGutterMarker(currentHandle);
		}
		currentHandle = handle;
		currentLine = line;
		cm.addLineClass(currentHandle, null, "activeline");
		//cm.setGutterMarker(currentHandle, String(line + 1));
	}

	const onCursorActivity = (instance) => {
		const cursor = instance.getCursor();
		const line = cursor.line + 1;
		const column = cursor.ch + 1;
		updateLineInfo(instance, line);
		// STATUS_CURRENT_LINE.textContent = cursor.line + 1;
		CursorActivityHandler({ line, column });
	};

	const onScrollCursor = (instance, event) => {
		//TODO: use this to recall scroll positions?
		//event.preventDefault();
	};

	//TODO: code should come from changeHandler if it exists

	const fileType = getFileType(filename);
	const mode = codemirrorModeFromFileType(fileType);

	function isSelectedRange(ranges, from, to) {
		for (var i = 0; i < ranges.length; i++)
			if (
				CodeMirror.cmpPos(ranges[i].from(), from) == 0 &&
				CodeMirror.cmpPos(ranges[i].to(), to) == 0
			)
				return true;
		return false;
	}
	function selectNextOccurrence(cm) {
		var Pos = CodeMirror.Pos;

		var from = cm.getCursor("from"),
			to = cm.getCursor("to");
		var fullWord = cm.state.sublimeFindFullWord == cm.doc.sel;
		if (CodeMirror.cmpPos(from, to) == 0) {
			var word = wordAt(cm, from);
			if (!word.word) return;
			cm.setSelection(word.from, word.to);
			fullWord = true;
		} else {
			var text = cm.getRange(from, to);
			var query = fullWord ? new RegExp("\\b" + text + "\\b") : text;
			var cur = cm.getSearchCursor(query, to);
			var found = cur.findNext();
			if (!found) {
				cur = cm.getSearchCursor(query, Pos(cm.firstLine(), 0));
				found = cur.findNext();
			}
			if (!found || isSelectedRange(cm.listSelections(), cur.from(), cur.to()))
				return;
			cm.addSelection(cur.from(), cur.to());
		}
		if (fullWord) {
			cm.state.sublimeFindFullWord = cm.doc.sel;
		}
		return false;
	}
	function toggleComment(cm){
		//TODO: would love block comments first, then line
		cm.toggleComment({ indent: true });
	}
	function SwapLineUp(cm) {
		var Pos = CodeMirror.Pos;
		if (cm.isReadOnly()) return CodeMirror.Pass
		var ranges = cm.listSelections(), linesToMove = [], at = cm.firstLine() - 1, newSels = [];
		for (var i = 0; i < ranges.length; i++) {
			var range = ranges[i], from = range.from().line - 1, to = range.to().line;
			newSels.push({anchor: Pos(range.anchor.line - 1, range.anchor.ch),
										head: Pos(range.head.line - 1, range.head.ch)});
			if (range.to().ch == 0 && !range.empty()) --to;
			if (from > at) linesToMove.push(from, to);
			else if (linesToMove.length) linesToMove[linesToMove.length - 1] = to;
			at = to;
		}
		cm.operation(function() {
			for (var i = 0; i < linesToMove.length; i += 2) {
				var from = linesToMove[i], to = linesToMove[i + 1];
				var line = cm.getLine(from);
				cm.replaceRange("", Pos(from, 0), Pos(from + 1, 0), "+swapLine");
				if (to > cm.lastLine())
					cm.replaceRange("\n" + line, Pos(cm.lastLine()), null, "+swapLine");
				else
					cm.replaceRange(line + "\n", Pos(to, 0), null, "+swapLine");
			}
			cm.setSelections(newSels);
			cm.scrollIntoView();
		});
	}	function SwapLineDown(cm) {
		var Pos = CodeMirror.Pos;
		if (cm.isReadOnly()) return CodeMirror.Pass
		var ranges = cm.listSelections(), linesToMove = [], at = cm.lastLine() + 1;
		for (var i = ranges.length - 1; i >= 0; i--) {
			var range = ranges[i], from = range.to().line + 1, to = range.from().line;
			if (range.to().ch == 0 && !range.empty()) from--;
			if (from < at) linesToMove.push(from, to);
			else if (linesToMove.length) linesToMove[linesToMove.length - 1] = to;
			at = to;
		}
		cm.operation(function() {
			for (var i = linesToMove.length - 2; i >= 0; i -= 2) {
				var from = linesToMove[i], to = linesToMove[i + 1];
				var line = cm.getLine(from);
				if (from == cm.lastLine())
					cm.replaceRange("", Pos(from - 1), Pos(from), "+swapLine");
				else
					cm.replaceRange("", Pos(from, 0), Pos(from + 1, 0), "+swapLine");
				cm.replaceRange(line + "\n", Pos(to, 0), null, "+swapLine");
			}
			cm.scrollIntoView();
		});
	}	const extraKeys = {
		"Cmd-D": selectNextOccurrence,
		"Ctrl-D": selectNextOccurrence,
		"Ctrl-/": toggleComment,
		"Alt-Up": SwapLineUp,
		"Alt-Down": SwapLineDown,
	};

	const editorCallback = (error, editor) => {
		if (error) {
			console.error(error);
			callback && callback(error);
			return;
		}
		callback && callback();
		window.Editor = editor;

		editor.setOption("theme", darkEnabled ? "vscode-dark" : "default");
		editor.setOption("styleActiveLine", { nonEmpty: true });
		editor.setOption("extraKeys", extraKeys);

		const foldHandler = (cm, from, to) => {
			cm.addLineClass(from.line, "wrap", "folded");
		};
		const unfoldHandler = (cm, from, to) => {
			cm.removeLineClass(from.line, "wrap", "folded");
		};

		editor.on("fold", foldHandler);
		editor.on("unfold", unfoldHandler);
		editor.on("change", handlerBoundToDoc);
		editor.on("cursorActivity", onCursorActivity);
		editor.on("scrollCursorIntoView", onScrollCursor);

		editor._cleanup = () => {
			editor.off("change", handlerBoundToDoc);
			editor.off("cursorActivity", onCursorActivity);
			editor.off("scrollCursorIntoView", onScrollCursor);
			editor.off("fold", foldHandler);
			editor.off("unfold", unfoldHandler);

			const sidebarCanvas = document.querySelector('.cm-sidebar canvas');
			sidebarCanvas && (sidebarCanvas.width = sidebarCanvas.width);
		};
	};

	const editorOptions = {
		text: code || "",
		docStore: window.localforage,
		lineNumbers: true,
		mode,
		addModeClass: true,
		autocorrect: true,
		// scrollbarStyle: 'native',
		tabSize,
		indentWithTabs,
		smartIndent: false,
		showInvisibles: true,
		styleActiveLine: true,
		styleActiveSelected: true,
		matchBrackets: true,
		lineWrapping: false,
		scrollPastEnd: true,
		foldGutter: true,
		gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
		foldOptions: {
			widget: (from, to) => {
				return "...";
			},
			minFoldSize: 3,
		},
		//miniMap: localStorage.getItem('minimap'),
		miniMap: true,
		miniMapSide: "right",
		miniMapWidth: 64,
		cursorBlinkRate: 0
	};

	const loadDocument = () => {
		console.log(
			`%c${filename}: %ceditor %cloadDoc start`,
			'color:#CE9178;',
			'color:#9CDCFE;',
			'color:#DCDCAA;'
		);
		const docHasChanged = prevDoc !== filename;

		cmDom = cmDom || document.querySelector('.CodeMirror');
		editorGutter = editorGutter || document.body.querySelector('.CodeMirror-gutters');

		if(docHasChanged) cmDom.style.opacity = 0;
		const { text } = editorOptions;
		window.Editor._cleanup && window.Editor._cleanup();

		const callback = (err) => {
			if(err) return;
			editorCallback(null, window.Editor);
			//if(docHasChanged) window.Editor.refresh();
			//if(docHasChanged) setTimeout(() => {
				cmDom.style.opacity = 1;
			//}, 1);
			prevDoc = filename;
		};
		if(!path || !filename){
			return callback();
		}
		window.Editor.loadDoc({
			name: filename,
			path,
			line: loadLine ? Number(loadLine) : 0,
			ch: loadColumn ? Number(loadColumn) : 0,
			text,
			mode,
			callback
		});

	};

	if(window.Editor) return loadDocument();

	allTheEditorThings({ ...editorOptions, text: '\n\n\n' }, (error, editor) => {
		if (error) {
			console.error(error);
			callback && callback(error);
			return;
		}
		window.Editor = editor;
		loadDocument();
	});

};

attachGutterHelper(editorGutter);

let nothingOpen$1;
const showNothingOpen = () => {
	try{
		document.getElementById('file-search').style.visibility = "";
	}catch(e){}

	if (!nothingOpen$1) {
		const editorContainer = document.getElementById("editor-container");
		nothingOpen$1 = document.createElement("div");
		nothingOpen$1.id = "editor-empty";
		editorContainer.appendChild(nothingOpen$1);
	}
	const style = `
		<style>
			#editor-empty {
				position: absolute;
				left: 0;
				right: 0;
				top: 0;
				bottom: 0;
				background: #1e1e1e;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				overflow: hidden;
				min-width: 160px;
				z-index: 1;
			}
			#editor-empty-logo {
				opacity: .7;
				color: rgb(var(--main-theme-highlight-color));
				fill: currentColor;
				width: 18em;
				margin-top: -14em;
				stroke: rgba(var(--main-theme-highlight-color),.4);
			}
			.editor-empty-blurb {
				/* visibility: hidden; */
				font-variant: small-caps;
				font-style: italic;
				color: var(--main-theme-text-color);
			}
		</style>
	`;
	const logo = `
	<svg viewBox="-4 -4 172 150" id="editor-empty-logo">
		<g>
			<title>Do or do not.  There is no try.</title>
			<path d="m0.66613,141.12654l40.94759,-22.96759l39.55286,22.95911l-80.50045,0.00848z" stroke="#000000" stroke-width="0" opacity=".3" style="fill: black;opacity: .15;"></path>
			<path d="m81.32664,141.18317l41.77172,-23.74405l40.66986,23.45933l-82.44158,0.28472z" stroke-width="0" opacity=".1" style="fill: black;opacity: .15;"></path>
			<path d="m-8.80672,124.5856l39.68109,-24.32103l39.94988,23.98956l-79.63097,0.33147z" stroke-width="0" transform="rotate(120.005 31.0088 112.425)" opacity=".15" style="fill: black;opacity: .5;"></path>
			<path d="m29.8517,54.08169l40.95021,-23.76637l41.15387,23.42957l-82.10408,0.3368z" stroke-width="0" transform="rotate(120.005 70.9037 42.1985)" opacity=".15" style="fill: black;opacity: .5;"></path>
			<path d="m50.84794,54.21713l41.14723,-23.71165l40.66986,23.126l-81.81709,0.58565z" stroke-width="0" transform="rotate(240.005 91.7565 42.3613)" opacity=".6" style="fill: black;opacity: .6;"></path>
			<path d="m92.34289,123.94524l40.84106,-24.40053l40.54568,23.11973l-81.38674,1.2808z" stroke-width="0" transform="rotate(240.005 133.036 111.745)" opacity=".35" style="fill: black;opacity: .67;"></path>

			<path id="border" d="m80.7229,0.44444l82.61043,140.55521l-163.22223,0.44479l80.6118,-141z" fill="none" stroke-width="1" style="fill: transparent;stroke: transparent;"></path>

			<path d="m80.63317,96.1755l0.39079,45.37696l41.8002,-23.91294l-0.6859,-46.06544l-41.50509,24.60142z" stroke-width="0" opacity=".25" style="fill: black;opacity: .41;"></path>
			<path d="m60.24695,60.10716l0.41626,47.48081l41.25377,-23.26463l-0.93192,-47.77411l-40.73811,23.55793z" stroke-width="0" transform="rotate(60 81.082 72.0686)" opacity=".67" style="fill: aliceblue;opacity: .01;"></path>
			<path d="m41.52036,94.93062l-0.5376,46.74648l39.55956,-24.26797l-0.06849,-45.66349l-38.95347,23.18498z" stroke-width="0" transform="rotate(120 60.7625 106.711)" style="fill: black;opacity: .25;"></path>
		</g>
	</svg>
	`;
	nothingOpen$1.innerHTML =
		style +
		logo +
		'<div class="editor-empty-blurb"><p>All models are wrong.</p><p style="margin-top:-10px;">Some models are useful.</p></div>';
	return nothingOpen$1;
};

let binaryPreview;
const showBinaryPreview = ({ filename, path = "." } = {}) => {
	try{
		document.getElementById('file-search').style.visibility = "";
	}catch(e){}

	if (!binaryPreview) {
		const editorContainer = document.getElementById("editor-container");
		binaryPreview = document.createElement("div");
		binaryPreview.id = "editor-preview";
		editorContainer.appendChild(binaryPreview);
	}

	const state = getState$1();
	let url;
	try {
		url = state.paths
			.find((x) => x.name === filename)
			.path.replace("/welcome/", "/.welcome/")
			.replace(/^\//, "./");
	} catch (e) {}

	const extension = getExtension(filename);
	const fileType = getFileType(filename);
	const style = `
		<style>
			#editor-preview {
				width: 100%;
				height: 100%;
				display: flex;
				justify-content: center;
				align-items: center;
				padding-bottom: 30%;
				font-size: 2em;
				color: var(--main-theme-text-invert-color);
			}
			#editor-preview .preview-image {
				min-width: 50%;
				image-rendering: pixelated;
				object-fit: contain;
				margin-bottom: -20%;
				padding: 0.7em;
			}
			audio {
				filter: invert(0.7) contrast(1.5);
			}
			audio:focus {
				outline: 0;
				border: 1px solid #444;
				border-radius: 50px;
			}
			video {
				max-width: 95%;
			}
			.image-disclaim {
				position: absolute;
				top: 40px;
				padding: .1em 1em;
				font-size: 0.55em;
				display: flex;
				flex-direction: column;
				justify-content: start;
				align-items: start;
				width: 100%;
			}
			#editor-preview pre {
				font-size: 0.72em;
				opacity: 0.7;
				position: absolute;
				top: 0;
				bottom: 0;
				display: flex;
				justify-content: center;
				align-items: center;
				white-space: pre-line;
			}
		</style>
	`;
	if (fileType === "audio") {
		binaryPreview.innerHTML =
			style +
			`
			<figure>
			<audio
				controls
				loop
				autoplay
				controlsList="play timeline volume"
				src="${url}"
			>
				Your browser does not support the
				<code>audio</code> element.
			</audio>
			</figure>
		`;
	} else if (fileType === "video") {
		binaryPreview.innerHTML =
			style +
			`
			<video
				controls
				loop
				autoplay
				controlsList="play timeline volume"
				disablePictureInPicture
			>
				<source
					src="${url}"
					type="video/${extension}"
				>
				Sorry, your browser doesn't support embedded videos.
			</video>
		`;
	} else {
		binaryPreview.innerHTML =
			style +
			`
			<pre>No editable text for this file type.</pre>
		`;
	}
	return binaryPreview;
};

const miscSystemSettings = [
	{
		name: "exit-current-service",
		description: "Close the current project",
		button: "close",
		onclick: `localStorage.setItem('lastService', ''); document.location.reload()`,
	},
];

const SystemDocs = (section, errors) => {
	const style = `
	<style>
		#editor-system-doc {
			font-size: inherit;
			margin: 0;
			display: flex;
			flex-direction: column;
			justify-content: start;
			align-items: center;
			height: 100%;
			overflow: auto;
			width: 100%;
			padding-bottom: 100px;
			padding-right: 1em;
			padding-left: 1em;
			box-sizing: border-box;
		}
		#editor-system-doc::-webkit-scrollbar { width: 5px; height: 5px; }
		#editor-system-doc::-webkit-scrollbar-corner,
		#editor-system-doc::-webkit-scrollbar-track { background: transparent; }
		#editor-system-doc:hover::-webkit-scrollbar-thumb { background: #333; }
		#editor-system-doc::-webkit-scrollbar-thumb { background: transparent; }
		#editor-system-doc ::placeholder { opacity: 0.35; }

		#editor-system-doc h1 {
			font-size: 1.1em;
			font-variant: all-petite-caps;
			border-bottom: 1px solid;
			padding-bottom: .4em;
			opacity: .55;
			margin: 2.2em 0 0.5em 0;
		}
		.thisSystemDoc {
			max-width: 60em;
		}
		.settings-grid-2-col {
			display: grid;
			grid-template-columns: 1fr auto;
			grid-auto-rows: auto;
			align-items: center;
			margin: 1.5em 0;
			grid-gap: 1em;
			background: #8888881f;
			padding: 1.1em;
			border-radius: 2px;
		}
		#editor-system-doc button {
			background: #88888847;
			border: 0;
			padding: 0.5em;
			color: inherit;
			margin: .3em 0;
		}
		#editor-system-doc button:hover {
			background: rgba(var(--main-theme-highlight-color), 0.4);
		}
		#editor-system-doc ul {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
		}
		#editor-system-doc li {
			margin: 1em;
			width: 100%;
			text-align: center;
			background: #88888826;
		}
		#editor-system-doc form.provider-settings {
			padding: 1em;
			display: flex;
			flex-direction: column;
			margin-top: 1em;
		}
		#editor-system-doc input {
			color: inherit;
			margin-bottom: 1.5em;
			background: #88888829;
			margin-top: 0.3em;
			padding: 0 .5em;
			box-sizing: border-box;
		}
		.provider-settings button.error {
			outline: 1px solid red;
			background: red;
			color: red;
		}
		#settings-all-services-list li {
			display: flex;
			justify-content: space-between;
			padding: 1em;
			align-items: center;
		}
		#settings-all-services-list {
			/*min-height: 400px;*/
			justify-content: flex-start;
		}
	</style>
	`;
	if (!section) {
		const view = htmlToElement(
			`
			<div id="editor-system-doc">
				${style}
				<div class="thisSystemDoc"></div>
			</div>
		`.replace(/		/g, "")
		);
		return view;
	}

	const miscSettings = `
		<h1>Misc Settings</h1>

		${miscSystemSettings
			.map((x) => {
				return `
				<div class="settings-grid-2-col">
					<div>${x.description}</div>
					<div>
						<button id="${x.name}" onclick="${x.onclick}">${x.button}</button>
					</div>
				</div>
			`.replace(/				/g, "");
			})
			.join("\n")}
	`.replace(/		/g, "");

	const addServiceFolder = `
		<h1>Add Folder</h1>
		<p>
			TODO: this functionality will take back seat to service provider because it's a one-shot/one-way solution;
			it's useful, but not as useful.
		</p>
	`.replace(/		/g, "");

	const openPreviousService = `
		<h1>Open Previous Service</h1>
		<p>
			Show a list of services each with button that sets lastService and does document reload
		</p>
		<ul id="settings-all-services-list">
			<li></li>
		</ul>
	`.replace(/		/g, "");

	const connectServiceProvider = `
		<h1>Connect a Service Provider</h1>
		<p>
			TODO: show a list of providers and allow setup
			At first, only local file server (electron), aka basic server, will be available
			In the future, this could be a much long list of providers.
			TODO: get list of currently registered providers and show here (remove default value for basic server)
		</p>
		<ul>
			<li>
				<button
					onclick="event.target.parentNode.querySelector('.provider-settings').classList.toggle('hidden')"
				>Github</button>
				<form class="provider-settings" autocomplete="off" onsubmit="return false;">
					<input class="hidden" autocomplete="false" name="hidden" type="text">
					<input name="provider-type" class="hidden" type="text" value="github-provider">

					<label>Personal Access Token</label>
					<input name="provider-access-token" type="text" >

					<button class="provider-test">Test Provider</button>
					<button class="provider-save">Save Provider</button>

					<label style="margin-top: 30px;">Repository</label>
					<input type="text"
						name="provider-repository"
						value="crosshj/fiug-welcome"
						placeholder="{user}/{repository name}"
					>
					<input type="text"
						name="provider-repository-branch"
						value="main"
						placeholder="branch name"
					>
					<button class="provider-add-service">Add Repository</button>
				</form>
			</li>
			<li>
				<button
					onclick="event.target.parentNode.querySelector('.provider-settings').classList.toggle('hidden')"
				>Bartok Basic Server</button>
				<form class="provider-settings" autocomplete="off" onsubmit="return false;">
					<input class="hidden" autocomplete="false" name="hidden" type="text">
					<input name="provider-type" class="hidden" type="text" value="basic-bartok-provider">

					<label>Server URL</label>
					<input name="provider-url" type="text" value="http://localhost:3333/">

					<button class="provider-test">Test Provider</button>
					<button class="provider-save">Save Provider</button>
					<button class="provider-add-service">Add Folder</button>
				</form>
			</li>
			<li>
				<button
					onclick="event.target.parentNode.querySelector('.provider-settings').classList.toggle('hidden')"
				>Bartok Advanced Server</button>
				<form class="provider-settings hidden" autocomplete="off" onsubmit="return false;">
					<input class="hidden" autocomplete="false" name="hidden" type="text">
					<input name="provider-type" class="hidden" type="text" value="basic-advanced-provider">

					<label>Server URL</label>
					<input name="provider-url" type="text" >

					<button class="provider-test">Test Provider</button>
					<button class="provider-save">Save Provider</button>
					<button class="provider-add-service">Add Folder</button>
				</form>
			</li>
		</ul>
	`.replace(/		/g, "");

	const allSettings = `
		${connectServiceProvider}
		${addServiceFolder}
		${openPreviousService}
		${miscSettings}
	`.replace(/		/g, "");

	const sectionText = {
		"add-service-folder": addServiceFolder,
		"connect-service-provider": connectServiceProvider,
		"open-previous-service": openPreviousService,
		"open-settings-view": allSettings,
	}[section];
	return sectionText || "";
};

let systemDocsDOM;
const showSystemDocsView = ({ filename='', op='' }, context) => {
	const { systemDocsErrors : errors } = context;
	try{
		document.getElementById('file-search').style.visibility = "";
	}catch(e){}

	if (!systemDocsDOM) {
		const editorContainer = document.getElementById("editor-container");
		systemDocsDOM = SystemDocs();
		editorContainer.appendChild(systemDocsDOM);
	}
	if (filename) {
		systemDocsDOM.querySelector(".thisSystemDoc").innerHTML = SystemDocs(filename);
	}
	const allServicesList = document.getElementById("settings-all-services-list");

	const updateServicesListDom = async () => {
		if(!allServicesList) return;
		allServicesList.innerHTML = "<li>loading...</li>";
		const services = (await getAllServices()) || [];
		const ServiceRowOnClick = (s) => [
			`localStorage.setItem('lastService','${s.id}');`,
			`document.location.reload();`
		].join(' ');
		const ServiceRow = (s) => `
			<li>
				<span>[ ${s.id} ] ${s.name}</span>
				<button onclick="${ServiceRowOnClick(s)}">LOAD</button>
			</li>
		`.trim().replace(/^			/g, '');
		allServicesList.innerHTML = services.map(ServiceRow).join("\n");
	};
	updateServicesListDom();

	// TODO: this could be improved to match the button which error'ed
	if (errors.length) {
		errors.forEach((error) => {
			const domForError = systemDocsDOM.querySelector(
				"." + error.op.replace("-done", "")
			);
			if (domForError) {
				domForError.classList.add("error");
				return;
			}
			console.error(error);
		});
	}

	return systemDocsDOM;
};

let editorDom, editorPreview, nothingOpenDom, systemDocsView;

/*
TODO:
	1. should probably be no distinction between switch & message
	2. should probably delete (some/all ?) views (versus just hiding them)
*/

const switchEditor = async (args, { editor, context }) => {
	const { filename, mode, line, column } = args;
	//TODO: should go into loading mode first

	if (mode === "systemDoc") {
		const editorCallback = () => {
			editorDom = document.querySelector(".CodeMirror");
			editorDom && editorDom.classList.add("hidden");
		};
		editor({
			code: "",
			name: "",
			id: "",
			filename,
			callback: editorCallback,
		});

		systemDocsView = showSystemDocsView({ filename }, context);
		systemDocsView && systemDocsView.classList.remove("hidden");

		editorPreview && editorPreview.classList.add("hidden");
		nothingOpenDom && nothingOpenDom.classList.add("hidden");

		return;
	}

	if (mode === "nothingOpen") {
		const editorCallback = () => {
			editorDom = document.querySelector(".CodeMirror");
			editorDom && editorDom.classList.add("hidden");
		};
		editor({
			code: "",
			name: "",
			id: "",
			filename: "",
			callback: editorCallback,
		});

		nothingOpenDom = showNothingOpen();
		nothingOpenDom && nothingOpenDom.classList.remove("hidden");

		editorPreview && editorPreview.classList.add("hidden");
		editorDom && editorDom.classList.add("hidden");
		systemDocsView && systemDocsView.classList.add("hidden");
		return;
	}

	setCurrentFile({ filePath: filename });

	const currentFile = await getCurrentFileFull();
	const {
		code = "error",
		path,
		name,
		id,
		filename: defaultFile,
	} = currentFile || {};

	if (!currentFile || !showFileInEditor(filename)) {
		const editorCallback = () => {
			editorDom = document.querySelector(".CodeMirror");
			editorDom && editorDom.classList.add("hidden");
		};
		editor({
			code: "",
			name: "",
			id: "",
			filename: "",
			callback: editorCallback,
		});

		editorPreview = showBinaryPreview({ filename, code });
		editorPreview && editorPreview.classList.remove("hidden");

		editorDom && editorDom.classList.add("hidden");
		nothingOpenDom && nothingOpenDom.classList.add("hidden");
		systemDocsView && systemDocsView.classList.add("hidden");
		return;
	}

	editor({
		code, line, column, name, id, path,
		filename: filename || defaultFile
	});
	editorDom = document.querySelector(".CodeMirror");
	editorDom && editorDom.classList.remove("hidden");

	editorPreview && editorPreview.classList.add("hidden");
	nothingOpenDom && nothingOpenDom.classList.add("hidden");
	systemDocsView && systemDocsView.classList.add("hidden");
};

const messageEditor = (args, { editor, context }) => {
	const { op, result } = args;
	if (!result.error) return showSystemDocsView({ op });
	context.systemDocsErrors = context.systemDocsErrors.filter((x) => x.op === op);
	context.systemDocsErrors.push({ op, error: result.error });
	showSystemDocsView({ errors: context.systemDocsErrors });
};

const listeners$1 = {};
const triggers$1 = {};

function attach({
	name, listener, eventName, options, key, context
}){
	if(!name || !listener || !eventName){
		console.error('Attempt to improperly attach an event listener');
		console.error({ name, listener, eventName });
		return;
	}
	const listenerName = `${eventName}__${name}`;
	if(listeners$1[listenerName]) return;

	// TODO: alter this approach, instead use ONE event listener attached to window (?)
	// this approach kinda sucks because a lot of listeners get added to window
	// also there is less control over events as they are handled
	const _listener = (e) => listener(e, context || {});
	window.addEventListener(eventName, _listener, options);
	listeners$1[listenerName] = listener; 
	if(key){
		listeners$1[listenerName]._meta = { key, name, eventName, options };
	}
}

function list(){ return Object.keys(listeners$1); }

/*
future todo:

- when an event is triggered, don't create a custom event if event listeners exist already for that event
- instead, just trigger those

- there should be an uber listener instead of a bunch of click listeners added

*/

// this thing is used too many ways... SIGH
function trigger(args){
	const { e, type, params, source, data, detail } = args;
	const _data = typeof data === "function"
		? data(e)
		: data || (detail||{}).data || {};
	//console.log(`triggering event: ${type}`);
	const defaultDetail = {
		..._data,
		...params,
		...{ source },
		data: _data
	};

	const _detail = detail
		? { ...defaultDetail, ...detail, data: _data }
		: defaultDetail;

	const event = new CustomEvent(type, { bubbles: true, detail: _detail });
	window.dispatchEvent(event);
	
	const blackList = [
		'operationDone'
	];
	const { e:ignore, ...triggerEvent } = args;
	if(!blackList.includes(type)){
		window.top.postMessage({ triggerEvent }, location);
	}
}

let triggerClickListener;
const attachTrigger = function attachTrigger({
	name, // the module that is attaching the listener
	type='click', // the input event name, eg. "click"
	data, // an object or function to get data to include with fired event
	eventName, // the name of the event(s) that triggers are attached for (can also be a function or an array)
	filter // a function that will filter out input events that are of no concern
}){
	if(type === 'raw'){
		const triggerName = `${eventName}__${name}`;
		const _trigger = (args) => {
			trigger({
				...args,
				e: args,
				data,
				type: eventName,
				source: name
			});
		};
		triggers$1[triggerName] = {
			eventName, type, trigger: _trigger
		};
		return _trigger;
	}

	if(type !== 'click') {
		console.error(`triggering based on ${type} not currently supported`);
		return;
	}

	const listener = triggerClickListener || ((event) => {
		const foundTrigger = Object.keys(triggers$1)
			.map(key => ({ key, ...triggers$1[key] }) )
			.find(t => {
				if(t.type === 'raw'){
					return false;
				}
				//this won't work if only one global listener
				//if(t.key !== triggerName) return false;
				const filterOkay = t.filter && typeof t.filter === "function" && t.filter(event);
				return filterOkay;
			});
		if(!foundTrigger) return true; //true so event will propagate, etc
		event.preventDefault();
		event.stopPropagation();

		const { eventName: type, data } = foundTrigger;
		const params = {};
		const source = {};
		const _data = typeof data === "function"
			? data(event)
			: data || {};
		trigger({ type, params, source, data: _data, detail: (_data||{}).detail });
		return false;
	});

	const options = {};
	if(!triggerClickListener){
		window.addEventListener(type, listener, options);
	}

	const triggerName = `${eventName}__${name}`;
	triggers$1[triggerName] = {
		eventName, filter, data, type
	};

	triggerClickListener = triggerClickListener || listener;
};
function listTriggers$1(){
	return Object.keys(triggers$1);
}

window.listTriggers = listTriggers$1;
window.listListeners = list;

function attachEvents(events, context) {
	const listenersConfig = flatFromProp(events.listeners, 'handlers');
	for(const handler of listenersConfig){
		attach({ ...handler, context });
	}

	context.triggers = {};
	context.triggerEvent = {};

	const connectTriggers = ([namespace, _triggers]) => {
		const _name = namespace.toLowerCase();
		const triggersConfig = flatFromProp(_triggers, 'handlers');
		const triggers = triggersConfig
			.reduce((acc, { name, eventName, ...item }) => {
				const trigger = attachTrigger({ ...item, name: namespace, eventName });
				if(!trigger) return acc;
				return { ...acc, [name || eventName]: trigger };
			}, {});
		context.triggers[_name] = triggers;
		context.triggerEvent[_name] = (eventName, operation) => {
			context.triggers[_name][eventName]({
				detail: {
					operation,
					done: () => {},
					body: {},
				},
			});
		};
	};

	Object.entries(events.triggers).map(connectTriggers);
}

window.addEventListener('message', function(messageEvent) {}, false);

/*

see https://felixgerschau.com/how-to-communicate-with-service-workers/

TODO:
	- call to service worker to set up exchange
	- SW events trigger handlers as registered with this file, ie. attach
	- triggers from this file result in message to SW
	
	- SW will have to be configure to fire messages for things that are currently HTTP requests
*/
await navigator.serviceWorker.ready;
//console.log(registration)

navigator.serviceWorker.controller.postMessage({
	type: 'TEST_MESSAGE',
});

const fileSelectHandler = async (event, { getFilePath, switchEditor }) => {
	const { name, path, next, nextPath, parent } = event.detail;
	const { line, column } = event.detail;

	/*
	console.log(
		`%c${name}: %ceditor %cfileSelect`,
		'color:#CE9178;',
		'color:#9CDCFE;',
		'color:#DCDCAA;'
	);
	*/

	/*
	if (firstLoad) {
		firstLoad = false;
		savedFileName = sessionStorage.getItem("editorFile");
		if (savedFileName && savedFileName === "noFileSelected") {
			switchEditor(null, "nothingOpen");
			return;
		}
		if (
			savedFileName &&
			savedFileName.includes("system::") &&
			savedFileName.includes("systemDoc::")
		){
			switchEditor(savedFileName.replace("system::", ""), "systemDoc");
			return;
		}
	}
	*/

	const fileNameWithPath = getFilePath({ name, parent, path, next, nextPath });
	const filePath = fileNameWithPath;

	/*
	if (!savedFileName) {
		sessionStorage.setItem("editorFile", filePath);
	}
	*/

	if (name.includes("system::") || filePath.includes("systemDoc::")) {
		switchEditor({
			filename: filePath
				.replace("system::", "")
				.replace("systemDoc::", ""),
			mode: "systemDoc"
		});
		return;
	}

	if(!name){
		//sessionStorage.setItem("editorFile", '');
		switchEditor({ mode: "nothingOpen" });
		return;
	}

	switchEditor({ filename: filePath, line, column });
};

const operationDoneHandler = (e, context) => {
	const { messageEditor } = context;

	const { detail } = e;
	const { op, result } = (detail || {});

	const providerOps = ["provider-test", "provider-save", "provider-add-service"];
	if (providerOps.includes(op)) {
		messageEditor({
			op: op + "-done",
			result,
		});
		return;
	}

	if (['read', 'update'].includes(op)) {
		const selected = result[0]?.state?.selected;
		fileSelectHandler({ detail: selected }, context);
		return;
	}
};

const fileClose = (e, { getCurrentFile, getFilePath, switchEditor }) => {
	const { name, parent, path, next, nextPath } = e.detail;
	if(!next){
		switchEditor({ mode: "nothingOpen" });
		return;
	}

	//TODO: shouldn't this be fileSelect handler after this point?

	if(next.includes("system::")) {
		switchEditor({
			filename: next.replace("system::", ""),
			mode: "systemDoc"
		});
		return;
	}
	const currentFile = getCurrentFile();
	if(next === currentFile) return;

	const filename = getFilePath({ name, parent, path, next, nextPath });
	switchEditor({ filename });
};

const contextMenuHandler = (e, { triggers }) => {
	const editorDom = document.querySelector("#editor .CodeMirror");
	if (!editorDom) {
		return true;
	}
	if (!editorDom.contains(e.target)) {
		return true;
	}
	e.preventDefault();

	const listItems = [
		//"Change All Occurences",
		//"Format Selection",
		//"Format Document",
		//"seperator",
		"Cut",
		"Copy",
		"Paste",
		"seperator",
		"Command Palette",
	].map((x) => (x === "seperator" ? "seperator" : { name: x, disabled: false }));
	let data;
	try {
		data = {};
	} catch (e) {}

	if (!data) {
		console.error("some issue finding data for this context click!");
		return;
	}

	triggers.editor.contextMenuShow({
		detail: {
			x: e.clientX,
			y: e.clientY,
			list: listItems,
			parent: "Editor",
			data,
		}
	});
	return false;
};

const paste = async () => {
	window.Editor.focus();
	const toPaste = await navigator.clipboard.readText();
	window.Editor.replaceSelection(toPaste);
};
const cutSelected = () => {
	window.Editor.focus();
	const copied = window.Editor.getSelection();
	navigator.clipboard.writeText(copied);
	window.Editor.replaceSelection('');
};
const copySelected = () => {
	const copied = window.Editor.getSelection();
	navigator.clipboard.writeText(copied);
};
	
const contextMenuSelectHandler = (e, { triggerEvent }) => {
	const { which, parent, data } = e.detail || {};
	if (parent !== "Editor") {
		//console.log('Editor ignored a context-select event');
		return;
	}
	const contextCommands = {
		"Cut": cutSelected,
		"Copy": copySelected,
		"Paste": paste,
		"Command Palette": () => triggerEvent("ui", "commandPalette")
	};
	const handler = contextCommands[which];
	if(!handler) return console.error(`Unrecognized context menu command: ${which}`);
	handler({ parent, data });
};

/*
NOTE: this might just be a fileSelect in disguise...
*/

const serviceSwitchListener = async (event, { getCurrentFile, getCurrentService, switchEditor }) => {
	const fileName = getCurrentFile();
	//sessionStorage.setItem("editorFile", fileName);
	const currentService = getCurrentService({ pure: true });
	const fileBody = currentService.code.find((x) => x.name === fileName);
	if (!fileBody) {
		console.error(
			`[editor:serviceSwitch] Current service (${currentService.id}:${currentService.name}) does not contain file: ${fileName}`
		);
		switchEditor(null, "nothingOpen");
		return;
	}
	switchEditor(fileName, null, fileBody.code);
};

const test = {
	data: (event) => {
		return Array.from(
			event.target.parentNode.querySelectorAll('input:not([name="hidden"])')
		).map(({ name, value }) => ({ name, value }));
	},
	filter: (e) =>
		document.querySelector("#editor").contains(e.target) &&
		e.target.classList.contains("provider-test"),
};

const save = {
	data: (event) => {
		return Array.from(
			event.target.parentNode.querySelectorAll('input:not([name="hidden"])')
		).map(({ name, value }) => ({ name, value }));
	},
	filter: (e) =>
		document.querySelector("#editor").contains(e.target) &&
		e.target.classList.contains("provider-save"),
};

const addService = {
	data: (event) => {
		return Array.from(
			event.target.parentNode.querySelectorAll('input:not([name="hidden"])')
		).map(({ name, value }) => ({ name, value }));
	},
	filter: (e) =>
		document.querySelector("#editor").contains(e.target) &&
		e.target.classList.contains("provider-add-service"),
};

var provider = { test, save, addService };

const nothingOpen = (e, { switchEditor }) => switchEditor(null, "nothingOpen");
const systemDocs = (e, { switchEditor }) => switchEditor(e.type, "systemDoc");

var editor = {
	...formatHandlers('Editor', {
		operationDone: operationDoneHandler,
		fileSelect: fileSelectHandler,
		fileClose,
		contextMenu: contextMenuHandler,
		contextMenuSelect: contextMenuSelectHandler,
		serviceSwitch: serviceSwitchListener,
		nothingOpen,
		systemDocs,
	}),
	provider
};

const handler$e = (e, { tabs }) => {
	const {
		initTabs,
		createTab,
		updateTab,
		removeTab,
	} = tabs.operations;

	const { sysDocNames } = tabs;

	let { name, changed, parent, path } = event.detail;
	if(path) parent = path;

	if(!parent && name?.includes('/')){
		parent = name.split('/').slice(0,-1).join('/');
		name = name.split('/').pop();
	}
	if(name?.includes('system::')){
		tabs.update(tabsApi.list() || []);
	}
	if(!tabs.api.list()) return;
	let systemDocsName;
	if (name?.includes("system::")) {
		systemDocsName = sysDocNames[name.replace("system::", "")];
	}
	let id = "TAB" + Math.random().toString().replace("0.", "");

	let { tabsToUpdate, foundTab } = tabs.api.toUpdate(parent
		? `${parent}/${name}`
		: name
	);
	if (foundTab) {
		tabsToUpdate.map(updateTab);
		//localStorage.setItem("tabs/"+(service?.name||''), JSON.stringify(tabs.list()));
		return;
	}

	createTab({
		name,
		parent,
		active: true,
		id,
		changed,
	});
	const shouldClearTab = !name.includes("Untitled-");

	const { cleared, tabs: newTabs } = (shouldClearTab && tabs.api.clearLast({
		tabs, removeTab 
	})) || {};
	if (newTabs) tabs = newTabs;
	if (cleared) tabsToUpdate = tabsToUpdate.filter((t) => t.id !== cleared.id);
	tabsToUpdate.map(updateTab);
	tabs.api.push({
		name,
		parent,
		systemDocsName,
		active: true,
		id,
		changed,
	});
	//localStorage.setItem("tabs/"+(service.get()?.name||''), JSON.stringify(tabs));
};

function removeTabByEventDetail({ removeTab, updateTab }, eventDetail, tabs){
	let { name, filename, path, parent, next, nextPath } = eventDetail;
	name = name || filename;
	path = path || parent;

	const service = getCurrentService();

	if(!path && name?.includes('/')){
		path = name.split('/').slice(0,-1).join('/');
		name = name.split('/').pop();
	}
	if(!nextPath && next?.includes('/')){
		nextPath = next.split('/').slice(0,-1).join('/');
		next = next.split('/').pop();
	}
	let closedFullName = path ? `${path}/${name}` : name;
	if(service?.name && new RegExp("^" + service.name).test(closedFullName)){
		closedFullName = closedFullName.replace(service.name+'/', '');
	}

	const tabFullName = (x) => (x.parent ? `${x.parent}/${x.name}` : x.name);
	const found = tabs.api.find((x) => tabFullName(x) === closedFullName);
	if(!found) return;
	
	tabs.api.update(
		tabs.api.list().filter((x) => tabFullName(x) != closedFullName)
	);

	if(next || !tabs.api.find(x => x.active)){
		const nextTab = next && tabs.api.find(
			(x) => (x.name === next && x.parent === nextPath) || x.systemDocsName === next
		);
		const tabToActivate = nextTab || tabs[tabs.length-1];
		if(tabToActivate){
			tabToActivate.active = true;
			updateTab(tabToActivate);
		}
	}

	//localStorage.setItem("tabs/"+(service?.name||''), JSON.stringify(tabs));
	removeTab(found);
}

const handler$d = (e, { tabs }) => {
	const { removeTab, updateTab } = tabs.operations;
	removeTabByEventDetail({ removeTab, updateTab }, event.detail, tabs);
};

const handler$c = (event, context) => {
	const { tabs } = context;
	tabs.operations;

	const { operation } = event.detail || {};
	if(!operation || !['deleteFile'].includes(operation)){
		return;
	}

	if(operation === 'deleteFile'){
		handler$d(e, context);
		return;
	}
};

const handler$b = (e, context) => {
	const {tabs:container} = context;
	const {
		initTabs,
		createTab,
		updateTab,
		removeTab,
	} = container.operations;

	const { op, id, result = [] } = event.detail || {};
	if(result?.error) return;
	if (!["read", "update"].includes(op) || !id) return;

	const { opened=[], changed=[] } = result[0]?.state || {};
	let tabs = opened.map(({ name, order }) => ({
		id: "TAB" + Math.random().toString().replace("0.", ""),
		name: name.split('/').pop(),
		parent: name.split('/').slice(0,-1).join('/'),
		touched: changed.includes(name),
		changed: changed.includes(name),
		active: order === 0,
		//systemDocsName: sysDocNames[name.replace("system::", "")]
	}));
	container.api.update(tabs);
	initTabs(tabs, context);
};

const handler$a = (e, { tabs }) => {
	const {
		initTabs,
		createTab,
		updateTab,
		removeTab,
	} = tabs.operations;

	const { filePath } = event.detail;
	const { foundTab } = tabs.api.toUpdate(filePath);
	if (!foundTab) {
		console.error(`Could not find a tab named ${filePath} to update`);
		return;
	}
	foundTab.changed = true;
	[foundTab].map(updateTab);
	//localStorage.setItem("tabs/"+(service?.name||''), JSON.stringify(tabs));
};

const handler$9 = (event, { triggers, tabs }) => {
	const editorDom = document.querySelector("#editor-tabs-container");
	if (!editorDom.contains(event.target)) {
		return true;
	}
	event.preventDefault();

	const tabBarClicked = event.target.id === "editor-tabs";
	const theTab =
		!tabBarClicked && event.target.classList.contains("tab")
			? event.target
			: undefined;
	const theTabId = theTab && theTab.id;
	const tab = theTab && tabs.api.find((x) => x.id === theTabId);
	// TODO: maybe these should be defined in UI Module
	// filter actions based on whether tab was found or not
	const barClickItems = [{ name: "Close All" }];
	const multiTabsItems = [
		"Close",
		{ name: "Close Others" },
		{ name: "Close All" },
		"-------------------",
		"Copy Path",
		"Copy Relative Path",
		//"-------------------",
		//"Reveal in Side Bar",
		//"-------------------",
		//{ name: "Keep Open", disabled: true },
		//{ name: "Pin", disabled: true },
	];
	const tabClickItems = [
		"Close",
		"-------------------",
		"Copy Path",
		"Copy Relative Path",
		//"-------------------",
		//"Reveal in Side Bar",
		//"-------------------",
		//{ name: "Keep Open", disabled: true },
		//{ name: "Pin", disabled: true },
	];

	const listItems = (tab
		? tabs.length > 1
			? multiTabsItems
			: tabClickItems
		: barClickItems
	).map((x) =>
		x === "-------------------"
			? "seperator"
			: typeof x === "string"
			? { name: x, disabled: false }
			: x
	);
	let data;
	try {
		data = { tab };
	} catch (e) {}

	if (!data) {
		console.error("some issue finding data for this context click!");
		return;
	}
	triggers.tabs.contextMenuShow({
		detail: {
			x: event.clientX,
			y: event.clientY,
			list: listItems,
			parent: "Tab Bar",
			data,
		}
	});
	return false;
};

function copyPath(data, relative) {
	const state = getState();
	const { name } = data;
	let url;
	try {
		url = state.paths
			.find((x) => x.name === name)
			.path.replace("/welcome/", "/.welcome/")
			.replace(/^\//, "./");
	} catch (e) {}
	if (!url) {
		console.log("TODO: make Copy Path work with folders!");
		return;
	}
	const path = relative ? url : new URL(url, document.baseURI).href;
	navigator.clipboard
		.writeText(path)
		.then((x) => console.log(`Wrote path to clipboard: ${path}`))
		.catch((e) => {
			console.error(`Error writing path to clipboard: ${path}`);
			console.error(e);
		});
}

const handler$8 = (event, { tabs }) => {
	const { triggers } = tabs;

	const { which, parent, data } = event.detail || {};
	if (parent !== "Tab Bar") return;
	const NOT_IMPLEMENTED = (fn) => () =>
		setTimeout(() => alert(fn + ": not implemented"), 0);
	const handler = {
		close: ({ tab }) => triggers.fileClose({ detail: tab }),
		closeothers: triggers.closeOthers,
		closeall: triggers.closeAll,
		copypath: ({ tab }) => copyPath(tab),
		copyrelativepath: ({ tab }) => copyPath(tab, "relative"),
		revealinsidebar: ({ tab }) => {
			triggers.fileSelect({ detail: tab });
			document.getElementById("explorer").focus();
		},
		keepopen: NOT_IMPLEMENTED("keepopen"),
		pin: NOT_IMPLEMENTED("pin"),
	}[which.toLowerCase().replace(/ /g, "")];

	handler && handler(data);
};

const handler$7 = (e, { tabs }) => {
	tabs.operations;
	const { detail } = event;
	const { operation } = detail;
	const doHandle = {
		prevDocument: () => {
			// TODO: determine what tab is previous
			// fileSelect it
			console.warn("prevDocument: not implemented!");
		},
		nextDocument: () => {
			// TODO: determine what tab is next
			// fileSelect it
			console.warn("nextDocument: not implemented!");
		},
	}[operation];
	if (!doHandle) return;
	doHandle();
};

function triggerCloseTab(event, fileCloseTrigger, tabs) {
	let name, parent;
	try {
		name = event.target.dataset.name.trim();
		parent = (event.target.dataset.parent||'').trim();
	} catch (e) {
		console.log("error trying to handle close tab click");
		console.log(e);
	}
	if (!name) {
		return;
	}
	const closedFullName = parent ? `${parent}/${name}` : name;
	const tabFullName = (x) => (x.parent ? `${x.parent}/${x.name}` : x.name);

	const closedTab = tabs.find((x) => closedFullName === tabFullName(x));
	const nextTabs = tabs.filter((x) => closedFullName !== tabFullName(x));
	const nextTab = closedTab.active
		? (nextTabs[nextTabs.length - 1] || {})
		: (tabs.filter((x) => x.active) || [{}])[0];

	fileCloseTrigger({
		detail: {
			name: closedTab.name,
			path: closedTab.parent,
			next: nextTab.name,
			nextPath: nextTab.parent,
		},
	});
}

const handler$6 = (e, context) => {
	const { tabs, triggers } = context;
	const container = tabs;

	if (!container.contains(event.target)) {
		//console.log('did not click any tab container element');
		return;
	}
	if (
		!event.target.classList.contains("tab") &&
		!event.target.classList.contains("close-editor-action")
	) {
		return;
	}

	if (event.target.classList.contains("close-editor-action")) {
		triggerCloseTab(event, triggers.tabs.fileClose, tabs.api.list());
		event.preventDefault();
		return;
	}
	const id = event.target.id;

	const foundTab = tabs.api.list().find((x) => x.id === id);
	if (
		tabs.api.list()
			.filter((x) => x.active)
			.map((x) => x.id)
			.includes(id)
	) {
		return;
	}

	//TODO: keep track of the order which tabs are clicked

	// const { tabsToUpdate, foundTab } = getTabsToUpdate(name);
	// tabsToUpdate.map(updateTab);
	const service = getCurrentService();

	triggers.tabs.fileSelect({
		detail: {
			name: foundTab.name,
			path: foundTab.parent,
			parent: foundTab.parent,
			service: service ? service.name : '',
		},
	}, context);
};

const handler$5 = (event, context) => {
	const fileSelectEvent = {
		detail: {
			name: `system::` + event.type,
		},
	};
	handler$e(fileSelectEvent, context);
};

/*
	TODO: still work to be done on this
	- reference the function above (old way)
	- instead of doing this all at once
		1) fire the event
		2) handle the event
*/
const closeAll = {
	data: (event) => {
		return {};
	}
};
const closeOthers = {
	data: (event) => {
		return {};
	}
};

var closeMultiple = { closeAll, closeOthers };

var tabs = {
	...formatHandlers('Tabs', {
		operations: handler$c,
		operationDone: handler$b,
		fileSelect: handler$e,
		fileClose: handler$d,
		fileChange: handler$a,
		contextMenu: handler$9,
		contextMenuSelect: handler$8,
		ui: handler$7,
		click: handler$6,
		systemDocs: handler$5,
		closeMultiple,
	})
};

const handler$4 = (event, context) => {
	const { status } = context;
	const {
		setLineNumber,
		setColNumber,
		setTabSize,
		setDocType
	} = status.operations;

	const { detail } = event;
	const { line, column } = detail;
	setLineNumber(line);
	setColNumber(column);
};

const handler$3 = (event, context) => {
	const { status } = context;
	status.operations;
	//console.log('status bar listen for fileChange');
};

const handler$2 = (event, context) => {
	const { status } = context;
	const {
		setLineNumber,
		setColNumber,
		setTabSize,
		setDocType
	} = status.operations;

	const { detail } = event;
	const { name } = detail;
	if (!name) {
		return;
	}
	const fileType = getFileType(name);
	const mode = codemirrorModeFromFileType(fileType);
	setDocType(friendlyModeName(fileType,mode));
	// if (!firstRun) {
		// sessionStorage.setItem(
		// 	"statusbar",
		// 	JSON.stringify({
		// 		mode,
		// 		line: 1,
		// 		col: 1,
		// 	})
		// );
	// }
	setLineNumber(1);
	setColNumber(1);
};

const handler$1 = (event, context) => {
	const { status } = context;
	status.operations;
	//console.log('status bar fileClose');
};

//import { getDefaultFile } from "../../utils/State.js";

const handler = (event, context) => {
	const { status } = context;
	const {
		setLineNumber,
		setColNumber,
		setTabSize,
		setDocType
	} = status.operations;

	// if (firstRun) {
	// 	firstRun = false;
	// 	const savedMode = (() => {
	// 		try {
	// 			return JSON.parse(sessionStorage.getItem("statusbar")).mode;
	// 		} catch (e) {}
	// 	})();
	// 	if (savedMode) {
	// 		setDocType(savedMode);
	// 		setLineNumber(1);
	// 		setColNumber(1);
	// 		return;
	// 	}
	// }
	const { detail } = event;
	const { op, id, result } = detail;
	// only care about service read with id
	if (op !== "read" || !id) {
		return;
	}
	const selected = result[0]?.state?.selected;

	//have to figure out what file gets loaded by default (boo!)
	//const defaultFile = getDefaultFile(result[0]);
	const defaultFile = selected.name;
	const fileType = getFileType(defaultFile);
	const mode = codemirrorModeFromFileType(fileType);
	setDocType(friendlyModeName(fileType,mode));
	// sessionStorage.setItem(
	// 	"statusbar",
	// 	JSON.stringify({
	// 		mode,
	// 		line: 1,
	// 		col: 1,
	// 	})
	// );
	setLineNumber(1);
	setColNumber(1);

};

//triggers

var status = {
	...formatHandlers('Status', {
		cursorActivity: handler$4,
		fileChange: handler$3,
		fileSelect: handler$2,
		fileClose: handler$1,
		operationDone: handler,
	})
};

const listeners = [{
	eventName: "service-switch-notify",
	handlers: [ editor.serviceSwitch ]
}, {
	eventName: "cursorActivity",
	handlers: [ status.cursorActivity ]
}, {
	eventName: "operationDone",
	handlers: [ editor.operationDone, tabs.operationDone, status.operationDone ]
}, {
	eventName: "operations",
	handlers: [ tabs.operationDone ]
}, {
	eventName: "open-settings-view",
	handlers: [ editor.systemDocs, tabs.fileSelect ]
}, {
	eventName: "add-service-folder",
	handlers: [ editor.systemDocs, tabs.fileSelect ]
}, {
	eventName: "open-previous-service",
	handlers: [ editor.systemDocs, tabs.fileSelect ]
}, {
	eventName: "connect-service-provider",
	handlers: [ editor.systemDocs, tabs.fileSelect ]
}, {
	eventName: "noServiceSelected",
	handlers: [ editor.nothingOpen ]
}, {
	eventName: "fileSelect",
	handlers: [ editor.fileSelect, tabs.fileSelect, status.fileSelect ]
}, {
	eventName: "fileClose",
	handlers: [ editor.fileClose, tabs.fileClose, status.fileClose ]
}, {
	eventName: "fileChange",
	handlers: [ tabs.fileChange, status.fileChange ]
}, {
	eventName: "contextmenu",
	handlers: [
		{ ...editor.contextMenu, options: { capture: true } },
		{ ...tabs.contextMenu, options: { capture: true } },
	]
}, {
	eventName: "contextmenu-select",
	handlers: [ editor.contextMenuSelect, tabs.contextMenuSelect ]
}, {
	eventName: "ui",
	handlers: [ tabs.ui ]
//DEPRECATE listener click (ui should call trigger)
}, {
	eventName: "click",
	handlers: [ tabs.click ]
}];

const triggers = {
	Editor: [{
			eventName: "ui",
			type: "raw",
		}, {
			eventName: "fileClose",
			type: 'raw',
		}, {
			eventName: "fileSelect",
			type: 'raw',
		}, {
			eventName: "contextMenuShow",
			type: 'raw',
		}, {
			eventName: "provider-test",
			type: 'click',
			handlers: [ editor.provider.test ]
		}, {
			eventName: "provider-save",
			type: 'click',
			handlers: [ editor.provider.save ]
		}, {
			eventName: "provider-add-service",
			type: 'click',
			handlers: [ editor.provider.addService ]
		}],
	Tabs: [{
			eventName: "ui",
			type: "raw",
		}, {
			eventName: "fileClose",
			type: 'raw',
		}, {
			eventName: "fileSelect",
			type: 'raw',
		}, {
			eventName: "contextMenuShow",
			type: 'raw',
		}, {
			name: "addFileUntracked",
			eventName: "operations",
			type: 'raw',
			data: {
				operation: "addFile",
				untracked: true,
			},
		}],
	Status: [{
			eventName: "ui",
			type: "raw",
		}, {
			eventName: "fileClose",
			type: 'raw',
		}, {
			eventName: "fileSelect",
			type: 'raw',
		}],
};

var events = { listeners, triggers };

const CursorActivityHandler = ({ line, column }) => {
	const event = new CustomEvent("cursorActivity", {
		bubbles: true,
		detail: { line, column },
	});
	document.body.dispatchEvent(event);
};

const ChangeHandler = (doc) => {
	const { code, name, id, filename } = doc;
	const service = getCurrentService();

	// TODO: if handler already exists, return it
	const changeThis = (contents, changeObj) => {
		setState({
			name,
			id,
			filename,
			code: contents,
			prevCode: code,
		});

		//TODO: should be using a trigger for this
		const event = new CustomEvent("fileChange", {
			bubbles: true,
			detail: {
				name, id, filePath: filename, code: contents,
				service: service ? service.name : undefined
			},
		});
		document.body.dispatchEvent(event);
	};

	return (editor, changeObj) => {
		//console.log('editor changed');
		//console.log(changeObj);
		changeThis(editor.getValue());
	};
};

/*!
    localForage -- Offline Storage, Improved
    Version 1.7.4
    https://localforage.github.io/localForage
    (c) 2013-2017 Mozilla, Apache License 2.0
*/
!function(a){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=a();else if("function"==typeof define&&define.amd)define([],a);else {var b;b="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,b.localforage=a();}}(function(){return function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);var j=new Error("Cannot find module '"+g+"'");throw j.code="MODULE_NOT_FOUND",j}var k=c[g]={exports:{}};b[g][0].call(k.exports,function(a){var c=b[g][1][a];return e(c||a)},k,k.exports,a,b,c,d);}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b,c){(function(a){function c(){k=!0;for(var a,b,c=l.length;c;){for(b=l,l=[],a=-1;++a<c;)b[a]();c=l.length;}k=!1;}function d(a){1!==l.push(a)||k||e();}var e,f=a.MutationObserver||a.WebKitMutationObserver;if(f){var g=0,h=new f(c),i=a.document.createTextNode("");h.observe(i,{characterData:!0}),e=function(){i.data=g=++g%2;};}else if(a.setImmediate||void 0===a.MessageChannel)e="document"in a&&"onreadystatechange"in a.document.createElement("script")?function(){var b=a.document.createElement("script");b.onreadystatechange=function(){c(),b.onreadystatechange=null,b.parentNode.removeChild(b),b=null;},a.document.documentElement.appendChild(b);}:function(){setTimeout(c,0);};else {var j=new a.MessageChannel;j.port1.onmessage=c,e=function(){j.port2.postMessage(0);};}var k,l=[];b.exports=d;}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{});},{}],2:[function(a,b,c){function d(){}function e(a){if("function"!=typeof a)throw new TypeError("resolver must be a function");this.state=s,this.queue=[],this.outcome=void 0,a!==d&&i(this,a);}function f(a,b,c){this.promise=a,"function"==typeof b&&(this.onFulfilled=b,this.callFulfilled=this.otherCallFulfilled),"function"==typeof c&&(this.onRejected=c,this.callRejected=this.otherCallRejected);}function g(a,b,c){o(function(){var d;try{d=b(c);}catch(b){return p.reject(a,b)}d===a?p.reject(a,new TypeError("Cannot resolve promise with itself")):p.resolve(a,d);});}function h(a){var b=a&&a.then;if(a&&("object"==typeof a||"function"==typeof a)&&"function"==typeof b)return function(){b.apply(a,arguments);}}function i(a,b){function c(b){f||(f=!0,p.reject(a,b));}function d(b){f||(f=!0,p.resolve(a,b));}function e(){b(d,c);}var f=!1,g=j(e);"error"===g.status&&c(g.value);}function j(a,b){var c={};try{c.value=a(b),c.status="success";}catch(a){c.status="error",c.value=a;}return c}function k(a){return a instanceof this?a:p.resolve(new this(d),a)}function l(a){var b=new this(d);return p.reject(b,a)}function m(a){function b(a,b){function d(a){g[b]=a,++h!==e||f||(f=!0,p.resolve(j,g));}c.resolve(a).then(d,function(a){f||(f=!0,p.reject(j,a));});}var c=this;if("[object Array]"!==Object.prototype.toString.call(a))return this.reject(new TypeError("must be an array"));var e=a.length,f=!1;if(!e)return this.resolve([]);for(var g=new Array(e),h=0,i=-1,j=new this(d);++i<e;)b(a[i],i);return j}function n(a){function b(a){c.resolve(a).then(function(a){f||(f=!0,p.resolve(h,a));},function(a){f||(f=!0,p.reject(h,a));});}var c=this;if("[object Array]"!==Object.prototype.toString.call(a))return this.reject(new TypeError("must be an array"));var e=a.length,f=!1;if(!e)return this.resolve([]);for(var g=-1,h=new this(d);++g<e;)b(a[g]);return h}var o=a(1),p={},q=["REJECTED"],r=["FULFILLED"],s=["PENDING"];b.exports=e,e.prototype.catch=function(a){return this.then(null,a)},e.prototype.then=function(a,b){if("function"!=typeof a&&this.state===r||"function"!=typeof b&&this.state===q)return this;var c=new this.constructor(d);if(this.state!==s){g(c,this.state===r?a:b,this.outcome);}else this.queue.push(new f(c,a,b));return c},f.prototype.callFulfilled=function(a){p.resolve(this.promise,a);},f.prototype.otherCallFulfilled=function(a){g(this.promise,this.onFulfilled,a);},f.prototype.callRejected=function(a){p.reject(this.promise,a);},f.prototype.otherCallRejected=function(a){g(this.promise,this.onRejected,a);},p.resolve=function(a,b){var c=j(h,b);if("error"===c.status)return p.reject(a,c.value);var d=c.value;if(d)i(a,d);else {a.state=r,a.outcome=b;for(var e=-1,f=a.queue.length;++e<f;)a.queue[e].callFulfilled(b);}return a},p.reject=function(a,b){a.state=q,a.outcome=b;for(var c=-1,d=a.queue.length;++c<d;)a.queue[c].callRejected(b);return a},e.resolve=k,e.reject=l,e.all=m,e.race=n;},{1:1}],3:[function(a,b,c){(function(b){"function"!=typeof b.Promise&&(b.Promise=a(2));}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{});},{2:2}],4:[function(a,b,c){function d(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function e(){try{if("undefined"!=typeof indexedDB)return indexedDB;if("undefined"!=typeof webkitIndexedDB)return webkitIndexedDB;if("undefined"!=typeof mozIndexedDB)return mozIndexedDB;if("undefined"!=typeof OIndexedDB)return OIndexedDB;if("undefined"!=typeof msIndexedDB)return msIndexedDB}catch(a){return}}function f(){try{if(!ua||!ua.open)return !1;var a="undefined"!=typeof openDatabase&&/(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent)&&!/Chrome/.test(navigator.userAgent)&&!/BlackBerry/.test(navigator.platform),b="function"==typeof fetch&&-1!==fetch.toString().indexOf("[native code");return (!a||b)&&"undefined"!=typeof indexedDB&&"undefined"!=typeof IDBKeyRange}catch(a){return !1}}function g(a,b){a=a||[],b=b||{};try{return new Blob(a,b)}catch(f){if("TypeError"!==f.name)throw f;for(var c="undefined"!=typeof BlobBuilder?BlobBuilder:"undefined"!=typeof MSBlobBuilder?MSBlobBuilder:"undefined"!=typeof MozBlobBuilder?MozBlobBuilder:WebKitBlobBuilder,d=new c,e=0;e<a.length;e+=1)d.append(a[e]);return d.getBlob(b.type)}}function h(a,b){b&&a.then(function(a){b(null,a);},function(a){b(a);});}function i(a,b,c){"function"==typeof b&&a.then(b),"function"==typeof c&&a.catch(c);}function j(a){return "string"!=typeof a&&(console.warn(a+" used as a key, but it is not a string."),a=String(a)),a}function k(){if(arguments.length&&"function"==typeof arguments[arguments.length-1])return arguments[arguments.length-1]}function l(a){for(var b=a.length,c=new ArrayBuffer(b),d=new Uint8Array(c),e=0;e<b;e++)d[e]=a.charCodeAt(e);return c}function m(a){return new va(function(b){var c=a.transaction(wa,Ba),d=g([""]);c.objectStore(wa).put(d,"key"),c.onabort=function(a){a.preventDefault(),a.stopPropagation(),b(!1);},c.oncomplete=function(){var a=navigator.userAgent.match(/Chrome\/(\d+)/),c=navigator.userAgent.match(/Edge\//);b(c||!a||parseInt(a[1],10)>=43);};}).catch(function(){return !1})}function n(a){return "boolean"==typeof xa?va.resolve(xa):m(a).then(function(a){return xa=a})}function o(a){var b=ya[a.name],c={};c.promise=new va(function(a,b){c.resolve=a,c.reject=b;}),b.deferredOperations.push(c),b.dbReady?b.dbReady=b.dbReady.then(function(){return c.promise}):b.dbReady=c.promise;}function p(a){var b=ya[a.name],c=b.deferredOperations.pop();if(c)return c.resolve(),c.promise}function q(a,b){var c=ya[a.name],d=c.deferredOperations.pop();if(d)return d.reject(b),d.promise}function r(a,b){return new va(function(c,d){if(ya[a.name]=ya[a.name]||B(),a.db){if(!b)return c(a.db);o(a),a.db.close();}var e=[a.name];b&&e.push(a.version);var f=ua.open.apply(ua,e);b&&(f.onupgradeneeded=function(b){var c=f.result;try{c.createObjectStore(a.storeName),b.oldVersion<=1&&c.createObjectStore(wa);}catch(c){if("ConstraintError"!==c.name)throw c;console.warn('The database "'+a.name+'" has been upgraded from version '+b.oldVersion+" to version "+b.newVersion+', but the storage "'+a.storeName+'" already exists.');}}),f.onerror=function(a){a.preventDefault(),d(f.error);},f.onsuccess=function(){c(f.result),p(a);};})}function s(a){return r(a,!1)}function t(a){return r(a,!0)}function u(a,b){if(!a.db)return !0;var c=!a.db.objectStoreNames.contains(a.storeName),d=a.version<a.db.version,e=a.version>a.db.version;if(d&&(a.version!==b&&console.warn('The database "'+a.name+"\" can't be downgraded from version "+a.db.version+" to version "+a.version+"."),a.version=a.db.version),e||c){if(c){var f=a.db.version+1;f>a.version&&(a.version=f);}return !0}return !1}function v(a){return new va(function(b,c){var d=new FileReader;d.onerror=c,d.onloadend=function(c){var d=btoa(c.target.result||"");b({__local_forage_encoded_blob:!0,data:d,type:a.type});},d.readAsBinaryString(a);})}function w(a){return g([l(atob(a.data))],{type:a.type})}function x(a){return a&&a.__local_forage_encoded_blob}function y(a){var b=this,c=b._initReady().then(function(){var a=ya[b._dbInfo.name];if(a&&a.dbReady)return a.dbReady});return i(c,a,a),c}function z(a){o(a);for(var b=ya[a.name],c=b.forages,d=0;d<c.length;d++){var e=c[d];e._dbInfo.db&&(e._dbInfo.db.close(),e._dbInfo.db=null);}return a.db=null,s(a).then(function(b){return a.db=b,u(a)?t(a):b}).then(function(d){a.db=b.db=d;for(var e=0;e<c.length;e++)c[e]._dbInfo.db=d;}).catch(function(b){throw q(a,b),b})}function A(a,b,c,d){void 0===d&&(d=1);try{var e=a.db.transaction(a.storeName,b);c(null,e);}catch(e){if(d>0&&(!a.db||"InvalidStateError"===e.name||"NotFoundError"===e.name))return va.resolve().then(function(){if(!a.db||"NotFoundError"===e.name&&!a.db.objectStoreNames.contains(a.storeName)&&a.version<=a.db.version)return a.db&&(a.version=a.db.version+1),t(a)}).then(function(){return z(a).then(function(){A(a,b,c,d-1);})}).catch(c);c(e);}}function B(){return {forages:[],db:null,dbReady:null,deferredOperations:[]}}function C(a){function b(){return va.resolve()}var c=this,d={db:null};if(a)for(var e in a)d[e]=a[e];var f=ya[d.name];f||(f=B(),ya[d.name]=f),f.forages.push(c),c._initReady||(c._initReady=c.ready,c.ready=y);for(var g=[],h=0;h<f.forages.length;h++){var i=f.forages[h];i!==c&&g.push(i._initReady().catch(b));}var j=f.forages.slice(0);return va.all(g).then(function(){return d.db=f.db,s(d)}).then(function(a){return d.db=a,u(d,c._defaultConfig.version)?t(d):a}).then(function(a){d.db=f.db=a,c._dbInfo=d;for(var b=0;b<j.length;b++){var e=j[b];e!==c&&(e._dbInfo.db=d.db,e._dbInfo.version=d.version);}})}function D(a,b){var c=this;a=j(a);var d=new va(function(b,d){c.ready().then(function(){A(c._dbInfo,Aa,function(e,f){if(e)return d(e);try{var g=f.objectStore(c._dbInfo.storeName),h=g.get(a);h.onsuccess=function(){var a=h.result;void 0===a&&(a=null),x(a)&&(a=w(a)),b(a);},h.onerror=function(){d(h.error);};}catch(a){d(a);}});}).catch(d);});return h(d,b),d}function E(a,b){var c=this,d=new va(function(b,d){c.ready().then(function(){A(c._dbInfo,Aa,function(e,f){if(e)return d(e);try{var g=f.objectStore(c._dbInfo.storeName),h=g.openCursor(),i=1;h.onsuccess=function(){var c=h.result;if(c){var d=c.value;x(d)&&(d=w(d));var e=a(d,c.key,i++);void 0!==e?b(e):c.continue();}else b();},h.onerror=function(){d(h.error);};}catch(a){d(a);}});}).catch(d);});return h(d,b),d}function F(a,b,c){var d=this;a=j(a);var e=new va(function(c,e){var f;d.ready().then(function(){return f=d._dbInfo,"[object Blob]"===za.call(b)?n(f.db).then(function(a){return a?b:v(b)}):b}).then(function(b){A(d._dbInfo,Ba,function(f,g){if(f)return e(f);try{var h=g.objectStore(d._dbInfo.storeName);null===b&&(b=void 0);var i=h.put(b,a);g.oncomplete=function(){void 0===b&&(b=null),c(b);},g.onabort=g.onerror=function(){var a=i.error?i.error:i.transaction.error;e(a);};}catch(a){e(a);}});}).catch(e);});return h(e,c),e}function G(a,b){var c=this;a=j(a);var d=new va(function(b,d){c.ready().then(function(){A(c._dbInfo,Ba,function(e,f){if(e)return d(e);try{var g=f.objectStore(c._dbInfo.storeName),h=g.delete(a);f.oncomplete=function(){b();},f.onerror=function(){d(h.error);},f.onabort=function(){var a=h.error?h.error:h.transaction.error;d(a);};}catch(a){d(a);}});}).catch(d);});return h(d,b),d}function H(a){var b=this,c=new va(function(a,c){b.ready().then(function(){A(b._dbInfo,Ba,function(d,e){if(d)return c(d);try{var f=e.objectStore(b._dbInfo.storeName),g=f.clear();e.oncomplete=function(){a();},e.onabort=e.onerror=function(){var a=g.error?g.error:g.transaction.error;c(a);};}catch(a){c(a);}});}).catch(c);});return h(c,a),c}function I(a){var b=this,c=new va(function(a,c){b.ready().then(function(){A(b._dbInfo,Aa,function(d,e){if(d)return c(d);try{var f=e.objectStore(b._dbInfo.storeName),g=f.count();g.onsuccess=function(){a(g.result);},g.onerror=function(){c(g.error);};}catch(a){c(a);}});}).catch(c);});return h(c,a),c}function J(a,b){var c=this,d=new va(function(b,d){if(a<0)return void b(null);c.ready().then(function(){A(c._dbInfo,Aa,function(e,f){if(e)return d(e);try{var g=f.objectStore(c._dbInfo.storeName),h=!1,i=g.openKeyCursor();i.onsuccess=function(){var c=i.result;if(!c)return void b(null);0===a?b(c.key):h?b(c.key):(h=!0,c.advance(a));},i.onerror=function(){d(i.error);};}catch(a){d(a);}});}).catch(d);});return h(d,b),d}function K(a){var b=this,c=new va(function(a,c){b.ready().then(function(){A(b._dbInfo,Aa,function(d,e){if(d)return c(d);try{var f=e.objectStore(b._dbInfo.storeName),g=f.openKeyCursor(),h=[];g.onsuccess=function(){var b=g.result;if(!b)return void a(h);h.push(b.key),b.continue();},g.onerror=function(){c(g.error);};}catch(a){c(a);}});}).catch(c);});return h(c,a),c}function L(a,b){b=k.apply(this,arguments);var c=this.config();a="function"!=typeof a&&a||{},a.name||(a.name=a.name||c.name,a.storeName=a.storeName||c.storeName);var d,e=this;if(a.name){var f=a.name===c.name&&e._dbInfo.db,g=f?va.resolve(e._dbInfo.db):s(a).then(function(b){var c=ya[a.name],d=c.forages;c.db=b;for(var e=0;e<d.length;e++)d[e]._dbInfo.db=b;return b});d=a.storeName?g.then(function(b){if(b.objectStoreNames.contains(a.storeName)){var c=b.version+1;o(a);var d=ya[a.name],e=d.forages;b.close();for(var f=0;f<e.length;f++){var g=e[f];g._dbInfo.db=null,g._dbInfo.version=c;}return new va(function(b,d){var e=ua.open(a.name,c);e.onerror=function(a){e.result.close(),d(a);},e.onupgradeneeded=function(){e.result.deleteObjectStore(a.storeName);},e.onsuccess=function(){var a=e.result;a.close(),b(a);};}).then(function(a){d.db=a;for(var b=0;b<e.length;b++){var c=e[b];c._dbInfo.db=a,p(c._dbInfo);}}).catch(function(b){throw (q(a,b)||va.resolve()).catch(function(){}),b})}}):g.then(function(b){o(a);var c=ya[a.name],d=c.forages;b.close();for(var e=0;e<d.length;e++){d[e]._dbInfo.db=null;}return new va(function(b,c){var d=ua.deleteDatabase(a.name);d.onerror=d.onblocked=function(a){var b=d.result;b&&b.close(),c(a);},d.onsuccess=function(){var a=d.result;a&&a.close(),b(a);};}).then(function(a){c.db=a;for(var b=0;b<d.length;b++)p(d[b]._dbInfo);}).catch(function(b){throw (q(a,b)||va.resolve()).catch(function(){}),b})});}else d=va.reject("Invalid arguments");return h(d,b),d}function M(){return "function"==typeof openDatabase}function N(a){var b,c,d,e,f,g=.75*a.length,h=a.length,i=0;"="===a[a.length-1]&&(g--,"="===a[a.length-2]&&g--);var j=new ArrayBuffer(g),k=new Uint8Array(j);for(b=0;b<h;b+=4)c=Da.indexOf(a[b]),d=Da.indexOf(a[b+1]),e=Da.indexOf(a[b+2]),f=Da.indexOf(a[b+3]),k[i++]=c<<2|d>>4,k[i++]=(15&d)<<4|e>>2,k[i++]=(3&e)<<6|63&f;return j}function O(a){var b,c=new Uint8Array(a),d="";for(b=0;b<c.length;b+=3)d+=Da[c[b]>>2],d+=Da[(3&c[b])<<4|c[b+1]>>4],d+=Da[(15&c[b+1])<<2|c[b+2]>>6],d+=Da[63&c[b+2]];return c.length%3==2?d=d.substring(0,d.length-1)+"=":c.length%3==1&&(d=d.substring(0,d.length-2)+"=="),d}function P(a,b){var c="";if(a&&(c=Ua.call(a)),a&&("[object ArrayBuffer]"===c||a.buffer&&"[object ArrayBuffer]"===Ua.call(a.buffer))){var d,e=Ga;a instanceof ArrayBuffer?(d=a,e+=Ia):(d=a.buffer,"[object Int8Array]"===c?e+=Ka:"[object Uint8Array]"===c?e+=La:"[object Uint8ClampedArray]"===c?e+=Ma:"[object Int16Array]"===c?e+=Na:"[object Uint16Array]"===c?e+=Pa:"[object Int32Array]"===c?e+=Oa:"[object Uint32Array]"===c?e+=Qa:"[object Float32Array]"===c?e+=Ra:"[object Float64Array]"===c?e+=Sa:b(new Error("Failed to get type for BinaryArray"))),b(e+O(d));}else if("[object Blob]"===c){var f=new FileReader;f.onload=function(){var c=Ea+a.type+"~"+O(this.result);b(Ga+Ja+c);},f.readAsArrayBuffer(a);}else try{b(JSON.stringify(a));}catch(c){console.error("Couldn't convert value into a JSON string: ",a),b(null,c);}}function Q(a){if(a.substring(0,Ha)!==Ga)return JSON.parse(a);var b,c=a.substring(Ta),d=a.substring(Ha,Ta);if(d===Ja&&Fa.test(c)){var e=c.match(Fa);b=e[1],c=c.substring(e[0].length);}var f=N(c);switch(d){case Ia:return f;case Ja:return g([f],{type:b});case Ka:return new Int8Array(f);case La:return new Uint8Array(f);case Ma:return new Uint8ClampedArray(f);case Na:return new Int16Array(f);case Pa:return new Uint16Array(f);case Oa:return new Int32Array(f);case Qa:return new Uint32Array(f);case Ra:return new Float32Array(f);case Sa:return new Float64Array(f);default:throw new Error("Unkown type: "+d)}}function R(a,b,c,d){a.executeSql("CREATE TABLE IF NOT EXISTS "+b.storeName+" (id INTEGER PRIMARY KEY, key unique, value)",[],c,d);}function S(a){var b=this,c={db:null};if(a)for(var d in a)c[d]="string"!=typeof a[d]?a[d].toString():a[d];var e=new va(function(a,d){try{c.db=openDatabase(c.name,String(c.version),c.description,c.size);}catch(a){return d(a)}c.db.transaction(function(e){R(e,c,function(){b._dbInfo=c,a();},function(a,b){d(b);});},d);});return c.serializer=Va,e}function T(a,b,c,d,e,f){a.executeSql(c,d,e,function(a,g){g.code===g.SYNTAX_ERR?a.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name = ?",[b.storeName],function(a,h){h.rows.length?f(a,g):R(a,b,function(){a.executeSql(c,d,e,f);},f);},f):f(a,g);},f);}function U(a,b){var c=this;a=j(a);var d=new va(function(b,d){c.ready().then(function(){var e=c._dbInfo;e.db.transaction(function(c){T(c,e,"SELECT * FROM "+e.storeName+" WHERE key = ? LIMIT 1",[a],function(a,c){var d=c.rows.length?c.rows.item(0).value:null;d&&(d=e.serializer.deserialize(d)),b(d);},function(a,b){d(b);});});}).catch(d);});return h(d,b),d}function V(a,b){var c=this,d=new va(function(b,d){c.ready().then(function(){var e=c._dbInfo;e.db.transaction(function(c){T(c,e,"SELECT * FROM "+e.storeName,[],function(c,d){for(var f=d.rows,g=f.length,h=0;h<g;h++){var i=f.item(h),j=i.value;if(j&&(j=e.serializer.deserialize(j)),void 0!==(j=a(j,i.key,h+1)))return void b(j)}b();},function(a,b){d(b);});});}).catch(d);});return h(d,b),d}function W(a,b,c,d){var e=this;a=j(a);var f=new va(function(f,g){e.ready().then(function(){void 0===b&&(b=null);var h=b,i=e._dbInfo;i.serializer.serialize(b,function(b,j){j?g(j):i.db.transaction(function(c){T(c,i,"INSERT OR REPLACE INTO "+i.storeName+" (key, value) VALUES (?, ?)",[a,b],function(){f(h);},function(a,b){g(b);});},function(b){if(b.code===b.QUOTA_ERR){if(d>0)return void f(W.apply(e,[a,h,c,d-1]));g(b);}});});}).catch(g);});return h(f,c),f}function X(a,b,c){return W.apply(this,[a,b,c,1])}function Y(a,b){var c=this;a=j(a);var d=new va(function(b,d){c.ready().then(function(){var e=c._dbInfo;e.db.transaction(function(c){T(c,e,"DELETE FROM "+e.storeName+" WHERE key = ?",[a],function(){b();},function(a,b){d(b);});});}).catch(d);});return h(d,b),d}function Z(a){var b=this,c=new va(function(a,c){b.ready().then(function(){var d=b._dbInfo;d.db.transaction(function(b){T(b,d,"DELETE FROM "+d.storeName,[],function(){a();},function(a,b){c(b);});});}).catch(c);});return h(c,a),c}function $(a){var b=this,c=new va(function(a,c){b.ready().then(function(){var d=b._dbInfo;d.db.transaction(function(b){T(b,d,"SELECT COUNT(key) as c FROM "+d.storeName,[],function(b,c){var d=c.rows.item(0).c;a(d);},function(a,b){c(b);});});}).catch(c);});return h(c,a),c}function _(a,b){var c=this,d=new va(function(b,d){c.ready().then(function(){var e=c._dbInfo;e.db.transaction(function(c){T(c,e,"SELECT key FROM "+e.storeName+" WHERE id = ? LIMIT 1",[a+1],function(a,c){var d=c.rows.length?c.rows.item(0).key:null;b(d);},function(a,b){d(b);});});}).catch(d);});return h(d,b),d}function aa(a){var b=this,c=new va(function(a,c){b.ready().then(function(){var d=b._dbInfo;d.db.transaction(function(b){T(b,d,"SELECT key FROM "+d.storeName,[],function(b,c){for(var d=[],e=0;e<c.rows.length;e++)d.push(c.rows.item(e).key);a(d);},function(a,b){c(b);});});}).catch(c);});return h(c,a),c}function ba(a){return new va(function(b,c){a.transaction(function(d){d.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name <> '__WebKitDatabaseInfoTable__'",[],function(c,d){for(var e=[],f=0;f<d.rows.length;f++)e.push(d.rows.item(f).name);b({db:a,storeNames:e});},function(a,b){c(b);});},function(a){c(a);});})}function ca(a,b){b=k.apply(this,arguments);var c=this.config();a="function"!=typeof a&&a||{},a.name||(a.name=a.name||c.name,a.storeName=a.storeName||c.storeName);var d,e=this;return d=a.name?new va(function(b){var d;d=a.name===c.name?e._dbInfo.db:openDatabase(a.name,"","",0),b(a.storeName?{db:d,storeNames:[a.storeName]}:ba(d));}).then(function(a){return new va(function(b,c){a.db.transaction(function(d){function e(a){return new va(function(b,c){d.executeSql("DROP TABLE IF EXISTS "+a,[],function(){b();},function(a,b){c(b);});})}for(var f=[],g=0,h=a.storeNames.length;g<h;g++)f.push(e(a.storeNames[g]));va.all(f).then(function(){b();}).catch(function(a){c(a);});},function(a){c(a);});})}):va.reject("Invalid arguments"),h(d,b),d}function da(){try{return "undefined"!=typeof localStorage&&"setItem"in localStorage&&!!localStorage.setItem}catch(a){return !1}}function ea(a,b){var c=a.name+"/";return a.storeName!==b.storeName&&(c+=a.storeName+"/"),c}function fa(){var a="_localforage_support_test";try{return localStorage.setItem(a,!0),localStorage.removeItem(a),!1}catch(a){return !0}}function ga(){return !fa()||localStorage.length>0}function ha(a){var b=this,c={};if(a)for(var d in a)c[d]=a[d];return c.keyPrefix=ea(a,b._defaultConfig),ga()?(b._dbInfo=c,c.serializer=Va,va.resolve()):va.reject()}function ia(a){var b=this,c=b.ready().then(function(){for(var a=b._dbInfo.keyPrefix,c=localStorage.length-1;c>=0;c--){var d=localStorage.key(c);0===d.indexOf(a)&&localStorage.removeItem(d);}});return h(c,a),c}function ja(a,b){var c=this;a=j(a);var d=c.ready().then(function(){var b=c._dbInfo,d=localStorage.getItem(b.keyPrefix+a);return d&&(d=b.serializer.deserialize(d)),d});return h(d,b),d}function ka(a,b){var c=this,d=c.ready().then(function(){for(var b=c._dbInfo,d=b.keyPrefix,e=d.length,f=localStorage.length,g=1,h=0;h<f;h++){var i=localStorage.key(h);if(0===i.indexOf(d)){var j=localStorage.getItem(i);if(j&&(j=b.serializer.deserialize(j)),void 0!==(j=a(j,i.substring(e),g++)))return j}}});return h(d,b),d}function la(a,b){var c=this,d=c.ready().then(function(){var b,d=c._dbInfo;try{b=localStorage.key(a);}catch(a){b=null;}return b&&(b=b.substring(d.keyPrefix.length)),b});return h(d,b),d}function ma(a){var b=this,c=b.ready().then(function(){for(var a=b._dbInfo,c=localStorage.length,d=[],e=0;e<c;e++){var f=localStorage.key(e);0===f.indexOf(a.keyPrefix)&&d.push(f.substring(a.keyPrefix.length));}return d});return h(c,a),c}function na(a){var b=this,c=b.keys().then(function(a){return a.length});return h(c,a),c}function oa(a,b){var c=this;a=j(a);var d=c.ready().then(function(){var b=c._dbInfo;localStorage.removeItem(b.keyPrefix+a);});return h(d,b),d}function pa(a,b,c){var d=this;a=j(a);var e=d.ready().then(function(){void 0===b&&(b=null);var c=b;return new va(function(e,f){var g=d._dbInfo;g.serializer.serialize(b,function(b,d){if(d)f(d);else try{localStorage.setItem(g.keyPrefix+a,b),e(c);}catch(a){"QuotaExceededError"!==a.name&&"NS_ERROR_DOM_QUOTA_REACHED"!==a.name||f(a),f(a);}});})});return h(e,c),e}function qa(a,b){if(b=k.apply(this,arguments),a="function"!=typeof a&&a||{},!a.name){var c=this.config();a.name=a.name||c.name,a.storeName=a.storeName||c.storeName;}var d,e=this;return d=a.name?new va(function(b){b(a.storeName?ea(a,e._defaultConfig):a.name+"/");}).then(function(a){for(var b=localStorage.length-1;b>=0;b--){var c=localStorage.key(b);0===c.indexOf(a)&&localStorage.removeItem(c);}}):va.reject("Invalid arguments"),h(d,b),d}function ra(a,b){a[b]=function(){var c=arguments;return a.ready().then(function(){return a[b].apply(a,c)})};}function sa(){for(var a=1;a<arguments.length;a++){var b=arguments[a];if(b)for(var c in b)b.hasOwnProperty(c)&&($a(b[c])?arguments[0][c]=b[c].slice():arguments[0][c]=b[c]);}return arguments[0]}var ta="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&"function"==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a},ua=e();"undefined"==typeof Promise&&a(3);var va=Promise,wa="local-forage-detect-blob-support",xa=void 0,ya={},za=Object.prototype.toString,Aa="readonly",Ba="readwrite",Ca={_driver:"asyncStorage",_initStorage:C,_support:f(),iterate:E,getItem:D,setItem:F,removeItem:G,clear:H,length:I,key:J,keys:K,dropInstance:L},Da="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",Ea="~~local_forage_type~",Fa=/^~~local_forage_type~([^~]+)~/,Ga="__lfsc__:",Ha=Ga.length,Ia="arbf",Ja="blob",Ka="si08",La="ui08",Ma="uic8",Na="si16",Oa="si32",Pa="ur16",Qa="ui32",Ra="fl32",Sa="fl64",Ta=Ha+Ia.length,Ua=Object.prototype.toString,Va={serialize:P,deserialize:Q,stringToBuffer:N,bufferToString:O},Wa={_driver:"webSQLStorage",_initStorage:S,_support:M(),iterate:V,getItem:U,setItem:X,removeItem:Y,clear:Z,length:$,key:_,keys:aa,dropInstance:ca},Xa={_driver:"localStorageWrapper",_initStorage:ha,_support:da(),iterate:ka,getItem:ja,setItem:pa,removeItem:oa,clear:ia,length:na,key:la,keys:ma,dropInstance:qa},Ya=function(a,b){return a===b||"number"==typeof a&&"number"==typeof b&&isNaN(a)&&isNaN(b)},Za=function(a,b){for(var c=a.length,d=0;d<c;){if(Ya(a[d],b))return !0;d++;}return !1},$a=Array.isArray||function(a){return "[object Array]"===Object.prototype.toString.call(a)},_a={},ab={},bb={INDEXEDDB:Ca,WEBSQL:Wa,LOCALSTORAGE:Xa},cb=[bb.INDEXEDDB._driver,bb.WEBSQL._driver,bb.LOCALSTORAGE._driver],db=["dropInstance"],eb=["clear","getItem","iterate","key","keys","length","removeItem","setItem"].concat(db),fb={description:"",driver:cb.slice(),name:"localforage",size:4980736,storeName:"keyvaluepairs",version:1},gb=function(){function a(b){d(this,a);for(var c in bb)if(bb.hasOwnProperty(c)){var e=bb[c],f=e._driver;this[c]=f,_a[f]||this.defineDriver(e);}this._defaultConfig=sa({},fb),this._config=sa({},this._defaultConfig,b),this._driverSet=null,this._initDriver=null,this._ready=!1,this._dbInfo=null,this._wrapLibraryMethodsWithReady(),this.setDriver(this._config.driver).catch(function(){});}return a.prototype.config=function(a){if("object"===(void 0===a?"undefined":ta(a))){if(this._ready)return new Error("Can't call config() after localforage has been used.");for(var b in a){if("storeName"===b&&(a[b]=a[b].replace(/\W/g,"_")),"version"===b&&"number"!=typeof a[b])return new Error("Database version must be a number.");this._config[b]=a[b];}return !("driver"in a&&a.driver)||this.setDriver(this._config.driver)}return "string"==typeof a?this._config[a]:this._config},a.prototype.defineDriver=function(a,b,c){var d=new va(function(b,c){try{var d=a._driver,e=new Error("Custom driver not compliant; see https://mozilla.github.io/localForage/#definedriver");if(!a._driver)return void c(e);for(var f=eb.concat("_initStorage"),g=0,i=f.length;g<i;g++){var j=f[g];if((!Za(db,j)||a[j])&&"function"!=typeof a[j])return void c(e)}(function(){for(var b=function(a){return function(){var b=new Error("Method "+a+" is not implemented by the current driver"),c=va.reject(b);return h(c,arguments[arguments.length-1]),c}},c=0,d=db.length;c<d;c++){var e=db[c];a[e]||(a[e]=b(e));}})();var k=function(c){_a[d]&&console.info("Redefining LocalForage driver: "+d),_a[d]=a,ab[d]=c,b();};"_support"in a?a._support&&"function"==typeof a._support?a._support().then(k,c):k(!!a._support):k(!0);}catch(a){c(a);}});return i(d,b,c),d},a.prototype.driver=function(){return this._driver||null},a.prototype.getDriver=function(a,b,c){var d=_a[a]?va.resolve(_a[a]):va.reject(new Error("Driver not found."));return i(d,b,c),d},a.prototype.getSerializer=function(a){var b=va.resolve(Va);return i(b,a),b},a.prototype.ready=function(a){var b=this,c=b._driverSet.then(function(){return null===b._ready&&(b._ready=b._initDriver()),b._ready});return i(c,a,a),c},a.prototype.setDriver=function(a,b,c){function d(){g._config.driver=g.driver();}function e(a){return g._extend(a),d(),g._ready=g._initStorage(g._config),g._ready}function f(a){return function(){function b(){for(;c<a.length;){var f=a[c];return c++,g._dbInfo=null,g._ready=null,g.getDriver(f).then(e).catch(b)}d();var h=new Error("No available storage method found.");return g._driverSet=va.reject(h),g._driverSet}var c=0;return b()}}var g=this;$a(a)||(a=[a]);var h=this._getSupportedDrivers(a),j=null!==this._driverSet?this._driverSet.catch(function(){return va.resolve()}):va.resolve();return this._driverSet=j.then(function(){var a=h[0];return g._dbInfo=null,g._ready=null,g.getDriver(a).then(function(a){g._driver=a._driver,d(),g._wrapLibraryMethodsWithReady(),g._initDriver=f(h);})}).catch(function(){d();var a=new Error("No available storage method found.");return g._driverSet=va.reject(a),g._driverSet}),i(this._driverSet,b,c),this._driverSet},a.prototype.supports=function(a){return !!ab[a]},a.prototype._extend=function(a){sa(this,a);},a.prototype._getSupportedDrivers=function(a){for(var b=[],c=0,d=a.length;c<d;c++){var e=a[c];this.supports(e)&&b.push(e);}return b},a.prototype._wrapLibraryMethodsWithReady=function(){for(var a=0,b=eb.length;a<b;a++)ra(this,eb[a]);},a.prototype.createInstance=function(b){return new a(b)},a}(),hb=new gb;b.exports=hb;},{3:3}]},{},[4])(4)});

const getFilePath = getFilePath$1(getCurrentService);

function _Editor(callback) {
	//TODO: ChangeHandler and CursorActivityHandler should come from triggers
	//

	//debugger; //enable this debugger to see what UI looks like at this point

	// call editor tabs once early so event handlers are attached
	const tabs = EditorTabs();
	const status = StatusBar();
	const editor = InlineEditor(ChangeHandler, EditorTabs, CursorActivityHandler);

	const context = {
		getCurrentFile, // << access within file instead
		getFilePath, // << access within file instead
		showMenu: () => window.showMenu,
		switchEditor: (x) => switchEditor(x, { editor, context }),
		messageEditor: (x) => messageEditor(x,{ editor, context }),
		systemDocsErrors: [],
		tabs,
		status
	};
	attachEvents(events, context);
}


const Editor$1 = _Editor;
const isRunningAsModule = document.location.href.includes("_/modules");

if(!isRunningAsModule){
	const base = document.createElement('base');
	base.href = '../../';
	document.getElementsByTagName('head')[0].appendChild(base);
}

const head=document.getElementsByTagName("head")[0];

const cssnode = document.createElement('link');
cssnode.type = 'text/css';
cssnode.rel = 'stylesheet';
cssnode.href = './editor.css';
head.appendChild(cssnode);



window.showMenu = (args) => {
// 	console.log('show menu');
// 	console.log(args);
// 	console.log(location)
// 	window.top.postMessage({ type: 'showMenu', ...args }, location);
};
Editor$1();

const currentServiceId = localStorage.getItem('lastService');
const serviceUrl = `/service/read/${currentServiceId}`;
const { result: [currentService] } = await fetch(serviceUrl).then(x => x.json());

const service = currentService;
service.state.selected = {
	name: service.state.selected.split('/').pop(),
	path: `${service.name}/${service.state.selected}`
};
console.log(service);
// const service = {
// 	name: 'crosshj/fake',
// 	state: {
// 		selected: {
// 			// line: 2, << causes focus to be stolen
// 			// column: 0, << causes focus to be stolen
// 			id: '1',
// 			name: 'editor.js',
// 			filename: 'editor.js',
// 			path: '/crosshj/fiug-beta/editor/editor.js',
// 		},
// 		opened: [
// 			{ name: 'editor.js', order: 0 },
// 			{ name: 'index.colors.css', order: 1 },
// 			{ name: '404.html', order: 2 },
// 			{ name: 'index.html', order: 3 }
// 		],
// 		changed: ['index.html']
// 	},
// 	code: [{
// 		name: 'index.colors.css',
// 		code: '/crosshj/fiug-beta/index.colors.css',
// 		path: '/crosshj/fiug-beta/index.colors.css'
// 	},{
// 		name: '404.html',
// 		code: '/crosshj/fiug-beta/404.html',
// 		path: '/crosshj/fiug-beta/404.html'
// 	},{
// 		name: 'index.html',
// 		code: '/crosshj/fiug-beta/index.html',
// 		path: '/crosshj/fiug-beta/index.html',
// 	},{
// 		name: 'editor.js',
// 		code: '/crosshj/fiug-beta/editor/editor.js',
// 		path: '/crosshj/fiug-beta/editor/editor.js'
// 	}],
// 	tree: {
// 		'crosshj/fake': {
// 			'404.html': {},
// 			'index.colors.css': {},
// 			'index.html': {},
// 			editor: {
// 				'events.js': {}
// 			}
// 		}
// 	}
// };

initState([service], service);

trigger({
	e: {},
	type: 'operationDone',
	params: {},
	source: {},
	data: {},
	detail: {
		op: 'read',
		id: 1,
		result: [service]
	}
});

console.log(
	'Listeners:\n' + 
	list().map(x => x.split('__').reverse().join(': '))
	.sort()
	.join('\n')
);

console.log(
	'Triggers:\n' + 
	listTriggers().map(x => x.split('__').reverse().join(': '))
	.sort()
	.join('\n')
);
