import "./Listeners.mjs";

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

const attach = el => el.innerHTML = `
	<iframe
		sandbox="${iframeSandboxPermissions}"
		src="/_/modules/tree/tree.html"
		style="height:100%;width:100%;border:0;"
	></iframe>
`.replace(/$	/gm).trim();

let attached;

function Explorer() {
	const treePane = document.getElementById("explorer");
	if(treePane && !attached){
		attach(treePane);
		attached = true;
		return;
	}
}

export default Explorer;
