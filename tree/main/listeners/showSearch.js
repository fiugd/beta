const listener = (event, context) => {
	const { searchProject } = context.tree;
	searchProject({ hideSearch: false }, context);
};

export default listener;

