/*
NOTE: this might just be a fileSelect in disguise...
*/

const serviceSwitchListener = async (event, { getCurrentFile, getCurrentService, switchEditor }) => {
	const fileName = getCurrentFile();
	//sessionStorage.setItem("editorFile", fileName);
	const currentService = getCurrentService({ pure: true });
	const fileBody = currentService.code.find((x) => x.name === fileName);
	if (!fileBody) {
		console.error(
			`[editor:serviceSwitch] Current service (${currentService.id}:${currentService.name}) does not contain file: ${fileName}`
		);
		switchEditor(null, "nothingOpen");
		return;
	}
	switchEditor(fileName, null, fileBody.code);
};

export default serviceSwitchListener;
