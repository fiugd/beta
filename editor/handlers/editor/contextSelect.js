const paste = async () => {
	window.Editor.focus();
	const toPaste = await navigator.clipboard.readText();
	window.Editor.replaceSelection(toPaste);
};
const cutSelected = () => {
	window.Editor.focus();
	const copied = window.Editor.getSelection();
	navigator.clipboard.writeText(copied);
	window.Editor.replaceSelection('');
};
const copySelected = () => {
	const copied = window.Editor.getSelection();
	navigator.clipboard.writeText(copied);
};
	
const contextMenuSelectHandler = (e, { triggerEvent }) => {
	const { which, parent, data } = e.detail || {};
	if (parent !== "Editor") {
		//console.log('Editor ignored a context-select event');
		return;
	}
	const contextCommands = {
		"Cut": cutSelected,
		"Copy": copySelected,
		"Paste": paste,
		"Command Palette": () => triggerEvent("ui", "commandPalette")
	};
	const handler = contextCommands[which];
	if(!handler) return console.error(`Unrecognized context menu command: ${which}`);
	handler({ parent, data });
};

export default contextMenuSelectHandler;
