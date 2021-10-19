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

const termContainerSrc = `
<iframe
	sandbox="${iframeSandboxPermissions}"
	src="/_/modules/terminal/index.html"
></iframe>
`.trim();

function _Terminal() {
	const termContainer = document.createElement("div");
	termContainer.classList.add("term-contain");
	termContainer.innerHTML = termContainerSrc;

	const terminalPane = document.getElementById("terminal");
	terminalPane.appendChild(termContainer);
}

export default _Terminal;
