async function getHandler(args){
	const { stores } = this;
	const { path, query } = args;

	const content = await stores.files.getItem(path);

	return JSON.stringify({
		stores: Object.keys(stores),
		path, query, content
	}, null, 2);
}

class WorkerRewrite {
	constructor({ storage }){
		this.stores = storage.stores;

		this.handlers = {
			get: getHandler.bind(this)
		};
	}
}

export { WorkerRewrite };
