import fileSelect from './fileSelect.js';

const operationDoneHandler = (e, context) => {
	const { messageEditor, initState } = context;

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
		const [service] = result;
		service.state.selected = {
			name: service.state.selected.split('/').pop(),
			path: `${service.name}/${service.state.selected}`
		};
		initState([service], service);
		fileSelect({ detail: service.state.selected }, context);
		return;
	}
};

export default operationDoneHandler;
