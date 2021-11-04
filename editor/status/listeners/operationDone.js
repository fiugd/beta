import { getFileType, codemirrorModeFromFileType, friendlyModeName } from '../../utils/misc.js';
//import { getDefaultFile } from "../../utils/State.js";

const handler = (event, context) => {
	const { status } = context;
	const {
		setLineNumber,
		setColNumber,
		setTabSize,
		setDocType
	} = status.operations;

	// if (firstRun) {
	// 	firstRun = false;
	// 	const savedMode = (() => {
	// 		try {
	// 			return JSON.parse(sessionStorage.getItem("statusbar")).mode;
	// 		} catch (e) {}
	// 	})();
	// 	if (savedMode) {
	// 		setDocType(savedMode);
	// 		setLineNumber(1);
	// 		setColNumber(1);
	// 		return;
	// 	}
	// }
	const { detail } = event;
	const { op, id, result } = detail;
	// only care about service read with id
	if (op !== "read" || !id) {
		return;
	}
	const selected = result[0]?.state?.selected;

	//have to figure out what file gets loaded by default (boo!)
	//const defaultFile = getDefaultFile(result[0]);
	const defaultFile = selected.name;
	const fileType = getFileType(defaultFile);
	const mode = codemirrorModeFromFileType(fileType);
	setDocType(friendlyModeName(fileType,mode));
	// sessionStorage.setItem(
	// 	"statusbar",
	// 	JSON.stringify({
	// 		mode,
	// 		line: 1,
	// 		col: 1,
	// 	})
	// );
	setLineNumber(1);
	setColNumber(1);

}

export default handler;

