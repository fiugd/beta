import fileSelect from './fileSelect.js';
import { initState } from "../../utils/State.js"

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
		fileSelect({ detail: service.state.selected }, context);

		const editorCmEl = document.querySelector('#editor-container .CodeMirror');
		if(service.state.singleFileMode){
			editorCmEl.style.height = '100%';
		} else {
			editorCmEl.style.height = '';
		}
		return;
	}
};

export default operationDoneHandler;
