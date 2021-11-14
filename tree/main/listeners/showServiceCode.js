const showServiceCodeListener = (event, context) => {
	const { searchProject } = context.tree;
	searchProject({ hideSearch: true }, context);
};

export default showServiceCodeListener;
