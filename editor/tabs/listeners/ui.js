const handler = (e, { tabs }) => {
	const { updateTab } = tabs.operations;
	const { triggers } = tabs;

	const { fileSelect } = triggers;
	const { detail } = event;
	const { operation } = detail;
	const doHandle = {
		prevDocument: () => {
			// TODO: determine what tab is previous
			// fileSelect it
			console.warn("prevDocument: not implemented!");
		},
		nextDocument: () => {
			// TODO: determine what tab is next
			// fileSelect it
			console.warn("nextDocument: not implemented!");
		},
	}[operation];
	if (!doHandle) return;
	doHandle();
};

export default handler;
