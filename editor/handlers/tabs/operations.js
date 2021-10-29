import fileClose from './fileClose.js';

const handler = (event, context) => {
	const { tabs } = context;
	const {
		initTabs,
		createTab,
		updateTab,
		removeTab,
	} = tabs.operations;

	const { operation } = event.detail || {};
	if(!operation || !['deleteFile'].includes(operation)){
		return;
	}

	if(operation === 'deleteFile'){
		fileClose(e, context);
		return;
	}
}

export default handler;
