const fileSelectHandler = (e, { tabs: container }) => {
	const {
		initTabs,
		createTab,
		updateTab,
		removeTab,
	} = container.operations;
	
	const { sysDocNames } = container;

	let { name, changed, parent, path } = event.detail;
	if(path) parent = path;

	if(!parent && name?.includes('/')){
		parent = name.split('/').slice(0,-1).join('/');
		name = name.split('/').pop();
	}
	if(name?.includes('system::')){
		tabs.update(tabsApi.list() || []);
	}
	if(!tabs.list()) return;
	let systemDocsName;
	if (name?.includes("system::")) {
		systemDocsName = sysDocNames[name.replace("system::", "")];
	}
	let id = "TAB" + Math.random().toString().replace("0.", "");

	let { tabsToUpdate, foundTab } = tabs.toUpdate(parent
		? `${parent}/${name}`
		: name
	);
	if (foundTab) {
		tabsToUpdate.map(updateTab);
		//localStorage.setItem("tabs/"+(service?.name||''), JSON.stringify(tabs.list()));
		return;
	}

	createTab({
		name,
		parent,
		active: true,
		id,
		changed,
	});
	const shouldClearTab = !name.includes("Untitled-");

	const { cleared, tabs: newTabs } = (shouldClearTab && tabs.clearLast({
		tabs, removeTab 
	})) || {};
	if (newTabs) tabs = newTabs;
	if (cleared) tabsToUpdate = tabsToUpdate.filter((t) => t.id !== cleared.id);
	tabsToUpdate.map(updateTab);
	tabs.push({
		name,
		parent,
		systemDocsName,
		active: true,
		id,
		changed,
	});
	//localStorage.setItem("tabs/"+(service.get()?.name||''), JSON.stringify(tabs));
};

export default fileSelectHandler;
