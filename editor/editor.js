import { trigger } from './Listeners.js';

import EditorTabs from "./editorTabs.js";
import EditorStatus from "./editorStatus.js";

import Search from './views/search.js';
import inlineEditor from './views/inlineEditor.js';
import switcher from './views/switcher.js';

import { attachListener, connectTrigger } from "./editorEvents.js";

import { initState, getCurrentService, setState } from "./state.js";

import "../shared/vendor/localforage.min.js";

// call editor tabs once early so event handlers are attached
EditorTabs();
EditorStatus();

// this is really a trigger
const CursorActivityHandler = ({ line, column }) => {
	const event = new CustomEvent("cursorActivity", {
		bubbles: true,
		detail: { line, column },
	});
	document.body.dispatchEvent(event);
};

const ChangeHandler = (doc) => {
	const { code, name, id, filename } = doc;
	const service = getCurrentService({ pure: true });

	// TODO: if handler already exists, return it
	const changeThis = (contents, changeObj) => {
		const file = setState({
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
		changeThis(editor.getValue(), changeObj);
	};
};

function _Editor(callback) {
	const editor = inlineEditor(ChangeHandler, EditorTabs, Search, CursorActivityHandler);
	let systemDocsErrors = [];

	const switchEditor = switcher(
		editor,
		systemDocsErrors
	);

	const messageEditor = ({ op, result }) => {
		if (result.error) {
			systemDocsErrors = systemDocsErrors.filter((x) => x.op === op);
			systemDocsErrors.push({ op, error: result.error });
			showSystemDocsView({ errors: systemDocsErrors });
			return;
		} else {
			showSystemDocsView({ op });
		}
	};

	connectTrigger({
		eventName: "provider-test",
		type: 'click',
		data: (event) => {
			return Array.from(
				event.target.parentNode.querySelectorAll('input:not([name="hidden"])')
			).map(({ name, value }) => ({ name, value }));
		},
		filter: (e) =>
			document.querySelector("#editor").contains(e.target) &&
			e.target.classList.contains("provider-test"),
	});
	connectTrigger({
		eventName: "provider-save",
		type: 'click',
		data: (event) => {
			return Array.from(
				event.target.parentNode.querySelectorAll('input:not([name="hidden"])')
			).map(({ name, value }) => ({ name, value }));
		},
		filter: (e) =>
			document.querySelector("#editor").contains(e.target) &&
			e.target.classList.contains("provider-save"),
	});
	connectTrigger({
		eventName: "provider-add-service",
		type: 'click',
		data: (event) => {
			return Array.from(
				event.target.parentNode.querySelectorAll('input:not([name="hidden"])')
			).map(({ name, value }) => ({ name, value }));
		},
		filter: (e) =>
			document.querySelector("#editor").contains(e.target) &&
			e.target.classList.contains("provider-add-service"),
	});

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

	attachListener({
		switchEditor,
		messageEditor,
		paste,
		cutSelected,
		copySelected
	});
}


const Editor = _Editor;;

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

window.showMenu = () => true;
Editor();

const service = {
	name: 'crosshj/fake',
	state: {
		selected: {
			// line: 2, << causes focus to be stolen
			// column: 0, << causes focus to be stolen
			id: '1',
			name: 'index.colors.css',
			filename: 'index.colors.css',
			path: '/crosshj/fiug-beta/index.colors.css',
		},
		opened: [
			{ name: 'index.colors.css', order: 0 },
			{ name: '404.html', order: 1 },
			{ name: 'index.html', order: 2 }
		],
		changed: ['index.html']
	},
	code: [{
		name: 'index.colors.css',
		code: '/crosshj/fiug-beta/index.colors.css',
		path: '/crosshj/fiug-beta/index.colors.css'
	},{
		name: '404.html',
		code: '/crosshj/fiug-beta/404.html',
		path: '/crosshj/fiug-beta/404.html'
	},{
		name: 'index.html',
		code: '/crosshj/fiug-beta/index.html',
		path: '/crosshj/fiug-beta/index.html'
	}],
	tree: {
		'crosshj/fake': {
			'404.html': {},
			'index.colors.css': {},
			'index.html': {}
		}
	}
};

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
