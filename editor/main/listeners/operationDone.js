import fileSelect from './fileSelect.js';
import { initState, getCurrentService } from "../../utils/State.js"

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
		const current = getCurrentService();
		if(op === "update" && current.state.singleFileMode) return;

		const [service] = result;
		// service.state.selected = {
		// 	name: service.state.selected.split('/').pop(),
		// 	path: `${service.name}/${service.state.selected}`
		// };
		/* START DUMB */
		initState([service], service);
		// setCurrentFile({
		// 	filePath: service.state.selected.path
		// });
		/* END DUMB */
		const { selected, singleFileMode } = service.state;
		fileSelect({ detail: selected, singleFileMode }, context);

		return;
	}
};

export default operationDoneHandler;
