import '../../vendor/codemirror.js';

import codeMirrorCSS from '../../vendor/codemirror.css' assert { type: "css" };
import bespinCSS from '../../vendor/bespin.css' assert { type: "css" };
import darkCSS from '../../vendor/vscode.codemirror.css' assert { type: "css" };
document.adoptedStyleSheets = [
	...document.adoptedStyleSheets,
	codeMirrorCSS, bespinCSS, darkCSS
];

import '../../vendor/bundle.addon.js';
import '../../vendor/bundle.mode.js';

// has side effects of changing opts.mode in some cases
const getModeWithEffects = (opts) => {
	let mode = opts.mode || "javascript";
	try {
		mode = opts.mode.name || mode;
	} catch(e){}

	//console.log({ mode })

	if(mode === "ne"){
		opts.mode = 'ebnf';
		mode = 'ebnf';
	}
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
}

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
	const textArea = document.querySelector('.editor textarea');
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

const allTheEditorThings = (args, callback) => {
	const { text='', ...opts } = args || {};
	let _text = text;
	if(typeof _text !== 'string'){
		_text = '\n';
		console.warn(`Editor received bad text!`);
		console.warn({ text, opts })
	}
	const mode = getModeWithEffects(opts);
	if(window.Editor){
		opts.mode = opts.mode.mimeType || opts.mode || mode;
		window.Editor.toTextArea();
		window.Editor = setupEditor(_text, opts || {});
		callback(null, window.Editor);
		return;
	}
	window.Editor = setupEditor(_text, opts || {});
	callback(null, window.Editor);
}

export default allTheEditorThings;
