const noServiceSelectedListener = (event, context) => {
	const { tree: { showServiceChooser } } = context;
	showServiceChooser();
};

export default noServiceSelectedListener;