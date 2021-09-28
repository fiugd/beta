function getHandler(args){
	const { stores } = this;
	console.log({
		args,
		stores: Object.keys(stores)
	})
	return 'this is the worker rewrite handler';
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
