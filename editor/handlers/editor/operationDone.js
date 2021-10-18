import fileSelectHandler from './fileSelect.js';

const operationDoneHandler = ({ switchEditor, messageEditor }) => (e) => {
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
		const fileSelect = fileSelectHandler({ switchEditor });
		fileSelect({ detail: selected });
		return;
	}
};

export default operationDoneHandler;

