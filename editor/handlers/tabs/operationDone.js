const operationDoneHandler = (e, { tabs: container }) => {
	const {
		initTabs,
		createTab,
		updateTab,
		removeTab,
	} = container.operations;

	const { op, id, result = [] } = event.detail || {};
	if(result?.error) return;
	if (!["read", "update"].includes(op) || !id) return;

	const { opened=[], changed=[] } = result[0]?.state || {};
	let tabs = opened.map(({ name, order }) => ({
		id: "TAB" + Math.random().toString().replace("0.", ""),
		name: name.split('/').pop(),
		parent: name.split('/').slice(0,-1).join('/'),
		touched: changed.includes(name),
		changed: changed.includes(name),
		active: order === 0,
		//systemDocsName: sysDocNames[name.replace("system::", "")]
	}));
	initTabs(tabs);
};

export default operationDoneHandler;


