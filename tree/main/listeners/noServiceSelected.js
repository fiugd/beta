export default (event, context) => {
	const { tree: { showServiceChooser } } = context;
	showServiceChooser();
};
