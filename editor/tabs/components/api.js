let tabs;

const clearLastTab = (operations) => () => {
	if(!tabs.length) return;
	const lastTab = tabs[tabs.length - 1];
	if (
		lastTab.changed ||
		lastTab.touched ||
		lastTab.name.includes("Untitled-")
	) return;

	tabs = tabs.filter((t) => t.id !== lastTab.id);
	operations.removeTab(lastTab);
	//tabs.map(operations.updateTab);
};

function getTabsToUpdate(filePath) {
	const name = filePath?.split('/').pop();
	const tabsToUpdate = [];
	let foundTab;
	for (var i = 0, len = tabs.length; i < len; i++) {
		const nameAndParentMatch = name === tabs[i].name &&
			filePath?.split('/').slice(0, -1).join('/') === tabs[i].parent;
		if (nameAndParentMatch) {
			foundTab = tabs[i];
		}
		// update: if tab exists and not active, activate it
		if (nameAndParentMatch && !tabs[i].active) {
			tabs[i].active = true;
			tabsToUpdate.push(tabs[i]);
		}
		// update: remove active state from active tab
		if (!nameAndParentMatch && tabs[i].active) {
			delete tabs[i].active;
			tabsToUpdate.push(tabs[i]);
		}
	}
	return { foundTab, tabsToUpdate };
}

const api = ({ operations }) => {
	tabs = [];
	return {
		list: () => tabs,
		find: (x) => tabs.find(x),
		update: (t) => tabs = t,
		push: (t) => tabs.push(t),
		clearLast: clearLastTab(operations),
		toUpdate: getTabsToUpdate
	};
};

export default api;
