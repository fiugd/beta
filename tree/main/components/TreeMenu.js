let projectName;
const updateTreeMenu = ({ title, project }) => {
	const treeMenu = document.querySelector("#explorer #tree-menu");
	const titleEl = treeMenu.querySelector(".title-label h2");
	const explorerActions = document.querySelector(
		"#explorer .actions-container"
	);
	if (title && title.toLowerCase() === "search") {
		explorerActions.style.display = "none";
	} else {
		explorerActions.style.display = "";
	}
	if (title) {
		titleEl.setAttribute("title", title);
		titleEl.innerText = title;
		return;
	}
	titleEl.setAttribute("title", project || projectName || "");
	titleEl.innerText = project || projectName || "";
	if (project) {
		projectName = project;
	}
};

let _treeMenu;
const TreeMenu = () => {
	if (_treeMenu) return _treeMenu;

	_treeMenu = document.createElement("div");
	_treeMenu.id = "tree-menu";
	_treeMenu.classList.add("row", "no-margin");
	const menuInnerHTML = `
		<style>
			#tree-menu .title-actions .action-item a {
				color: inherit;
				outline: none;
			}
		</style>
		<div class="title-label">
			<h2 title=""></h2>
		</div>
		<div class="title-actions">
			<div class="monaco-toolbar">
					<div class="monaco-action-bar animated">
						<ul class="actions-container">
								<li class="action-item">
									<a class="action-label codicon explorer-action codicon-new-file" role="button" title="New File">
									</a>
								</li>
								<li class="action-item">
									<a class="action-label codicon explorer-action codicon-new-folder" role="button" title="New Folder">
									</a>
								</li>
								<li class="action-item hidden">
									<a class="action-label icon explorer-action refresh-explorer" role="button" title="Refresh Explorer">
									</a>
								</li>
								<li class="action-item hidden">
									<a class="action-label icon explorer-action collapse-explorer" role="button" title="Collapse Folders in Explorer">
									</a>
								</li>
								<li class="action-item hidden">
									<div class="monaco-dropdown">
										<div class="dropdown-label">
											<a class="action-label codicon codicon-toolbar-more" tabindex="0" role="button" aria-haspopup="true" aria-expanded="false" title="Views and More Actions..."></a>
										</div>
									</div>
								</li>
						</ul>
					</div>
			</div>
		</div>
	`;
	_treeMenu.addEventListener(
		"click",
		(e) => {
			if (!_treeMenu.contains(e.target)) return;
			if (
				e.target.tagName === "A" &&
				e.target.className.includes("codicon-toolbar-more")
			) {
				console.warn("toolbar-more: not implemented");
				e.preventDefault();
				return false;
			}
		},
		{ passive: false }
	);
	// connectTrigger({
	// 	eventName: "new-file",
	// 	filter: (e) =>
	// 		_treeMenu.contains(e.target) &&
	// 		e.target.tagName === "A" &&
	// 		e.target.title === "New File",
	// });
	// connectTrigger({
	// 	eventName: "new-folder",
	// 	filter: (e) =>
	// 		_treeMenu.contains(e.target) &&
	// 		e.target.tagName === "A" &&
	// 		e.target.title === "New Folder",
	// });
	_treeMenu.innerHTML = menuInnerHTML;
	_treeMenu.update = updateTreeMenu;
	return _treeMenu;
};

export default TreeMenu;