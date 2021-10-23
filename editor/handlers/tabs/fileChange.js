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

const handler = (e, { tabs }) => {
	const {
		initTabs,
		createTab,
		updateTab,
		removeTab,
	} = tabs.operations;

	const { filePath } = event.detail;
	const { foundTab } = getTabsToUpdate(filePath);
	if (!foundTab) {
		console.error(`Could not find a tab named ${filePath} to update`);
		return;
	}
	foundTab.changed = true;
	[foundTab].map(updateTab);
	//localStorage.setItem("tabs/"+(service?.name||''), JSON.stringify(tabs));
};

export default handler;
