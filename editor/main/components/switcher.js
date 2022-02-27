
import { showFileInEditor } from '../../utils/misc.js';
import { getCurrentFileFull, setCurrentFile } from "../../utils/State.js";

import showNothingOpen from './nothingOpen.js';
import showBinaryPreview from './filePreview.js';
import showSystemDocsView from './systemDocs.js';

let editorDom, editorPreview, nothingOpenDom, systemDocsView;

/*
TODO:
	1. should probably be no distinction between switch & message
	2. should probably delete (some/all ?) views (versus just hiding them)
*/

const switchEditor = async (args, context) => {
	const { editor } = context;
	const { filename, mode, line, column, singleFileMode } = args;
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
		}, context);

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
		}, context);

		nothingOpenDom = showNothingOpen();
		nothingOpenDom && nothingOpenDom.classList.remove("hidden");

		editorPreview && editorPreview.classList.add("hidden");
		editorDom && editorDom.classList.add("hidden");
		systemDocsView && systemDocsView.classList.add("hidden");
		return;
	}

	setCurrentFile({ filePath: filename });

	const currentFile = await getCurrentFileFull({ noFetch: true });
	const {
		code = "error",
		path,
		name,
		id,
		filename: defaultFile,
	} = currentFile || {};

	if (!currentFile || !showFileInEditor(filename, code)) {
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
		}, context);

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
	}, context);
	editorDom = document.querySelector(".CodeMirror");
	editorDom && editorDom.classList.remove("hidden");

	editorPreview && editorPreview.classList.add("hidden");
	nothingOpenDom && nothingOpenDom.classList.add("hidden");
	systemDocsView && systemDocsView.classList.add("hidden");

	const editorTabsEl = document.querySelector("#tabs");
	if(!editorDom && !editorTabsEl) return;
	if (singleFileMode) {
		editorTabsEl.style.display = "none";
		editorDom.style.height = "100%";
	} else {
		editorTabsEl.style.display = "";
		editorDom.style.height = "";
	}
};

const messageEditor = (args, context) => {
	const { op, result } = args;
	if (!result.error) return showSystemDocsView({ op });
	context.systemDocsErrors = (context.systemDocsErrors||[]).filter((x) => x.op === op);
	context.systemDocsErrors.push({ op, error: result.error });
	showSystemDocsView({ errors: context.systemDocsErrors }, context);
};

export { switchEditor, messageEditor };

