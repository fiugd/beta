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

	const handleServiceChange = ({ storage, ui, utils }) => async (
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
			if(service.type === 'github' && `${path[0]}${path[1]}` === './'){
				path = path.slice(2);
			}

			await changesStore.setItem(path, { type: 'update', value: code });

			if (service && command === "upsert") {
				service.tree = utils.treeInsertFile(path, service.tree);
				await servicesStore.setItem(service.id + "", service);
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
			const { name } = body;

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

			const filesFromUpdate = utils.getCodeAsStorage(
				body.tree,
				body.code,
				service.name
			).map(x => `.${x.key}`);
			const filesInStore = (await filesStore.keys())
				.filter(key => key.startsWith(`./${service.name}/`));

			const binaryFiles = [];

			const filesToDelete = filesInStore
				.filter(file => !filesFromUpdate.includes(file));

			const filesToAdd = filesFromUpdate
				.filter(file => !filesInStore.includes(file));

			console.log(JSON.stringify({ filesToAdd, filesToDelete }));

			/*

			// TODO: binary files

			// update files
			for (let i = 0; i < filesToAdd.length; i++) {
				const code = '↵↵'; //TODO: should be default for file type
				await filesStore.setItem(key, );
				await providers.fileChange({
					path: filesToAdd[i],
					code,
					parent: service,
				});
			}

			// delete files
			for (let i = 0; i < filesToDelete.length; i++) {
				const key = filesToDelete[i];
				await filesStore.removeItem(key);
				await providers.fileChange({
					path: key,
					parent: service,
					deleteFile: true,
				});
			}
			*/

			// should handle more than just updates
			const changedFiles = (await changesStore.keys())
				.filter(key => key.startsWith(`./${service.name}/`));
			for(let i = 0, len=changedFiles.length; i < len; i++){
				const { type, value: code } = await changesStore.getItem(path);
				if(type !== 'update') continue;
				await providers.fileChange({ code, parent: service, path });
				await changesStore.removeItem(path);
				await filesStore.setItem(path, code);
			}

			return stringify({ result: [body] });
		} catch (error) {
			console.error(error);
			return stringify({ error });
		}
	};

	const handleServiceDelete = () => (params, event) => {
		console.log("/service/delete/:id? triggered");
		return stringify({ params, event });
	};

	class ServicesManager {
		constructor({ app, storage, providers, ui, utils }) {
			this.app = app;
			this.storage = storage;
			this.providers = providers;
			this.ui = ui;
			this.utils = utils;

			this.handlers = {
				serviceCreate: handleServiceCreate(this),
				serviceChange: handleServiceChange(this),
				serviceUpdate: handleServiceUpdate(this),
				serviceDelete: handleServiceDelete(this),
			};
		}
	}

	module.exports = {
		ServicesManager,
	};
})();
