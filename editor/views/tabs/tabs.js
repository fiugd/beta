import { getFileType } from '../../utils/misc.js';

function log() {
	return console.log.call(
		null,
		arguments.map((x) => JSON.stringify(x, null, 2))
	);
}

function scrollToChild(child) {
	window.parent = child.parentNode;
	const parentWindowMin = parent.scrollLeft;
	const parentWindowMax = parent.scrollLeft + parent.clientWidth;
	const parentMaxScrollLeft = parent.scrollWidth - parent.clientWidth;

	const childMin = child.offsetLeft;
	const childMax = child.offsetLeft + child.clientWidth;
	const childCenter = (childMin + childMax) / 2;
	const idealScrollLeft = childCenter - parent.clientWidth / 2;

	const idealScrollMin =
		childMax > parentWindowMin && childMin < parentWindowMin
			? parent.scrollLeft - (parentWindowMin - childMin) - 20
			: undefined;

	const idealScrollMax =
		childMax > parentWindowMax && childMin < parentWindowMax
			? parent.scrollLeft + (childMax - parentWindowMax) + 20
			: undefined;

	if (childMin === 0) {
		parent.scrollTo({
			top: 0,
			left: 0,
			behavior: "smooth",
		});
		return;
	}

	if (childMax === parent.scrollWidth) {
		parent.scrollTo({
			top: 0,
			left: parentMaxScrollLeft,
			behavior: "smooth",
		});
		return;
	}

	const childVisible =
		childMin >= parentWindowMin && childMax <= parentWindowMax;

	if (childVisible) return;

	if (idealScrollMin) {
		console.log({ idealScrollMin });
		parent.scrollTo({
			top: 0,
			left: idealScrollMin,
			behavior: "smooth",
		});
		return;
	}

	if (idealScrollMax) {
		console.log({ idealScrollMax });
		parent.scrollTo({
			top: 0,
			left: idealScrollMax,
			behavior: "smooth",
		});
		return;
	}

	if (idealScrollLeft <= 0) {
		parent.scrollTo({
			top: 0,
			left: 0,
			behavior: "smooth",
		});
		return;
	}
	if (idealScrollLeft <= parentMaxScrollLeft) {
		parent.scrollTo({
			top: 0,
			left: idealScrollLeft,
			behavior: "smooth",
		});
		return;
	}
	parent.scrollTo({
		top: 0,
		left: parentMaxScrollLeft,
		behavior: "smooth",
	});
}

const createTab = (parent, container, init) => (tabDef) => {
	const tab = document.createElement("div");
	tab.id = tabDef.id;
	tab.classList.add("tab");
	if (!init) {
		tab.classList.add("new");
	} else {
		tab.classList.remove("new");
	}
	tabDef.changed && tab.classList.add("changed");
	tabDef.touched && tab.classList.add("touched");

	let systemType, systemName, systemClass;
	if (tabDef.name.includes("system::")) {
		systemType = "config";
		systemName = {
			"add-service-folder": "Open Folder",
			"connect-service-provider": "Connect to a Provider",
			"open-previous-service": "Open Previous Service",
			"open-settings-view": "Settings",
		}[tabDef.name.replace("system::", "")];
		systemClass = "italic";
	}
	tab.title = `${tabDef.parent ? (tabDef.parent+'/') : ''}${tabDef.name.split('/').pop()}`;
	const fileType = getFileType(tabDef.name);
	const icon = systemType || fileType.icon || fileType;
	tab.innerHTML = `
		<span style="pointer-events: none;"
			class="${systemClass ? systemClass + " " : ""}icon-${icon}"
		>${systemName || tabDef.name.split('/').pop()}</span>
		<div class="tab-close">
			<div class="monaco-action-bar animated">
				<ul class="actions-container" role="toolbar" aria-label="Tab actions">
					<li class="action-item" role="presentation">
						<a class="action-label icon close-editor-action"
							data-name="${tabDef.name}"
							data-parent="${tabDef.parent||''}"
							role="button"
							title="Close"
						>
						</a>
					</li>
				</ul>
			</div>
		</div>
	`;
	parent.appendChild(tab);
	scrollToChild(tab);
	if (tabDef.active) {
		tab.classList.add("active");
		tab.classList.remove("new");
	}

	const remainingTabs = Array.from(parent.querySelectorAll(".tab"));
	if (remainingTabs.length) {
		container.classList.remove('empty');
	} else {
		container.classList.add('empty');
	}
};

const updateTab = (parent, container) => (tabDef) => {
	const child = parent.querySelector("#" + tabDef.id);
	if (!child) return;
	if (!tabDef.active && child.classList.contains("active")) {
		child.classList.remove("active");
	}
	if (tabDef.active && !child.classList.contains("active")) {
		child.classList.add("active");
		scrollToChild(child);
	}
	if (tabDef.changed && !child.classList.contains("changed")) {
		child.classList.add("changed");
		scrollToChild(child);
	}
	if (!tabDef.changed && child.classList.contains("changed")) {
		child.classList.remove("changed");
	}

	if (!tabDef.touched && child.classList.contains("touched")) {
		child.classList.remove("touched");
	}
	if (tabDef.touched) {
		child.classList.add("touched");
	}
};

const removeTab = (parent, container) => async (tabDef) => {
	if(!tabDef) return console.error('attempt to remove tab without a tab definition');

	const child = parent.querySelector("#" + tabDef.id);
	child.parentNode.removeChild(child);

	const remainingTabs = Array.from(parent.querySelectorAll(".tab"));
	if (!remainingTabs.length) {
		container.classList.add('empty');
		return;
	}
	//TODO: scroll parent to put newly active tab in view
};

const scrollHorizontally = (el) =>
	function (e) {
		e = window.event || e;
		el.scrollLeft -= e.wheelDelta || -e.detail;
	};

function attachWheel(el) {
	if (!el) return;

	if (el.addEventListener) {
		el.addEventListener("mousewheel", scrollHorizontally(el), {
			passive: true,
		});
		el.addEventListener("DOMMouseScroll", scrollHorizontally(el), {
			passive: true,
		});
	} else {
		el.attachEvent("onmousewheel", scrollHorizontally(el));
	}
}

function attachDoubleClick(el, context) {
	if (!el) return;
	el.addEventListener("dblclick", (e) => {
		const { triggers } = context;
		triggers.addFileUntracked(e);
	});
}

const initTabs = (parent, container) => (tabDefArray = [], context) => {
	const _removeTab = removeTab(parent, container);
	const init = true;
	const _createTab = createTab(parent, container, init)
	Array.from(parent.querySelectorAll(".tab")).map(_removeTab);
	tabDefArray.map(_createTab);

	const THIS_DELAY_IS_STUPID = 1;
	setTimeout(() => {
		const tabs = document.querySelector("#editor-tabs");
		attachWheel(tabs);
		attachDoubleClick(tabs, context);
		const activeTab = document.querySelector("#editor-tabs-container .active");
		if (activeTab) {
			activeTab.scrollIntoView();
		}
	}, THIS_DELAY_IS_STUPID);
};

let tabsContainer;
let tabsList;
function EditorTabs(tabsArray = [{ name: "loading...", active: true }]) {
	if (tabsContainer) {
		tabsList = tabsList || tabsContainer.querySelector("#editor-tabs");
		//should not be doing this, rely on event instead!!!
		//tabsArray && initTabs(tabsList)(tabsArray);
		return tabsContainer;
	}
	tabsContainer = document.createElement("div");
	tabsContainer.id = 'tabs';
	tabsContainer.classList.add('empty');
	tabsContainer.innerHTML = `
		<style>
			#editor-tabs-container .scrollbar {
				position: absolute;
				width: 575px;
				height: 3px;
				left: 0px;
				bottom: 0px;
				background: transparent;
				right: -3px;
				width: auto;
			}
			#editor-tabs-container .slider {
				position: absolute;
				top: 0px;
				left: 0px;
				height: 3px;
				will-change: transform;
				width: 508px;
			}
			#editor-tabs-container:hover .slider {
				background: #ffffff20;
				display: none;
			}
			#editor-tabs-container .tab:not(.touched):not(.changed) > span {
				font-style: italic;
			}
			#tabs.empty #editor-tabs-container {
				background: transparent;
			}
		</style>
		<div class="scrollable hide-native-scrollbar" id="editor-tabs-container">
			<div id="editor-tabs" class="row no-margin">
			</div>
			<div class="invisible scrollbar horizontal fade">
				<div class="slider">
				</div>
			</div>
		</div>
	`;

	tabsList = tabsList || tabsContainer.querySelector("#editor-tabs");

	/*

	TODO:
	when tabs change, update the width of slider
	when editor tabs scroll position changes, move the slider with it
	when this is done, change from display: none

	ALSO:
	there is something very screwed up happening with tab bar
	for example, when I try to add padding or margin to left/right of tabs, left works and right fails
	I have tried mulitple ways of fixing this, including first-child/last-child and wrapping in a container div
	nothing seems to work and I don't have time for the frustration right now

	one idea I have not tried is to put padding divs to the left and right of tabs list; maybe later
	*/

	const operations = {
		initTabs: initTabs(tabsList, tabsContainer),
		createTab: createTab(tabsList, tabsContainer),
		updateTab: updateTab(tabsList, tabsContainer),
		removeTab: removeTab(tabsList, tabsContainer),
	};

	tabsContainer.sysDocNames = {
		"add-service-folder": "Open Folder",
		"connect-service-provider": "Connect to a Provider",
		"open-previous-service": "Open Previous Service",
		"open-settings-view": "Settings",
	};

	tabsContainer.operations = operations;

	function clearLastTab({ tabs, removeTab }) {
		if(!tabs.length) return;
		const lastTab = tabs[tabs.length - 1];
		if (lastTab.changed || lastTab.touched || lastTab.name.includes("Untitled-"))
			return;
		tabs = tabs.filter((t) => t.id !== lastTab.id);
		removeTab(lastTab);
		return { tabs, cleared: lastTab };
	}

	function getTabsToUpdate(filePath) {
		const name = filePath?.split('/').pop();
		const tabsToUpdate = [];
		let foundTab;
		for (var i = 0, len = tabs.length; i < len; i++) {
			if (name === tabs[i].name) {
				foundTab = tabs[i];
			}
			// update: if tab exists and not active, activate it
			if (name === tabs[i].name && !tabs[i].active) {
				tabs[i].active = true;
				tabsToUpdate.push(tabs[i]);
			}
			// update: remove active state from active tab
			if (name !== tabs[i].name && tabs[i].active) {
				delete tabs[i].active;
				tabsToUpdate.push(tabs[i]);
			}
			if (!foundTab) {
			}
		}
		return { foundTab, tabsToUpdate };
	}

	let tabs = [];
	tabsContainer.api = {
		list: () => tabs,
		find: (x) => tabs.find(x),
		update: (t) => tabs = t,
		push: (t) => tabs.push(t),
		clearLast: clearLastTab,
		toUpdate: getTabsToUpdate
	};

	return tabsContainer;
}

export default EditorTabs;

