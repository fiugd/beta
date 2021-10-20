import { getCurrentService } from "../../state.js";

const ChangeHandler = (doc) => {
	const { code, name, id, filename } = doc;
	const service = getCurrentService({ pure: true });

	// TODO: if handler already exists, return it
	const changeThis = (contents, changeObj) => {
		const file = setState({
			name,
			id,
			filename,
			code: contents,
			prevCode: code,
		});

		//TODO: should be using a trigger for this
		const event = new CustomEvent("fileChange", {
			bubbles: true,
			detail: {
				name, id, filePath: filename, code: contents,
				service: service ? service.name : undefined
			},
		});
		document.body.dispatchEvent(event);
	};

	return (editor, changeObj) => {
		//console.log('editor changed');
		//console.log(changeObj);
		changeThis(editor.getValue(), changeObj);
	};
};

export default ChangeHandler;
