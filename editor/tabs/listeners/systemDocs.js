import fileSelect from './fileSelect.js';

const handler = (event, context) => {
	const fileSelectEvent = {
		detail: {
			name: `system::` + event.type,
		},
	};
	fileSelect(fileSelectEvent, context);
};

export default handler;
