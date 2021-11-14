const fileChangeListener = (treeChange) => (event) => {
	const { filePath } = event.detail;
	treeChange(filePath);
};
export default fileChangeListener;
