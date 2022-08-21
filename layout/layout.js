import Layout from "https://unpkg.com/@fiug/layout@0.0.5";
//import Layout from "../src/index.js";
import YAML from "https://cdn.skypack.dev/yaml";
import iconMap from './icons.js';

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
	title.classList.add('icon', 'icon-' + iconMap(file));
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
const selectHandler = ({ file, pane }) => {
	// - a tab has been selected
	// - a pane has been selected
	// - set activeEditor to pane (if tabbed)
	if(file && file.includes("/editor.html") ){
		activeEditor = pane;
		const path = file.split('file=').pop().split("pane=").shift();
		const name = path.split('/').pop();
		const parent = path.replace("/"+name, "");
		const treeFrame = document.querySelector('iframe[src*="dist/tree.html"]');
		treeFrame.contentWindow.postMessage({
			type: "fileSelect",
			detail: {
				name,
				parent,
				service: "fiugd/layout",
				source: "Tabs",
				data: {},
			}
		}, location);
	}
};
const resizeHandler = () => {
	console.log('');
	console.log('optionally notify status bar of resize')
};

// EXTERNAL
const fileSelect = (layout, e) => {
	//TODO: something like this belongs in the layout module, not sure how to do it
	const file = `/fiugd/beta/dist/editor.html?file=${e.src}`;
	const allPanes = Array.from(document.querySelectorAll('.pane.tabbed'));
	const panesWithFileOpen = [];
	const panesWithFileActive = [];
	for(const pane of allPanes){
		const fileTab = pane.querySelector(`.tab[path^="${e.src}"]`);
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
	/*
		- if file is open in allPanes, close it
		- if file was active, activate the next tab
	*/
	console.log('handle file being closed from outside layout');
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
	const params = new Proxy(new URLSearchParams(e.source.location.search), {
		get: (searchParams, prop) => searchParams.get(prop),
	});
	const file = params.file
		? e.source.location.pathname + `?file=${params.file}`
		: undefined;
	if(!file)
		return layout.activate({ pane });
	layout.openTab({ pane, file });
};

export default async () => {
	const layoutConfig = await getConfig();
	const layout = new Layout({
		...layoutConfig,
		parent: document.querySelector('#layout'),
		events: { createTab, createPane }
	});

	const activePane = document.querySelector('.pane.tabbed.active');
	activeEditor = activePane
		? activePane.id
		: undefined;

	layout.on('change', changeHandler);
	layout.on('open', openHandler);
	layout.on('close', closeHandler);
	layout.on('select', selectHandler);
	layout.on('resize', resizeHandler);

	const useDetail = (fn) => (layout, event) =>
		fn(layout, event.data.triggerEvent.detail);

	layout.eventHandlers = {
		fileSelect: useDetail(fileSelect),
		fileClose: useDetail(fileRemove),
		fileDelete: useDetail(fileRemove),
		fileChange: useDetail(fileChange),
		cursorActivity,
	};

	return layout;
};
