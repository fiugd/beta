const handler = (e, { tabs }) => {
	const {
		initTabs,
		createTab,
		updateTab,
		removeTab,
	} = tabs.operations;

	const { filePath } = event.detail;
	const { foundTab } = tabs.api.toUpdate(filePath);
	if (!foundTab) {
		console.error(`Could not find a tab named ${filePath} to update`);
		return;
	}
	foundTab.changed = true;
	[foundTab].map(updateTab);
	//localStorage.setItem("tabs/"+(service?.name||''), JSON.stringify(tabs));
};

export default handler;
