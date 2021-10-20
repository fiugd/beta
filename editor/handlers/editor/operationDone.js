import fileSelect from './fileSelect.js';

const operationDoneHandler = (e, context) => {
	const { messageEditor } = context;

	const { detail } = e;
	const { op, result } = (detail || {});

	const providerOps = ["provider-test", "provider-save", "provider-add-service"];
	if (providerOps.includes(op)) {
		messageEditor({
			op: op + "-done",
			result,
		});
		return;
	}

	if (['read', 'update'].includes(op)) {
		const selected = result[0]?.state?.selected;
		fileSelect({ detail: selected }, context);
		return;
	}
};

export default operationDoneHandler;

