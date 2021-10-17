import { trigger } from './Listeners.js';

import EditorTabs from "./editorTabs.js";

import Search from './views/search.js';
import inlineEditor from './views/inlineEditor.js';
import switcher from './views/switcher.js';

import { attachListener, connectTrigger } from "./editorEvents.js";

import { setState, getCurrentService } from "./state.js";

import "../shared/vendor/localforage.min.js";

// call editor tabs once early so event handlers are attached
EditorTabs();

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

	//deprecate
	return {
		inlineEditor: editor,
	};
}


const Editor = _Editor;;

const isRunningAsModule = document.location.href.includes("_/modules");

if(!isRunningAsModule){
	const base = document.createElement('base');
	base.href = '../../';
	document.getElementsByTagName('head')[0].appendChild(base);
}

window.showMenu = () => true;

const { inlineEditor: editor } = Editor();

const state = {
	selected: {
		// line: 2, << causes focus to be stolen
		// column: 0, << causes focus to be stolen
		id: '1',
		name: '404.html',
		filename: '404.html',
		path: '../404.html',
	},
	opened: [{ name: '404.html', order: 0 }, { name: 'index.html', order: 1 }],
	changed: ['index.html']
};

editor(state.selected);

const head=document.getElementsByTagName("head")[0];

const cssnode = document.createElement('link');
cssnode.type = 'text/css';
cssnode.rel = 'stylesheet';
cssnode.href = './editor.css';
head.appendChild(cssnode);

trigger({
	e: {},
	type: 'operationDone',
	params: {},
	source: {},
	data: {},
	detail: {
		op: 'read',
		id: 1,
		result: [{
			name: 'crosshj/fake',
			state
		}]
	}
})