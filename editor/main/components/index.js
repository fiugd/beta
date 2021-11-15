import EditorModule from "./codemirror.js";
import Container from './container.js';
import Search from './search.js';
import { codemirrorModeFromFileType, getFileType } from '../../utils/misc.js';
import { getSettings, DEBUG } from "../../utils/State.js";
import attachGutterHelper from './gutterHelper.js';
import { switchEditor, messageEditor } from './switcher.js';

import "../../vendor/localforage.min.js";

const { indentWithTabs, tabSize } = getSettings();

let editorGutter;
let cmDom;
let prevDoc;

const BLANK_CODE_PAGE = "";

const initEditor = (context) => {
	const containerDiv = Container({
		operations: ["create", "cancel", "delete", "persist", "update"],
	});
	const editorDiv = document.createElement("div");
	editorDiv.id = "editor-container";

	editorDiv.appendChild(context.tabs);
	editorDiv.appendChild(Search());

	const editorTextArea = document.createElement("textarea");
	editorTextArea.id = "service_code";
	editorTextArea.classList.add("hidden");
	editorDiv.appendChild(editorTextArea);
	containerDiv.querySelector(".contain").appendChild(editorDiv);

	return editorDiv;
}

const attachHandlers = (() => {
	let attached = false;
	let _context;

	return (editor, handlers, context) => {
		const { fold, unfold, change, cursor, scroll } = handlers;

		_context = _context || context;
		const withContext = (fn) => {
			return (...args) => fn(_context || {}, ...args);
		}

		if(!attached){
			editor.on("fold", withContext(fold));
			editor.on("unfold", withContext(unfold));
			editor.on("change", withContext(change));
			editor.on("cursorActivity", withContext(cursor));
			editor.on("scrollCursorIntoView", withContext(scroll));
			attached = true;
		}

		const cleanup = () => {
			_context = null;

			const sidebarCanvas = document.querySelector('.cm-sidebar canvas');
			sidebarCanvas && (sidebarCanvas.width = sidebarCanvas.width);
		};

		return cleanup;
	};
})();

const foldHandler = (context, cm, from, to) => {
	cm.addLineClass(from.line, "wrap", "folded");
};
const unfoldHandler = (context, cm, from, to) => {
	cm.removeLineClass(from.line, "wrap", "folded");
};

const onChange = (context, cm, changeObj) => {
	const { origin } = changeObj;
	const ignoreOrigins = [
		'setValue'
	];
	if(ignoreOrigins.includes(origin)) return;

	const {
		prevCode, name, id, filename, filePath,
		triggers,
	} = context;
	if(!triggers) return;

	triggers.fileChange({
		code: cm.getValue(),
		prevCode,
		name,
		id,
		filename,
		filePath,
	});
};

const onCursorActivity = (context, instance) => {
	const { triggers, updateLineInfo } = context;
	if(!triggers || !updateLineInfo) return;
	const cursor = instance.getCursor();
	const line = cursor.line + 1;
	const column = cursor.ch + 1;
	updateLineInfo(instance, line);
	// STATUS_CURRENT_LINE.textContent = cursor.line + 1;
	triggers.cursorActivity({ line, column });
};

const onScrollCursor = (context, instance, event) => {
	//TODO: use this to recall scroll positions?
	//event.preventDefault();
};

const Editor = (args, context) => {
	const triggers = context.triggers.editor;

	const {
		code = BLANK_CODE_PAGE,
		line: loadLine,
		column: loadColumn,
		name,
		id,
		filename,
		path,
		callback,
	} = args || {};

	const prevEditor = document.querySelector("#editor-container");
	const editorDiv = prevEditor || initEditor(context);

	let currentHandle = null;
	let currentLine;
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
	};
	function SwapLineDown(cm) {
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
	};
	const extraKeys = {
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

		const darkEnabled = window.localStorage.getItem("themeDark") === "true";
		editor.setOption("theme", darkEnabled ? "vscode-dark" : "default");

		editor.setOption("styleActiveLine", { nonEmpty: true });
		editor.setOption("extraKeys", extraKeys);

		const handlers = {
			fold: foldHandler,
			unfold: unfoldHandler,
			change: onChange,
			cursor: onCursorActivity,
			scroll: onScrollCursor
		};
		const handlersContext = {
			prevCode: code,
			name,
			id,
			filename,
			filePath: filename,
			triggers,
			updateLineInfo,
		};
		editor._cleanup = attachHandlers(editor, handlers, handlersContext);

		let editorState = {
			unfolded: [],
			scroll: 0,
		};
		const stateStorageKey = `state::${name}::${filename}`;

		const MIN_DOC_FOLD_LENGTH = 150;
		let cursor = 0;
		false && editor.lastLine() > MIN_DOC_FOLD_LENGTH &&
			editor.eachLine(editor.firstLine(), editor.lastLine(), function (line) {
				// todo: store these exceptions in user config?
				const shouldNotFold = [
					"<html>",
					"<head>",
					"<svg",
					"<!--",
					"code_in",
					"# welcome!",
				].find((x) => line.text.includes(x));

				const isfirstLineOfJSON =
					(filename.includes(".piskel") ||
						filename.includes(".json") ||
						filename.includes(".gltf") ||
						filename.includes(".ipynb")) &&
					cursor === 0;

				if (shouldNotFold || isfirstLineOfJSON) {
					cursor++;
					return;
				}
				// children of the folded
				const alreadyFolded = editor.isFolded({ line: cursor, ch: 0 });
				if (alreadyFolded) {
					cursor++;
					return;
				}

				editor.foldCode({ line: cursor, ch: 0 }, null, "fold");
				cursor++;
			});

		editorState.unfolded.forEach((line) => {
			try {
				//editor.foldCode({ line, ch: 0 }, null, "unfold");
			} catch(e){}
		});
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
		DEBUG && console.log(
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
			DEBUG,
			callback
		});

	};

	if(window.Editor) return loadDocument();

	EditorModule({ ...editorOptions, text: '\n\n\n' }, (error, editor) => {
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

Editor.switchEditor = switchEditor;
Editor.messageEditor = messageEditor;

export default Editor;
