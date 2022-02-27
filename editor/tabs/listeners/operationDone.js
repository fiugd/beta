const handler = (e, context) => {
	const {tabs:container} = context;
	const {
		initTabs,
		createTab,
		updateTab,
		removeTab,
	} = container.operations;

	const { op, id, result = [] } = event.detail || {};
	if(result?.error) return;
	if (!["read", "update"].includes(op) || !id) return;

	const { opened=[], changed=[], singleFileMode } = result[0]?.state || {};
	let tabs = opened.map(({ name, order }) => ({
		id: "TAB" + Math.random().toString().replace("0.", ""),
		name: name.split('/').pop(),
		parent: name.split('/').slice(0,-1).join('/'),
		touched: changed.includes(name),
		changed: changed.includes(name),
		active: order === 0,
		//systemDocsName: sysDocNames[name.replace("system::", "")]
	}));
	container.api.update(tabs);
	initTabs(tabs, context);

	const tabsEl = document.querySelector('#tabs');
	if(singleFileMode){
		tabsEl.style.display = 'none';
	} else {
		tabsEl.style.display = '';
	}
};

export default handler;
