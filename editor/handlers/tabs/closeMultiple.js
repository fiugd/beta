const closeMultiple = (removeTab, triggers, which) => ({ tab }) => {
	let tabsToRemove = [];
	let tabToSelect;
	let fileToClose;
	if(which === 'all'){
		fileToClose = tabs.find(x => x.active);
		fileToClose.path = fileToClose.parent;
		tabsToRemove = clone(tabs);
		tabs = [];
	}
	if(which === "others" && tab){
		tabsToRemove = tabs.filter((t) => t.id !== tab.id);
		tabs = tabs.filter((t) => t.id === tab.id);
		if(!tab.active){
			tabToSelect = clone(tab);
			tabToSelect.path = tabToSelect.parent;
		}
	}
	localStorage.setItem(
		"tabs/"+(service?.name||''),
		JSON.stringify(tabs)
	);
	tabsToRemove.forEach(removeTab);
	if(tabToSelect) triggers.fileSelect({ detail: tabToSelect });
	if(fileToClose) triggers.fileClose({ detail: fileToClose });
};

/*
	TODO: still work to be done on this
	- reference the function above (old way)
	- instead of doing this all at once
		1) fire the event (to app/serviceWorker)
		2) handle the event (from app/serviceWorker)
*/
const all = {
	data: (event) => {
		return {};
	}
}
const others = {
	data: (event) => {
		return {};
	}
};

export default { all, others };
