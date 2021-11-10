const listener = (event, context) => {
	const { searchProject } = context.tree;
	const { detail = {} } = event;
	const { operation } = detail;
	if (operation !== "searchProject") {
		return;
	}
	searchProject({ showSearch });
};

export default listener;
