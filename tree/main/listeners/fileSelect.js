import { getCurrentService } from "../../utils/State.js";
import { getFilePath as gfp } from '../../utils/misc.js';
import { noFrontSlash } from '../../utils/misc.js';

const getFilePath = gfp(getCurrentService);

const fileSelectListener = (e, context) => {
	const { type='' } = e;
	const { treeSelect } = context.tree.api;
	if(e?.detail?.source === 'Tree') return;

	const { name, parent, path, next, nextPath } = e.detail;

	// const nameWithPathIfPresent = (_path, _name) => _path
	// 	? noFrontSlash(`${_path}/${_name}`)
	// 	: noFrontSlash(_name);
	// const fileNameWithPath = next
	// 	? nameWithPathIfPresent(nextPath, next)
	// 	: nameWithPathIfPresent(path, name);
	
	const fileNameWithPath = getFilePath({ name, parent, path, next, nextPath });
	const filePath = fileNameWithPath;

	treeSelect(filePath, null, 'noSelect');

	/* TODO: add this to TreeView module
	if (found.scrollIntoViewIfNeeded) {
		const opt_center = true;
		found.scrollIntoViewIfNeeded(opt_center);
	} else {
		found.scrollIntoView({
			behavior: "smooth",
			block: "center",
		});
	}
	*/
};

export default fileSelectListener;
