
import { showFileInEditor } from '../utils/misc.js';
import {
	getCurrentFileFull, setCurrentFile
} from "../state.js";

import showNothingOpen from './nothingOpen.js';
import showBinaryPreview from './filePreview.js';
import showSystemDocsView from './systemDocs.js';

let editorDom, editorPreview, nothingOpenDom, systemDocsView;

const switchEditor = (
	editor,
	systemDocsErrors,
) => async (filename, mode, {line, column}={}) => {

	//TODO: should go into loading mode first
	//switchEditor should be called each and every time a doc loads

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

		systemDocsView = showSystemDocsView({
			filename,
			errors: systemDocsErrors,
		});
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

export default switchEditor;

