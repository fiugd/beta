import { getFileType, codemirrorModeFromFileType, friendlyModeName } from '../../utils/misc.js';

const handler = (event, context) => {
	const { status } = context;
	const {
		setLineNumber,
		setColNumber,
		setTabSize,
		setDocType
	} = status.operations;

	const { detail } = event;
	const { name } = detail;
	if (!name) {
		return;
	}
	const fileType = getFileType(name);
	const mode = codemirrorModeFromFileType(fileType);
	setDocType(friendlyModeName(fileType,mode));
	// if (!firstRun) {
		// sessionStorage.setItem(
		// 	"statusbar",
		// 	JSON.stringify({
		// 		mode,
		// 		line: 1,
		// 		col: 1,
		// 	})
		// );
	// }
	setLineNumber(1);
	setColNumber(1);
}

export default handler;

