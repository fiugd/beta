import showSearch from './showSearch.js';

const uiListener = (event, context) => {
	const { searchProject } = context.tree;
	const { detail = {} } = event;
	const { operation } = detail;
	if (operation === "searchProject") {
		return showSearch(event, context);
	}
	return;
};

export default uiListener;
