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

const container = document.createElement('div');
container.classList.add('section', 'editor');
container.innerHTML = `
	<div class="contain">
		<iframe
			sandbox="${iframeSandboxPermissions}"
			src="/_/modules/editor/editor.html"
			style="height:100%;width:100%;border:0;"
		></iframe>
	</contain>
`.replace(/$		/gm).trim();

let attached;

function Editor() {
	const editorPane = document.getElementById("editor");
	if(editorPane && !attached){
		editorPane.append(container);
		attached = true;
		return;
	}
	debugger;
}

export default Editor;
