import { getCurrentService } from "../../utils/State.js";
import { getFilePath as gfp } from '../../utils/misc.js';

const getFilePath = gfp(getCurrentService);

let firstLoad = true;

const fileSelectHandler = async (event, context) => {
	const { editor: { switchEditor } } = context;
	const { name, path, next, nextPath, parent } = event.detail;
	const { line, column } = event.detail;
	let savedFileName;

	/*
	console.log(
		`%c${name}: %ceditor %cfileSelect`,
		'color:#CE9178;',
		'color:#9CDCFE;',
		'color:#DCDCAA;'
	);
	*/

	/*
	if (firstLoad) {
		firstLoad = false;
		savedFileName = sessionStorage.getItem("editorFile");
		if (savedFileName && savedFileName === "noFileSelected") {
			switchEditor(null, "nothingOpen");
			return;
		}
		if (
			savedFileName &&
			savedFileName.includes("system::") &&
			savedFileName.includes("systemDoc::")
		){
			switchEditor(savedFileName.replace("system::", ""), "systemDoc");
			return;
		}
	}
	*/

	const fileNameWithPath = getFilePath({ name, parent, path, next, nextPath });
	const filePath = savedFileName || fileNameWithPath;

	/*
	if (!savedFileName) {
		sessionStorage.setItem("editorFile", filePath);
	}
	*/

	const isSystemDoc = (name||'').includes("system::") ||
		(filePath||'').includes("systemDoc::");
	if (isSystemDoc) {
		switchEditor({
			filename: filePath
				.replace("system::", "")
				.replace("systemDoc::", ""),
			mode: "systemDoc"
		}, context);
		return;
	}

	if(!name){
		//sessionStorage.setItem("editorFile", '');
		switchEditor({ mode: "nothingOpen" }, context);
		return;
	}

	switchEditor({ filename: filePath, line, column }, context);
};

export default fileSelectHandler;
