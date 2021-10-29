const handler = (event, context) => {
	const { status } = context;
	const {
		setLineNumber,
		setColNumber,
		setTabSize,
		setDocType
	} = status.operations;
	//console.log('status bar listen for fileChange');
}

export default handler;

