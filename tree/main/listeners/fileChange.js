const listener = (treeChange) => (event) => {
	const { filePath } = event.detail;
	treeChange(filePath);
};
export default listener;
