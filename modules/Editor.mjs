const iframeSandboxPermissions = [
	"allow-same-origin",
	"allow-scripts",
	"allow-popups",
	"allow-modals",
	"allow-downloads",
	"allow-forms",
	"allow-top-navigation",
	"allow-popups-to-escape-sandbox"
].join(' ');

function Editor() {
	const editorPane = document.getElementById("editor");
	editorPane.innerHTML = `
		<iframe
			sandbox="${iframeSandboxPermissions}"
			src="/_/modules/editor/editor.html"
			style="height:100%;width:100%;border:0;"
		></iframe>
	`.replace(/$		/gm).trim();
}

export default Editor;
