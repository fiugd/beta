const contextMenuHandler = (e, { triggers }) => {
	const editorDom = document.querySelector("#editor .CodeMirror");
	if (!editorDom) {
		return true;
	}
	if (!editorDom.contains(e.target)) {
		return true;
	}
	e.preventDefault();

	const listItems = [
		//"Change All Occurences",
		//"Format Selection",
		//"Format Document",
		//"seperator",
		"Cut",
		"Copy",
		"Paste",
		"seperator",
		"Command Palette",
	].map((x) => (x === "seperator" ? "seperator" : { name: x, disabled: false }));
	let data;
	try {
		data = {};
	} catch (e) {}

	if (!data) {
		console.error("some issue finding data for this context click!");
		return;
	}

	triggers.editor.contextMenuShow({
		detail: {
			x: e.clientX,
			y: e.clientY,
			list: listItems,
			parent: "Editor",
			data,
		}
	});
	return false;
};

export default contextMenuHandler;
