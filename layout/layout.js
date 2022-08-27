import Layout from "https://unpkg.com/@fiug/layout@0.0.12";
// import Layout from "/fiugd/layout/src/index.js";

import YAML from "https://cdn.skypack.dev/yaml";
import iconMap from './icons.js';

function UrlParams(url=""){
	const paramsString = url.includes('?')
		? url.split('?').pop()
		: "";
	const urlParams = new URLSearchParams(paramsString);
	return urlParams;
}
function addParams(url, toAdd){
	const currentParams = Object.fromEntries(
		UrlParams(url)
	);
	const newParams = new URLSearchParams({
		...currentParams,
		...toAdd
	});
	return url.split("?").shift() + "?" + newParams.toString();
}


// TODO: take activeEditor out of global module scope
let activeEditor;

function debounce(func, timeout = 500) {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			func.apply(this, args);
		}, timeout);
	};
}

const getConfig = async () => {
	const storedLayout = (() => {
		try {
			const s = sessionStorage.getItem("test-layout-example");
			if (!s) return;
			return JSON.parse(s);
		} catch (e) {
			console.log(e);
		}
	})();

	let layoutConfig = storedLayout || "./layout/layout.yaml";
	//layoutConfig = 'layout.fiug.yaml';

	if (typeof layoutConfig !== "object") {
		const url = layoutConfig;
		const source = await fetch(layoutConfig).then((r) => r.text());
		if (url.includes(".json")) {
			layoutConfig = JSON.parse(source);
		}
		if (url.includes(".yml") || url.includes(".yaml")) {
			layoutConfig = YAML.parse(source);
		}
	}

	return layoutConfig;
};

// CUSTOMIZE LAYOUT INTERNAL
const createTab = ({ tab, file, pane }) => {
	const title = tab.querySelector('span');
	
	const source = tab.getAttribute('source');
	const paramsString = source.split('?').pop() || "";
	const params = new URLSearchParams(paramsString);
	const service = params.get("service") || "{service}";
	const fileName = params.get("file");

	// const service = tab.getAttribute('service') || "{service}";
	//const path = tab.getAttribute('path') || "{path}";
	tab.setAttribute('title', `${service}/${file}`)

	if(source.includes('tree.html')){
		tab.classList.add('option');
		tab.id = "explorerTab";
		title.textContent = "EXPLORER";
		return;
	}
	if(source.includes('search.html')){
		tab.classList.add('option');
		tab.id = "searchTab";
		title.textContent = "SEARCH";
		return;
	}
	if(source.includes('terminal.html')){
		tab.classList.add('option');
		title.textContent = "TERMINAL";
		tab.closest('.tabs-container').style.display = "none";
		return;
	}
	if(source.includes('preview.html')){
		tab.classList.add('option');
		tab.id = "previewTab";
		title.textContent = "PREVIEW";
		tab.closest('.tabs-container').style.display = "none";
		return;
	}
	title.classList.add('icon', 'icon-' + iconMap(fileName || file));
};
const createTabContent = ({ pane, file, layout }) => {
	const params = new URLSearchParams(
		file.includes('?')
			? file.split('?').pop()
			: ''
	);
	const paramsFile = params.get("file");
	const service = params.get("service");
	const paneid = params.get("paneid")
	!paneid && params.set("paneid", pane);
	
	const paneConfig = layout.flatConfig().find(x => x.id === (pane||paneid));
	const paneModule = paneConfig?.module;

	const paramsString = params.toString().replace(/%2F/g, '/');

	const src = paneModule
		? `${paneModule||''}?${paramsString}`
		: `${file}?${params.toString().replace(/%2F/g, '/')}`;

	// return '<pre>' + JSON.stringify({
	// 	src,
	// 	paneModule,
	// 	params: Object.fromEntries(params)
	// }, null, 2) + '</pre>';

	const sandbox = [
		"allow-same-origin",
		"allow-scripts",
		"allow-popups",
		"allow-modals",
		"allow-downloads",
		"allow-forms",
		"allow-top-navigation",
		"allow-popups-to-escape-sandbox",
	].join(" ");
	const iframe = `<iframe
		src="${src}"
		allowtransparency=”true”
		sandbox="${sandbox}"
		width="100%" height="100%"
	></iframe>`;
	return iframe;
};
const createPane = ({ pane }) => {
	//TODO: customize pane
	console.log(`pane created: ${pane.id}`)
};

// INTERNAL HANDLERS
const changeHandler = debounce((config) => {
	const configString = JSON.stringify(config, null, 2);
	//console.log(configString);
	sessionStorage.setItem("test-layout-example", configString);
});
const openHandler = ({ file, pane }) => {
	// - a file has been dropped onto a pane
	// - a new tab is opened in a pane
	console.log(`opened: ${file}`);
};
const closeHandler = ({ file, pane }) => {
	// - a tab has been closed
	// - a pane has been closed
	console.log(`closed: ${file}`);
};
// const selectHandler = ({ file, pane }) => {
// 	// - a tab has been selected
// 	// - a pane has been selected
// 	// - set activeEditor to pane (if tabbed)
// 	if(file && file.includes("/editor.html") ){
// 		activeEditor = pane;
// 		const urlParams = new URLSearchParams(file.split('?').pop());
// 		const path = urlParams.get('file');
// 		const name = path.split('/').pop();
// 		const parent = path.replace("/"+name, "");
// 		//TODO: get service from params
// 		const service = urlParams.get('service');

// 		const treeFrame = document.querySelector('iframe[src*="dist/tree.html"]');
// 		treeFrame.contentWindow.postMessage({
// 			type: "fileSelect",
// 			detail: {
// 				name,
// 				parent,
// 				service,
// 				source: "Tabs",
// 				data: {},
// 			}
// 		}, location);
// 	}
// };
const resizeHandler = () => {
	//console.log('');
	//console.log('optionally notify status bar of resize')
};

// EXTERNAL
const fileSelect = (layout, e) => {
	//TODO: something like this belongs in the layout module, not sure how to do it
	const path = e.pathWithService
		? e.pathWithService.split("/").filter(x=>x).slice(2).join('/')
		: undefined;
	const filePath = path || e.src;

	//TODO: change to /dist/editor.html
	let file = addParams(
		"", //`/fiugd/beta/dist/editor.html`,
		{ file: filePath }
	);

	if(e.service)
		file = addParams(file, { service: e.service });

	const allPanes = Array.from(document.querySelectorAll('.pane.tabbed'));
	const panesWithFileOpen = [];
	const panesWithFileActive = [];
	for(const pane of allPanes){
		const fileTab = pane.querySelector(`.tab[path^="${filePath}"]`);
		if(!fileTab) continue;
		panesWithFileOpen.push(pane.id);
		if(!fileTab.classList.contains('active')) continue;
		panesWithFileActive.push(pane.id);
	}
	let pane = activeEditor || document.querySelector('.pane.tabbed')?.id;
	if(panesWithFileOpen.length){
		pane = activeEditor && panesWithFileOpen.includes(activeEditor)
			? activeEditor
			: panesWithFileOpen[0];
	}
	if(panesWithFileActive.length){
		pane = activeEditor && panesWithFileActive.includes(activeEditor)
			? activeEditor
			: panesWithFileActive[0];
	}
	activeEditor = pane;
	layout.openTab({ pane, file });
};
const fileRemove = (layout, e) => {
	const { file } = e.detail;
	/*
		- if file is open in allPanes, close it
		- if file was active, activate the next tab
	*/
	const allOpen = document.querySelectorAll(`.tab[path="${file}"]`);
	for(const tab of allOpen){
		const pane = tab.closest('.pane');
		layout.closeTab({ tab, pane });
	}
	console.log('remove:' + file);
};
const fileChange = (layout, e) => {
	/*
		- if file is open in allPanes, update its status, ie. orange bar at top
		- if a file was renamed?
	*/
	console.log('handle file being changed outside layout');
};
const cursorActivity = (layout, e) => {
	if(!e.source) return;
	const { location } = e.source;
	const pane = location.href.split("paneid=").pop();
	if(location.href.includes("/editor.html") ){
		activeEditor = pane;
	}
	// const params = new Proxy(new URLSearchParams(e.source.location.search), {
	// 	get: (searchParams, prop) => searchParams.get(prop),
	// });
	// const file = params.file
	// 	? e.source.location.pathname + `?file=${params.file}`
	// 	: undefined;
	//if(!file)

	//TODO: fix activate pane does not update config
	return layout.activate({ pane });
	//layout.openTab({ pane, file });
};
const showSearch = (layout, e) => {
	const searchTab = document.getElementById('searchTab');
	const file = searchTab.getAttribute('path');
	const pane = searchTab.closest('.pane')?.id;
	layout.openTab({ pane, file });
};
const showServiceCode = (layout, e) => {
	const searchTab = document.getElementById('explorerTab');
	const file = searchTab.getAttribute('path');
	const pane = searchTab.closest('.pane')?.id;
	layout.openTab({ pane, file });
};
const operations = (layout, e) => {
	const { triggerEvent = {} } = event.data || {};
	const { detail = {} } = triggerEvent;
	const { operation = "" } = detail;
	console.log({ detail });
	if(operation === "deleteFile")
		return fileRemove(layout, { detail });
};


export default async () => {
	const layoutConfig = await getConfig();
	const layout = new Layout({
		...layoutConfig,
		parent: document.querySelector('#layout'),
		events: { createTab, createPane, createTabContent }
	});

	const activePane = document.querySelector('.pane.tabbed.active');
	activeEditor = activePane
		? activePane.id
		: undefined;

	layout.on('change', changeHandler);
	layout.on('open', openHandler);
	layout.on('close', closeHandler);
	//layout.on('select', selectHandler);
	layout.on('resize', resizeHandler);

	const useDetail = (fn) => (layout, event) => {
		const { triggerEvent, detail } = event.data;
		if(triggerEvent)
			return fn(layout, triggerEvent.detail);
		if(!detail)
			return;
		return fn(layout, detail);
	};

	layout.eventHandlers = {
		fileSelect: useDetail(fileSelect),
		fileClose: useDetail(fileRemove),
		fileDelete: useDetail(fileRemove),
		fileChange: useDetail(fileChange),
		showSearch: useDetail(showSearch),
		showServiceCode: useDetail(showServiceCode),
		cursorActivity,
		operations
	};

	return layout;
};
