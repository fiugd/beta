import ProjectOpener from './ProjectOpener.js';
import TreeMenu from './TreeMenu.js';
import Search from './Search.js';
import { htmlToElement } from '../../utils/misc.js';

let treeView, opener;


const ScrollShadow = () => {
	let scrollShadow = htmlToElement(`
		<div class="scroll-shadow">
			<style>
				.scroll-shadow {
					box-shadow: #000000 0 6px 6px -6px inset;
					height: 6px;
					position: absolute;
					top: 35px;
					left: 0;
					right: 0;
					display: none;
				}
			</style>
		</div>
	`);
	treeView.addEventListener("scroll", (event) => {
		try {
			event.target.scrollTop > 0
				? (scrollShadow.style.display = "block")
				: (scrollShadow.style.display = "none");
		} catch (e) {
			scrollShadow.style.display = "none";
		}
	});
	return scrollShadow;
};

const getTreeViewDOM = ({ showOpenService } = {}) => {
	if (opener && showOpenService) {
		opener.classList.remove("hidden");
		const treeMenuLabel = document.querySelector("#tree-menu .title-label h2");
		treeMenuLabel.innerText = "NO FOLDER OPENED";
		treeView && treeView.classList.add("nothing-open");
	} else if (opener) {
		opener.classList.add("hidden");
		treeView && treeView.classList.remove("nothing-open");
	}
	if (treeView) {
		return treeView;
	}

	treeView = document.createElement("div");
	treeView.id = "tree-view";
	opener = ProjectOpener();
	if (showOpenService) {
		const treeMenuLabel = document.querySelector("#tree-menu .title-label h2");
		treeMenuLabel.innerText = "NO FOLDER OPENED";
		treeView.classList.add("nothing-open");
	} else {
		treeView.classList.remove("nothing-open");
		opener.classList.add("hidden");
	}
	treeView.appendChild(opener);

	const explorerPane = document.body.querySelector("#explorer");
	const menu = TreeMenu();
	explorerPane.appendChild(menu);
	Search(explorerPane);
	explorerPane.appendChild(ScrollShadow(treeView));
	explorerPane.appendChild(treeView);
	explorerPane.classList.remove("pane-loading");
	
	treeView.menu = menu;

	return treeView;
};

function _TreeView(op) {
	if (op === "hide") {
		const prevTreeView = document.querySelector("#tree-view");
		if (prevTreeView) {
			prevTreeView.style.display = "none";
		}
		return;
	}
	//OH WELL?: feels kinda dirty in some senses, very reasonable in others
	//TODO: do this with stylus??
	const treeDepthStyles = (rootId, depth, ems) => new Array(depth).fill()
		.reduce((all, one, i) => [
			all,
			`/* NESTING LEVEL ${i+1} */\n`,
			`#${rootId}>.tree-leaf>.tree-child-leaves`,
			...new Array(i).fill('>.tree-leaf>.tree-child-leaves'),
			">.tree-leaf>.tree-leaf-content\n",
			`{ padding-left:${(i+2)*ems}em; }\n\n`
		].join(''), `
			#${rootId}>.tree-leaf>.tree-leaf-content { padding-left:${ems}em; }
		`);

	treeView = getTreeViewDOM();
	treeView.style.display = "";
	const treeViewStyle = htmlToElement(`
		<style>
			#tree-view {
				padding-top: 0.1em;
			}

			/* tree view dimming*/
			/*
			#tree-view {
				opacity: .7;
				transition: opacity 25s;
				padding-top: 0.1em;
			}
			#tree-view:hover, #tree-view.nothing-open {
				opacity: 1;
				transition: opacity 0.3s;
			}
			*/

			#tree-view .tree-expando:not(.hidden) + .tree-leaf-text:before {
				font-family: codicon;
				content: "\\eab4";
				font-size: 1.1em;
				margin-right: 0.4em;
				margin-left: 0;
				transform: rotate(0deg);
			}
			#tree-view .tree-expando:not(.expanded, .hidden) + .tree-leaf-text:before {
				transform: rotate(-90deg);
			}
			#tree-view .tree-leaf.file div[class*='icon-'] {
				margin-left: -0.3em;
			}
			#tree-view.dragover .tree-leaf,
			.tree-leaf.folder.dragover {
				background: #4d5254;
			}
			.tree-leaf {
				user-select: none;
			}
			.tree-leaf.hidden-leaf {
				display: none;
			}
			${treeDepthStyles("tree-view", 20, 0.9)}
		</style>
	`);
	treeView.parentNode.append(treeViewStyle);

	const treeMethods = [
		'Add', 'Delete', 'Select', 'Move', 'Rename', 'Context', 'Change', 'ClearChanged'
	].reduce((all, one) => {
			all['tree'+one] = (...args) => {
				try {
					if(!tree) return; //should keep track of this instead of blindly returning
					if(one === 'Add' && typeof args[2] === 'undefined'){
						return tree.add(args[0], null, tree.currentFolder || '');
					}
					if(one === 'ClearChanged'){
						return tree.clearChanged();
					}
					return tree[one.toLowerCase()](...args);
				} catch(e){
					console.warn(e);
				}
			}
			return all;
	}, {});
	
	return treeView;
}
export default _TreeView();