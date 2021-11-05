import { getCurrentFile, getCurrentService } from "../../utils/State.js";
import { getFilePath as gfp } from '../../utils/misc.js';

const getFilePath = gfp(getCurrentService);

const fileClose = (e, context) => {
	const { editor: { switchEditor } } = context;
	const { name, parent, path, next, nextPath } = e.detail;
	if(!next){
		switchEditor({ mode: "nothingOpen" }, context);
		return;
	}

	//TODO: shouldn't this be fileSelect handler after this point?

	if(next && next.includes("system::")) {
		switchEditor({
			filename: next.replace("system::", ""),
			mode: "systemDoc"
		}, context);
		return;
	}
	const currentFile = getCurrentFile();
	if(next === currentFile) return;

	const filename = getFilePath({ name, parent, path, next, nextPath });
	switchEditor({ filename }, context);
};

export default fileClose;
