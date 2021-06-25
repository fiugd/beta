(() => {
	const stringify = o => JSON.stringify(o,null,2);

	const handleServiceCreate = ({ app, storage, providers }) => async (
		params,
		event
	) => {
		const servicesStore = storage.stores.services;
		const filesStore = storage.stores.files;

		// event.request.arrayBuffer()
		// event.request.blob()
		// event.request.json()
		// event.request.text()
		// event.request.formData()
		const { id } = params;

		if (id === "provider") return await providers.createServiceHandler(event);

		const { name } = (await event.request.json()) || {};

		if (!id) return stringify({ params, event, error: "id required for service create!" });
		if (!name) return stringify({ params, event, error: "name required for service create!" });

		console.log("/service/create/:id? triggered");
		//return stringify({ params, event });

		// create the service in store 
		await servicesStore.setItem(id + "", {
			name,
			id,
			tree: {
				[name]: {
					".templates": {
						"json.html": {},
					},
					"package.json": {},
				},
			},
		});
		filesStore.setItem(`./${name}/package.json`, {
			main: "package.json",
			comment: "this is an example package.json",
		});
		filesStore.setItem(
			`./${name}/.templates/json.html`,
			`
				<html>
						<p>basic json template output</p>
						<pre>{{template_value}}</pre>
				</html>
				`
		);

		// make service available from service worker (via handler)
		await app.addServiceHandler({ name, msg: "served from fresh baked" });

		// return current service
		const services = storage.defaultServices();

		return stringify({
			result: {
				services: [services.filter((x) => Number(x.id) === 777)],
			}
		});
	};

	const handleServiceChange = ({ storage, ui, utils, templates }) => async (
		params,
		event
	) => {
		const servicesStore = storage.stores.services;
		const filesStore = storage.stores.files;
		const changesStore = storage.stores.changes;
		let jsonData;
		try {
			const clonedRequest = event.request.clone();
			jsonData = await clonedRequest.json();
		} catch (e) {}

		let fileData;
		try {
			if (!jsonData) {
				const formData = await event.request.formData();
				jsonData = JSON.parse(formData.get("json"));
				fileData = formData.get("file");
			}
		} catch (e) {}

		try {
			let { path, code, command, service: serviceName } = jsonData;
			if (fileData) {
				code = fileData || "";
			}
			if (serviceName && serviceName === ui.name)
				return ui.change({ path, code, command, service });

			const service = await servicesStore.iterate((value, key) => {
				if (value.name === serviceName) return value;
				return;
			});

			// github services don't store files with ./ prepended
			// and also this should be done through provider...
			// also, would expect to not change the file, instead add a change in changes table
			// ^^ and restore that on read
			if(service.type === 'github' && `${path.slice(0,2)}` === './'){
				path = path.slice(2);
			}

			await changesStore.setItem(path, {
				type: 'update',
				value: code,
				service: (() => {
					const { tree, ...rest } = service;
					return rest;
				})()
			});

			if (service && command === "upsert") {
				service.tree = utils.treeInsertFile(path, service.tree);
				await servicesStore.setItem(service.id + "", service);
			}

			if(path.includes('/.templates/')){
				await templates.refresh();
			}

			const metaData = () => ""; //TODO
			return stringify({
				result: {
					path,
					code: fileData ? metaData(fileData) : code,
				},
			});
		} catch (error) {
			return stringify({ error });
		}
	};

	const handleServiceGetChanges = ({ storage, ui, utils, templates }) => async (
		params,
		event,
		query
	) => {
		const { flattenObject } = utils;

		const servicesStore = storage.stores.services;
		const filesStore = storage.stores.files;
		const changesStore = storage.stores.changes;

		const { cwd } = query;

		let service;
		cwd && await servicesStore.iterate((value, key) => {
			const { tree } = value;
			const flattened = flattenObject(tree);
			if(flattened.includes(cwd)){
				service = value.name;
				return true;
			}
		});

		const changes = [];
		const changesKeys = await changesStore.keys();
		for(let i=0, len=changesKeys.length; i<len; i++){
			const key = changesKeys[i];
			const value = await changesStore.getItem(key);
			const parent = value?.service?.name;
			if(!parent) continue;
			if(service && parent !== service) continue;

			changes.push({
				fileName: key,
				...value,
				original: await filesStore.getItem(key)
			});
		}

		try {
			return stringify({
				changes,
				cwd,
			});
		} catch (error) {
			return stringify({ error });
		}
	};

	const handleServiceUpdate = ({ storage, providers, ui, utils }) => async (
		params,
		event
	) => {
		const servicesStore = storage.stores.services;
		const filesStore = storage.stores.files;
		const changesStore = storage.stores.changes;

		try {
			const { id } = params;
			const body = await event.request.json();
			const { name, operation } = body;

			const isMoveOrRename = operation?.name?.includes('rename') || operation?.name?.includes('move');
			const isCopy = operation?.name?.includes('copy')
			if( isMoveOrRename || isCopy ){
				const service = await servicesStore.getItem(id + "");

				const filesFromService = (await filesStore.keys())
					//.filter(key => key.startsWith(`${service.name}/`));
					.filter(key => key.startsWith(`./${service.name}/`));	

				body.code = [];
				for(var i=0, len=filesFromService.length; i < len; i++){
					const key = filesFromService[i];
					const filename = operation.target.endsWith('/')
						? operation.source.split('/').pop()
						: '';
					const update = await filesStore.getItem(key);
					const renameKey = (key, force) => {
						if(!isMoveOrRename && !force) return key;
						return key
							.replace(
								//`${service.name}/${operation.source}`,
								//`${service.name}/${operation.target}`
								`./${service.name}/${operation.source}`,
								`./${service.name}/${operation.target}${filename}`
							);
					};
					const copyFile = () => {
						if(!key.includes(`./${service.name}/${operation.source}`)) return;
						const copiedFile = {
							name: operation.target.split('/').pop(),
							update,
							path: renameKey(key, 'force')
								.replace(/^\./, '')
						};
						body.code.push(copiedFile);
					};
					body.code.push({
						name: key.split('/').pop(),
						update,
						path: renameKey(key)
							.replace(/^\./, '')
					});
					isCopy && copyFile();
				}

				body.tree = service.tree;
				const getPosInTree = (path, tree) => ({
					parent: path.split('/')
						.slice(0, -1)
						.reduce((all, one) => {
							all[one] = all[one] || {};
							return all[one]
						}, body.tree),
					param: path.split('/').pop()
				});
				const sourcePos = getPosInTree(`${service.name}/${operation.source}`, body.tree);
				const targetPos = getPosInTree(`${service.name}/${operation.target}`, body.tree);
				targetPos.parent[targetPos.param || sourcePos.param] = sourcePos.parent[sourcePos.param];

				if(isMoveOrRename){
					delete sourcePos.parent[sourcePos.param];
				}
			}

			const parsedCode =
				!Array.isArray(body.code) && utils.safe(() => JSON.parse(body.code));
			if (parsedCode && parsedCode.tree) {
				body.tree = parsedCode.tree;
				body.code = parsedCode.files;
			}

			if (id === ui.id || id === ui.id.toString())
				return ui.update({ service: body });

			const preExistingService =
				(await servicesStore.getItem(id + "")) || {};

			const service = {
				...preExistingService,
				...{
					name,
					tree: body.tree,
				},
			};

			if (!service.name) {
				console.error("cannot set meta store item without name");
				return;
			}
			await servicesStore.setItem(id + "", service);

			const filesFromUpdateTree = utils
				.keepHelper(body.tree, body.code)
				//.map(x => x.startsWith('/') ? x.slice(1) : x);
				.map(x => `.${x}`);

			const filesInStore = (await filesStore.keys())
				.filter(key => key.startsWith(`./${service.name}/`));

			// TODO: binary files
			const binaryFiles = [];

			const filesToDelete = filesInStore
				.filter(file => !filesFromUpdateTree.includes(file));
			for (let i = 0, len = filesToDelete.length; i < len; i++) {
				const parent = service;
				const path = filesToDelete[i];
				await filesStore.removeItem(path);
				await providers.fileChange({ path, parent, deleteFile: true });
			}

			const filesToAdd = filesFromUpdateTree
				.filter(file => !filesInStore.includes(file));
			for (let i = 0, len = filesToAdd.length; i < len; i++) {
				const path = filesToAdd[i];
				const fileUpdate = body.code.find(x => `.${x.path}` === path);
				const parent = service;
				let fileUpdateCode;
				if(fileUpdate?.update){
					fileUpdateCode = fileUpdate.update;
					delete fileUpdate.update;
				}
				const code = fileUpdateCode || ''; //TODO: if not in update, default for file
				await providers.fileChange({ path, code, parent });

				//TODO: I think this is a problem, not sure...
				//files get written with blank string and dot in front of name
				await filesStore.setItem(path, code);
			}

			const changedFiles = (await changesStore.keys())
				//.filter(key => key.startsWith(`${service.name}/`));
				.filter(key => key.startsWith(`./${service.name}/`));
			for(let i = 0, len=changedFiles.length; i < len; i++){
				const parent = service;
				const path = changedFiles[i];
				const { type, value: code } = await changesStore.getItem(path);
				if(type !== 'update') continue;
				await providers.fileChange({ path, code, parent });
				await changesStore.removeItem(path);
				await filesStore.setItem(path, code);
			}
			
			const changed = (await changesStore.keys())
					.filter(x => x.startsWith(`${service.name}`))
					.map(x => x.split(service.name+'/')[1]);
			const opened = (await changesStore.getItem(`state-${service.name}-opened`)) || [];
			const selected = (opened.find(x => x.order === 0)||{}).name || '';
			return stringify({
				result: [{
					id: service.id,
					name: service.name,
					code: body.code,
					tree: body.tree,
					state: { opened, selected, changed },
					treeState: {
						expand: (await changesStore.getItem(`tree-${service.name}-expanded`)) || [],
						select: selected,
						changed,
						new: []
					}
				}]
			});
		} catch (error) {
			console.error(error);
			const { stack, message } = error;
			return stringify({ error: { message, stack } });
		}
	};

	const handleServiceDelete = () => (params, event) => {
		console.log("/service/delete/:id? triggered");
		return stringify({ params, event });
	};

	class ServicesManager {
		constructor({ app, storage, providers, templates, ui, utils }) {
			this.app = app;
			this.storage = storage;
			this.providers = providers;
			this.templates = templates;
			this.ui = ui;
			this.utils = utils;

			this.handlers = {
				serviceCreate: handleServiceCreate(this),
				serviceChange: handleServiceChange(this),
				serviceGetChanges: handleServiceGetChanges(this),
				serviceUpdate: handleServiceUpdate(this),
				serviceDelete: handleServiceDelete(this),
			};
		}
	}

	module.exports = {
		ServicesManager,
	};
})();
