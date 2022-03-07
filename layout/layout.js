import layoutCSS from './layout.css' assert { type: "css" };

document.adoptedStyleSheets = [
	...document.adoptedStyleSheets,
	layoutCSS
];

import YAML from 'https://cdn.skypack.dev/yaml';

import * as gl from "https://cdn.skypack.dev/golden-layout@2.4.0";
//import layout from 'https://unpkg.com/golden-layout@2.4.0/dist/esm/index.js'
//console.log(layout)

/*

wrap golden layout

wrapper provides:
	- fixed action bar based on configuration (and possibly other fixed elements)
	- allows tree to have "snap closed, snap open" behavior
	- utils for moving fixed elements to edges of screen
	- handles loading and remembering a wrapped config which allows the above
	- handle yaml config versus json
	- utils for programmatically spliting current pane
	- utils for tracking "current pane"
	- build script for layout
	- identify where a frame is, let frame know this
	- allow tab active/inactive/changed color to be set

GENERAL "NEW LAYOUT" TODO:
	- terminal needs to load to the service it is passed in params
	- editor needs to trigger drag the same way that index.drag.html does it (mostly)
	- main page needs to load service worker the way it currently does (or better)
	- main page needs to handle events like it currently does
	- main page needs to handle right context menus (and maybe more)

*/



const Layout = async (layoutConfig) => {
	if(typeof layoutConfig !== "object"){
		const url = layoutConfig;
		const source = await fetch(layoutConfig).then(r => r.text());
		if(url.includes('.json')){
			layoutConfig = JSON.parse(source);
		}
		if(url.includes('.yml') || url.includes('.yaml')){
			layoutConfig = YAML.parse(source);
		}
	}
	console.log(layoutConfig)
	console.log(gl)
	const { GoldenLayout, DragSource } = gl;

	const layoutContainer = document.getElementById("layoutContainer");

	window.addEventListener('resize', () => {
		// handling of resize event is required if GoldenLayout does not use body element
		const width = document.body.offsetWidth;
		const height = document.body.offsetHeight;
		goldenLayout.setSize(width, height);
	});

	const iframeSandboxPermissions = [
		"allow-same-origin",
		"allow-scripts",
		"allow-popups",
		"allow-modals",
		"allow-downloads",
		"allow-forms",
		"allow-top-navigation",
		"allow-popups-to-escape-sandbox"
	].join(' ');
	const iframeUrls = {
		Tree: "/dist/tree.html",
		Editor: "/dist/editor.html",
		Terminal: "/dist/terminal.html",
	};

	class Action {
		constructor(container, componentState){
			//console.log(arguments);
			this.container = container;
			container.id = 'action-bar';
			container.element.innerHTML = `
				<div style="background:#222222;width:100%;height: calc(100% - 22px);color:white;white-space: pre;padding: 1em;box-sizing: border-box;">${JSON.stringify(componentState, null, 2)}</div>
			`;
		}
	}

	const iconMap = (ext) => {
		let _ext;
		try { _ext = (ext+'').toLowerCase(); }
		catch(e) { console.log(ext); }
		const icon = {
			js: 'javascript',
			html: 'html',
			license: 'license',
			md: 'info'
		}[_ext];
		if(!icon) console.log('no icon for: ' + ext);
		return icon || 'default'
	};

	class Editor {
		get rootHtmlElement() {
			return this._root;
		}
		constructor(container, componentState){
			this._root = document.createElement('div');
			const { file: filename, cssClass } = componentState;
			if(!filename){
				this._root.innerHTML = `
					<div style="background:#222222;width:100%;height: calc(100% - 22px);color:white;white-space: pre;padding: 1em;box-sizing: border-box;"></div>
				`;
				return;
			}
			if(cssClass) console.log(cssClass);

			const ext = filename.split('.').slice(-1);
			container.on('tab', function(tab){
				const title = tab.element.querySelector('.lm_title');
				title.classList.add('icon', 'icon-' + iconMap(ext));
			});

			const iframe = document.createElement('iframe');
			iframe.src = iframeUrls.Editor + '?file=' + componentState.file;
			iframe.style="height:100%;width:100%;border:0;";
			iframe.sandbox = iframeSandboxPermissions;
			this._root.append(iframe);
			this._root.classList.add('editor');
		}
	}

	class Terminal {
		get rootHtmlElement() {
			return this._root;
		}
		constructor(container){
			this._root = document.createElement('div');
			const iframe = document.createElement('iframe');
			iframe.src = iframeUrls.Terminal;
			iframe.style="height:100%;width:100%;border:0;";
			iframe.sandbox = iframeSandboxPermissions;
			this._root.append(iframe);
			this._root.classList.add('terminal');
		}
	}

	const tree = (layout) => 
	class Tree {
		constructor(container){
			//console.log(arguments)
			const root = document.createElement('div');
			this.rootHtmlElement = root;
			root.id = 'dragPane';
			root.innerHTML = `
			<style>
				#dragPane > div{ 
					width: 100%;
					color: #ccc;
					font: 13px arial;
					height: calc(100% - 22px);
					background: #2e2e2e;
					position: inherit;
				}
				ul { list-style: none; padding-left: 1em; }
				ul li { user-select: none; }
			</style>
			<div>
				<ul>
					<li><span class="icon-html">404.html</span></li>
					<li class="icon-javascript">404.js</li>
					<li class="icon-default">CNAME</li>
					<li class="icon-license">LICENSE</li>
					<li class="icon-info">README.md</li>
				</ul>
			</div>
			`;
			const element = document.createElement('div');
			let dummy = {
				type: 'Editor',
				state: {},
				title: ''
			};
			let getDummy = () => JSON.parse(JSON.stringify(dummy));

			const listItems = Array.from(root.querySelectorAll('ul li'));
			const dragSource = layout.newDragSource(root, getDummy, {}, 'drag source');
			const pointerMove = (event) => dragSource._dragListener.onPointerMove(event);
			const pointerUp = (el) => (event) => {
				dragSource._dragListener.onPointerUp(event);
				el.onpointermove = null;
				el.onpointerup = null;
				el.releasePointerCapture(event.pointerId);
			};
			const pointerDown = (el) => (event) => {
				const { button } = event;
				if(button !== 0) return;
				el.onpointermove = pointerMove;
				el.onpointerup = pointerUp(el);
				el.setPointerCapture(event.pointerId);

				dragSource._componentTypeOrFtn = () => ({
					type: 'Editor',
					state: { file: event.target.textContent.trim() },
					title: event.target.textContent.trim()
				});
				dragSource._dragListener._pointerTracking = true;
				dragSource._dragListener.startDrag();
			};
			for(var el of listItems){
				el.onpointerdown = pointerDown(el);
			}
		}
	};

	const goldenLayout = new GoldenLayout(layoutContainer);
	goldenLayout.registerComponentConstructor('Action', Action);
	goldenLayout.registerComponentConstructor('Tree', tree(goldenLayout), true);
	goldenLayout.registerComponentConstructor('Editor', Editor, true);
	goldenLayout.registerComponentConstructor('Terminal', Terminal, true);
	goldenLayout.loadLayout(layoutConfig);

	/*
	goldenLayout.on('stateChanged', function(){
		const state = JSON.stringify( goldenLayout.saveLayout() );
		localStorage.setItem('layout', state );
	});

	goldenLayout.on('itemCreated', function (item) {
		console.log('itemCreated')
		if (item?.config?.cssClass) {
			console.log('itemCreated cssClass')
			const classes = Array.isArray(item.config.cssClass)
				? item.config.cssClass
				: item.config.cssClass.split(' ');
			item.element.classList.add(...classes);
		}
	});

	goldenLayout.on( 'stackCreated', function( stack ){
		console.log('stack created')
	});
	
	goldenLayout.on( 'componentCreated', function( component ){
		console.log('component created')
	});
	*/

	window.goldenLayout = goldenLayout;

};

export default Layout;



/* FROM INDEX.NEW.HTML


	import * as gl from "https://cdn.skypack.dev/golden-layout@2.4.0";
	console.log(Object.keys(gl))
	const { GoldenLayout } = gl;

	let savedLayout;
	try {
		//savedLayout = JSON.parse(localStorage.getItem('layout'));
	}catch(e){}
	const layoutConfig = savedLayout || await fetch('index.layout.json').then(r => r.json());
	const layoutContainer = document.getElementById("layoutContainer");

	window.addEventListener('resize', () => {
		// handling of resize event is required if GoldenLayout does not use body element
		const width = document.body.offsetWidth;
		const height = document.body.offsetHeight;
		goldenLayout.setSize(width, height);
	});

	const iframeSandboxPermissions = [
		"allow-same-origin",
		"allow-scripts",
		"allow-popups",
		"allow-modals",
		"allow-downloads",
		"allow-forms",
		"allow-top-navigation",
		"allow-popups-to-escape-sandbox"
	].join(' ');
	const iframeUrls = {
		Tree: "./dist/tree.html",
		Editor: "/dist/editor.html",
		Terminal: "./dist/terminal.html",
	};

	class Tree {
		get rootHtmlElement() {
			return this._root;
		}
		constructor(container){
			this._root = document.createElement('div');
			const iframe = document.createElement('iframe');
			iframe.src = iframeUrls.Tree;
			iframe.style="height:100%;width:100%;border:0;";
			iframe.sandbox = iframeSandboxPermissions;
			this._root.append(iframe);
			this._root.classList.add('tree');
		}
	}
	class Editor {
		get rootHtmlElement() {
			return this._root;
		}
		constructor(container, componentState){
			this._root = document.createElement('div');
			if(!componentState.file){
				this._root.innerHTML = `
					<div style="background:#222222;width:100%;height: calc(100% - 22px);color:white;white-space: pre;padding: 1em;box-sizing: border-box;"></div>
				`;
				return;
			}
			const iframe = document.createElement('iframe');
			iframe.src = iframeUrls.Editor + '?file=' + componentState.file;;
			iframe.style="height:100%;width:100%;border:0;";
			iframe.sandbox = iframeSandboxPermissions;
			this._root.append(iframe);
			this._root.classList.add('editor');
		}
	}
	class Terminal {
		get rootHtmlElement() {
			return this._root;
		}
		constructor(container){
			this._root = document.createElement('div');
			const iframe = document.createElement('iframe');
			iframe.src = iframeUrls.Terminal;
			iframe.style="height:100%;width:100%;border:0;";
			iframe.sandbox = iframeSandboxPermissions;
			this._root.append(iframe);
			this._root.classList.add('terminal');
		}
	}
	class Action {
		constructor(container){
			this.container = container;
			container.id = 'action-bar';
			container.element.innerHTML = `
				<div style="background:#363636;width:100%;height: calc(100% - 22px);"></div>
			`;
		}
	}

	/*
	const componentInstances = []
	const createComponent = async (container, itemConfig) => {
		//console.log(itemConfig)

		const { componentType: type, componentState: props } = itemConfig;
		let iframeContainer;
		if(iframeUrls[type]){
			//const component = { type, props }
			//component.container = () => container;
			const rootEl = document.createElement('div')
			//component.rootElement = () => rootEl;
			rootEl.style.position = 'absolute';
			rootEl.style.overflow = 'hidden';
			
			const iframe = document.createElement('iframe');
			iframe.src = iframeUrls[type];
			iframe.style="height:100%;width:100%;border:0;";
			iframe.sandbox = iframeSandboxPermissions;
			rootEl.append(iframe);

			layoutContainer.querySelector('.lm_root').append(rootEl);

			const component = {
				type, props, element: rootEl
			};
			component.virtualRectingRequiredEvent = (container, width, height) => {
				console.log('virtualRectingRequiredEvent');
			};
			component.virtualVisibilityChangeRequiredEvent = (container, visible) => {
				console.log('virtualVisibilityChangeRequiredEvent');
			};

			componentInstances.push(component);
			return { component, virtual: true };
		}
		const component = {
			//id: ++this.instanceId,
			type,
			props,
			element: container.element,
		};

		//component.virtualRectingRequiredEvent = adaptComponent;
		componentInstances.push(component);
		return { component, virtual: false };
	};
	const destroyComponent = (container) => {
		console.log('destroyComponent')
	}; * /

	const goldenLayout = new GoldenLayout(layoutContainer);
	goldenLayout.registerComponentConstructor('Action', Action);
	goldenLayout.registerComponentConstructor('Tree', Tree, true);
	goldenLayout.registerComponentConstructor('Editor', Editor, true);
	goldenLayout.registerComponentConstructor('Terminal', Terminal, true);
	goldenLayout.loadLayout(layoutConfig);
	
	goldenLayout.on('stateChanged', function(){
		//console.log('stateChanged')
		//console.log(arguments)
		//TODO: consider debounce
		const state = JSON.stringify( goldenLayout.saveLayout() );
		localStorage.setItem('layout', state );
	});

	goldenLayout.on('itemCreated', function (item) {
		console.log('itemCreated')
		if (item?.config?.cssClass) {
			console.log('itemCreated cssClass')
			const classes = Array.isArray(item.config.cssClass)
				? item.config.cssClass
				: item.config.cssClass.split(' ');
			item.element.classList.add(...classes);
		}
	});

*/