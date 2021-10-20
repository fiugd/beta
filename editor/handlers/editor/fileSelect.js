let firstLoad = true;

const fileSelectHandler = async (event, { getFilePath, switchEditor }) => {
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

	if(!name){
		sessionStorage.setItem("editorFile", '');
		switchEditor(null, "nothingOpen");
		return;
	}
	*/

	const fileNameWithPath = getFilePath({ name, parent, path, next, nextPath });
	const filePath = savedFileName || fileNameWithPath;

	/*
	if (!savedFileName) {
		sessionStorage.setItem("editorFile", filePath);
	}
	*/

	if (name.includes("system::") || filePath.includes("systemDoc::")) {
		switchEditor({
			filename: filePath
				.replace("system::", "")
				.replace("systemDoc::", ""),
			mode: "systemDoc"
		});
		return;
	}

	switchEditor({ filename: filePath, line, column });
};

export default fileSelectHandler;
