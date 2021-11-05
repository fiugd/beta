const handler = (e, { tabs }) => {
	const {
		initTabs,
		createTab,
		updateTab,
		removeTab,
	} = tabs.operations;

	const { sysDocNames } = tabs;

	let { name, changed, parent, path } = event.detail;
	if(path) parent = path;
	if(!parent && name?.includes('/')){
		parent = name.split('/').slice(0,-1).join('/');
		name = name.split('/').pop();
	}

	// if(name?.includes('system::')){
	// 	tabs.api.update(tabsApi.list());
	// }

	let id = "TAB" + Math.random().toString().replace("0.", "");
	let { tabsToUpdate, foundTab } = tabs.api.toUpdate(parent
		? `${parent}/${name}`
		: name
	);

	tabsToUpdate.map(updateTab);
	if (foundTab) return;

	tabs.api.clearLast();

	const newTab = {
		name,
		parent,
		systemDocsName: name?.includes("system::")
			? sysDocNames[name.replace("system::", "")]
			: '',
		active: true,
		id,
		changed,
	}

	createTab(newTab);
	tabs.api.push(newTab);
};

export default handler;
