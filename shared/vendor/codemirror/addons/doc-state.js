/*

Document State:

will store/recall (and load doc with)
  - cursor position
  - scrollTop and scrollLeft
  - selections
  - mode

In order for it to work:
- must pass localforage in options: "docStore: localforage"
- must call cm.loadDoc to load document
  - pass at least name as option
  - other args available: name, text, mode, scrollTop, scrollLeft, line, ch

example:

  const cm = CodeMirror(editorDiv, {
		lineNumbers: true,
		tabSize: 2,
		mode: 'javascript',
		theme: 'vscode-dark',
		docStore: localforage,
		gutters: [],
	});

	cm.loadDoc({ name: 'example.js', mode: 'javascript', text: '//hello world'});


further reference, see defineExtension here https://codemirror.net/doc/manual.html
(and nearby methods)

*/

(function(mod) {
	if (typeof exports == "object" && typeof module == "object") // CommonJS
		mod(require("../../lib/codemirror"));
	else if (typeof define == "function" && define.amd) // AMD
		define(["../../lib/codemirror"], mod);
	else // Plain browser env
		mod(CodeMirror);
})(function(CodeMirror) {
	"use strict";

	let currentDoc;
	const SCROLL_MARGIN = 50;
	const allDocs = {};

	CodeMirror.defineOption('docStore', () => {}, (cm, localforage) => {
		if(!localforage || !localforage.createInstance) return;

		const driverOrder = [
			localforage.INDEXEDDB,
			localforage.WEBSQL,
			localforage.LOCALSTORAGE,
		];
		cm.options.docStore = localforage
			.createInstance({
					driver: driverOrder,
					name: 'editorState',
					version: 1.0,
					storeName: 'editor',
					description: 'scroll and cursor position, history, selection'
			});
	});

	function prepareStorageDoc(cmDoc){
		const other = {};
		other.sel = cmDoc.sel;
		other.text = cmDoc.getValue();
		other.cursor = cmDoc.getCursor();
		other.scrollTop = cmDoc.scrollTop;
		other.scrollLeft = cmDoc.scrollLeft;
		other.mode = cmDoc.mode.name;
		other.history = cmDoc.getHistory();
		try {
			other.folded = cmDoc.getAllMarks()
				.filter(m => m.__isFold)
				.map(m => m.lines[0].lineNo());
		} catch(e){}
		return other;
	}
	
	function foldLine(doc, line){
		try {
			doc.foldCode({ line, ch: 0 }, null, "fold");
		} catch(e){}
	}

	function rehydrateDoc(newDoc, stored){
		if(stored.text){
			newDoc.setValue(stored.text)
		}
		if(stored.scrollTop){
			newDoc.scrollTop = stored.scrollTop;
		}
		if(stored.scrollLeft){
			newDoc.scrollLeft = stored.scrollLeft;
		}
		newDoc.clearHistory();
		if(stored.history){
			newDoc.setHistory(stored.history);
		}
		if(stored.cursor){
			newDoc.setCursor(stored.cursor);
		}
		if(stored.sel){
			newDoc.setSelections(stored.sel.ranges);
		}
		return newDoc;
	}

	const debounce = (func, wait, immediate) => {
			var timeout;
			return async function() {
				var context = this, args = arguments;
				var later = function() {
					timeout = null;
					if (!immediate) func.apply(context, args);
				};
				var callNow = immediate && !timeout;
				clearTimeout(timeout);
				timeout = setTimeout(later, wait);
				if (callNow) func.apply(context, args);
			};
		};

	const selectLine = (cm, doc, line, ch) => {
		const newLine = ch ? { line, ch } : line;
		doc.setCursor(newLine);
		const t = doc.cm.charCoords(newLine, "local").top;
		cm.scrollTo(0, t - SCROLL_MARGIN);
	}
	
	CodeMirror.defineExtension('loadDoc', async function ({
		name, text, mode, scrollTop, scrollLeft, line, ch
	}){
		if(!name) return;
		if(currentDoc && name === currentDoc.name){
			if(line) selectLine(this, currentDoc.editor, line, ch);
			return;
		}

		if(currentDoc && currentDoc.cleanup) currentDoc.cleanup();

		const storedDoc = await this.options.docStore.getItem(name);

		let newDoc = (allDocs[name] || {}).editor || CodeMirror.Doc('', mode || storedDoc.mode);
		newDoc.name = name;
		if(storedDoc){
			newDoc = rehydrateDoc(newDoc, {
				...storedDoc,
				text: text || storedDoc.text,
				mode: mode || storedDoc.mode,
				scrollTop: scrollTop || storedDoc.scrollTop,
				scrollLeft: scrollLeft || storedDoc.scrollLeft,
			});
		} else {
			newDoc = rehydrateDoc(newDoc, { text, mode, scrollTop, scrollLeft });
		}
		currentDoc = {
			name,
			editor: newDoc
		};
		this.swapDoc(newDoc);
		
		if(storedDoc && storedDoc.folded && this.foldCode){
			const foldDocLine = (line) => foldLine(this, line);
			storedDoc.folded.forEach(foldDocLine);
		}

		const thisOptions = this.options;
		async function persistDoc(){
			if(!name) return;
			await thisOptions.docStore.setItem(
				name,
				prepareStorageDoc(currentDoc.editor)
			);
		}
		const debouncedPersist = debounce(persistDoc, 1000, false);

		if(scrollTop){
			this.scrollTo(0, scrollTop);
		}
		if(line) selectLine(this, currentDoc.editor, line, ch);

		if(!storedDoc) debouncedPersist();

		CodeMirror.on(currentDoc.editor, "change", debouncedPersist);
		CodeMirror.on(currentDoc.editor, "cursorActivity", debouncedPersist);
		CodeMirror.on(this, "scroll", debouncedPersist);
		CodeMirror.on(this, "fold", persistDoc);
		CodeMirror.on(this, "unfold", persistDoc);

		currentDoc.cleanup = () => {
			CodeMirror.off(currentDoc.editor, "change", debouncedPersist);
			CodeMirror.off(currentDoc.editor, "cursorActivity", debouncedPersist);
			CodeMirror.off(this, "scroll", debouncedPersist);
			CodeMirror.off(this, "fold", persistDoc);
			CodeMirror.off(this, "unfold", persistDoc);
		};
	});
});
