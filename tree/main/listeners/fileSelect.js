import { noFrontSlash } from '../../utils/misc.js';

const listener = (e, context) => {
	const { type='' } = e;
	const { treeSelect } = context;
	if(e?.detail?.source === 'Explorer') return;

	const { name, path, next, nextPath } = e.detail;
	if(type === 'close' && !next){
		return;
	}
	const nameWithPathIfPresent = (_path, _name) => _path
		? noFrontSlash(`${_path}/${_name}`)
		: noFrontSlash(_name);
	const fileNameWithPath = next
		? nameWithPathIfPresent(nextPath, next)
		: nameWithPathIfPresent(path, name);

	treeSelect(fileNameWithPath, null, 'noSelect');

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

export default listener;
