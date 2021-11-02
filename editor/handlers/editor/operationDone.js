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
	
	const [service] = result;
	service.state.selected = {
		name: service.state.selected.split('/').pop(),
		path: `${service.name}/${service.state.selected}`
	}

	if (['read', 'update'].includes(op)) {
		const [selected] = service.state;
		fileSelect({ detail: selected }, context);
		return;
	}
};

export default operationDoneHandler;
