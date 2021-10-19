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
<style>
	.term-contain {
		position: absolute;
		left: 0;
		right: 0;
		top: 0px;
		bottom: 0px;
		overflow: hidden;
	}
	#terminal iframe {
		position: relative;
		top: 0;
		left: -1px;
		width: 100%;
		height: 100%;
		border: 0px;

		/*right: -1px;*/
		/*bottom: -1px;*/
		/*width: calc(100% + 5px);*/
		/*z-index: 100;*/
	}
	/* #terminal .term-contain { z-index: 999; } */
</style>
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
