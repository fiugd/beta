const handler = (event, context) => {
	const { status } = context;
	const {
		setLineNumber,
		setColNumber,
		setTabSize,
		setDocType
	} = status.operations;

	const { detail } = event;
	const { line, column } = detail;
	setLineNumber(line);
	setColNumber(column);
}

export default handler;

