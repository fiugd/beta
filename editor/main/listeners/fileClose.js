const fileClose = (e, { getCurrentFile, getFilePath, switchEditor }) => {
	const { name, parent, path, next, nextPath } = e.detail;
	if(!next){
		switchEditor({ mode: "nothingOpen" });
		return;
	}

	//TODO: shouldn't this be fileSelect handler after this point?

	if(next && next.includes("system::")) {
		switchEditor({
			filename: next.replace("system::", ""),
			mode: "systemDoc"
		});
		return;
	}
	const currentFile = getCurrentFile();
	if(next === currentFile) return;

	const filename = getFilePath({ name, parent, path, next, nextPath });
	switchEditor({ filename });
};

export default fileClose;
