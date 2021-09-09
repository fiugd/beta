(function () {
	'use strict';

	let mimeTypes;
	const xfrmMimes = (() => {
		let cache;
		return (m = {}) => {
			if(!Object.entries(m).length){
				return cache || [];
			}
			cache = cache ||
				Object.entries(m).map(([contentType, rest]) => ({
					contentType,
					extensions: [],
					...rest,
				}));
			return cache;
		};
	})();
	const getMime$1 = (filename) =>
		xfrmMimes(mimeTypes).find((m) =>
			m.extensions.includes(filename.split(".").pop())
		);
	// this call may not finish before mimetypes is used
	const initMimeTypes = async () => {
		mimeTypes = await fetchJSON("https://cdn.jsdelivr.net/npm/mime-db@1.45.0/db.json");
	};

	const safe = (fn) => {
		try {
			return fn();
		} catch (e) {
			console.error("possible issue: " + fn.toString());
			return;
		}
	};

	// this flattens tree files, not structure
	const flattenTree = (tree) => {
		const results = [];
		const queue = [];
		const recurse = (branch, parent = "/") => {
			Object.keys(branch)
				.filter(x => {
					const o=branch[x];
					return !!o && typeof o === "object" && !Array.isArray(o);
				})
				.forEach((key) => {
					const children = Object.keys(branch[key]);
					if (!children || !children.length) {
						results.push({
							name: key,
							code: parent + key,
							path: parent + key,
						});
					} else {
						if (!branch[key]) {
							debugger;
						}
						queue.push(() => recurse(branch[key], `${parent}${key}/`));
					}
				});
		};
		queue.push(() => recurse(tree));
		while(queue.length > 0) queue.shift()();
		return results;
	};

	// this flattens tree structure
	// thanks: https://lowrey.me/getting-all-paths-of-an-javascript-object/
	const flattenObject = (root) =>  {
		let paths = [];
		let nodes = [{
			obj: root,
			path: []
		}];
		while (nodes.length > 0) {
			const n = nodes.pop();
			Object.keys(n.obj)
				.forEach(k => {
					const obj = n.obj[k];
					if (typeof obj !== 'object') return;
					const path = n.path.concat(k);
					paths.push(path);
					nodes.unshift({ obj, path });
				});
		}
		return paths.map(x => x.join('/'));
	};

	const keepHelper = (tree, code) => {
		const treeFlat = flattenTree(tree).map(x => x.path.replace('/.keep', ''));
		const treeFiles = code
			.map(x => x.path)
			.filter(x => !x.includes('/.keep'))
			.map(x => {
				if(x[0] === '/') return x;
				if(x.slice(0,2) === './') return x.replace(/^\.\//, '/');
				return '/' + x;
			});
		const addKeepFiles = treeFlat.reduce((all, one, i, array) => {
			const found = array.filter((x) => x !== one && x.startsWith(one));
			if(found.length === 0 && !treeFiles.includes(one)) all.push(one);
			return all;
		}, []);

		return treeFlat.map(
			x => addKeepFiles.includes(x)
				? x + '/.keep'
				: treeFiles.includes(x)
					? x
					: undefined
		).filter(x => !!x);
	};

	// this makes a service from UI look like files got from storage
	function getCodeAsStorage(tree, files, serviceName) {
		const flat = flattenTree(tree);
		for (let index = 0; index < flat.length; index++) {
			const file = flat[index];
			flat[index] = {
				key: file.path,
				value: files.find((x) => x.name === file.path.split("/").pop()),
			};
			flat[index].value.path = flat[index].value.path || file.path;
			flat[index].value.code = flat[index].value.code || file.code;
		}
		const untracked = files
			.filter((x) => x.untracked)
			.map((file, i) => ({
				key: `/${serviceName}/${file.name}`,
				value: {
					code: file.code,
					name: file.name,
					path: `/${serviceName}/`,
				},
			}));
		return [...flat, ...untracked];
	}

	const treeInsertFile = (path, tree) => {
		const splitPath = path.split("/").filter((x) => !!x && x !== ".");
		const newTree = JSON.parse(JSON.stringify(tree));
		let currentPointer = newTree;
		splitPath.forEach((x) => {
			currentPointer[x] = currentPointer[x] || {};
			currentPointer = currentPointer[x];
		});
		return newTree;
	};

	const unique$1 = (array, fn) => {
		const result = [];
		const map = new Map();
		for (const item of array) {
			if (map.has(fn(item))) continue;
			map.set(fn(item), true);
			result.push(item);
		}
		return result;
	};

	const fetchJSON = async (url, opts) => await (await fetch(url, opts)).json();

	//TODO: ??? move to provider since fetching is a provider thing
	async function fetchFileContents(filename, opts) {
		const storeAsBlob = [
			"image/",
			"audio/",
			"video/",
			"wasm",
			"application/zip",
		];
		const storeAsBlobBlacklist = ["image/svg", "image/x-portable-pixmap"];
		const fileNameBlacklist = [
			".ts", // mistaken as video/mp2t
		];
		const fetched = await fetch(filename, opts);

		//getting content type like this because can't trust server's CT headers
		const mime = getMime$1(filename) || {};
		const contentType = mime.contentType || fetched.headers.get("Content-Type");

		let _contents =
			storeAsBlob.find((x) => contentType.includes(x)) &&
			!storeAsBlobBlacklist.find((x) => contentType.includes(x)) &&
			!fileNameBlacklist.find((x) => filename.includes(x))
				? await fetched.blob()
				: await fetched.text();
		return _contents;
	}

	const notImplementedHandler = async (params, event) => {
		console.log("handler not implemented");
		return JSON.stringify({ params, event, error: "not implemented" }, null, 2);
	};

	function addBase(html, href="../../", target="_blank"){
		try {
			const baseHref = html.includes('<base')
				? ''
				: `\n<base href="${href}" target="${target}">\n`;
			if(!html.includes('<html>')){
				html = '<html>\n' + html + '\n</html>';
			}
			html = html.replace('<html>', html.includes('<head>')
				? '<html>'
				: '<html>\n\n<head></head>\n'
			);
			html = html.replace('<head>', `<head>${baseHref}`);
			return html;
		} catch(e){
			return html;
		}
	}

	var utils = {
		addBase,
		fetchJSON,
		flattenTree,
		flattenObject,
		keepHelper,
		getCodeAsStorage,
		getMime: getMime$1,
		initMimeTypes,
		notImplementedHandler,
		safe,
		treeInsertFile,
		unique: unique$1,

		// ugh
		fetchFileContents,
	};

	const getStores = () => {
		var driver = [
			localforage.INDEXEDDB,
			localforage.WEBSQL,
			localforage.LOCALSTORAGE,
		];
		const files = localforage.createInstance({
			driver,
			name: "service-worker",
			version: 1.0,
			storeName: "files",
			description: "permanent state of contents of files across projects",
		});
		const services = localforage.createInstance({
			driver,
			name: "service-worker",
			version: 1.0,
			storeName: "services",
			description: "services directory stucture, type, etc",
		});
		const providers = localforage.createInstance({
			driver,
			name: "service-worker",
			version: 1.0,
			storeName: "providers",
			description: "connects services to outside world",
		});

		const changes = localforage.createInstance({
			driver,
			name: "service-worker",
			version: 1.0,
			storeName: "changes",
			description: "keep track of changes not pushed to provider",
		});

		const handlers = localforage.createInstance({
			driver,
			name: "service-worker",
			version: 1.0,
			storeName: "handlers",
			description: "used after app has booted when service worker is updated",
		});

		return {
			files,
			services,
			providers,
			changes,
			handlers,
		};
	};

	const defaultServices = () => [];

	async function getCodeFromStorageUsingTree(tree, fileStore, serviceName) {
		const flattenTree = this.utils.flattenTree;
		// returns array of  { name: filename, code: path, path }
		const files = flattenTree(tree);

		const allFilesFromService = {};
		const fileStoreKeys = await fileStore.keys();
		for(const key of fileStoreKeys){
			if (!key.startsWith(`./${serviceName}/`)) continue;
			allFilesFromService[key] = { key, untracked: true};
		}

		for (let index = 0; index < files.length; index++) {
			const file = files[index];
			let storedFile = allFilesFromService["." + file.path];
			storedFile && (storedFile.untracked = false);
		}

		const untracked = Object.entries(allFilesFromService)
			.map(([, value]) => value)
			.filter((x) => x.untracked === true)
			.map((x) => ({
				...x,
				name: x.key.split("/").pop(),
				path: x.key,
			}));

		return [...files, ...untracked]; // aka code array
	}

	class FileSearch {
		path;
		term;
		lines;

		currentLine;
		currentColumn;

		constructor(fileStore) {
			this.fileStore = fileStore;
		}
		async load(path) {
			this.path = path;
			const file = await this.fileStore.getItem(path);
			if (typeof file !== "string") {
				this.done = true;
				return;
			}
			this.lines = file.split("\n").map((x) => x.toLowerCase());
			this.reset();
		}
		reset() {
			this.currentLine = 0;
			this.currentColumn = 0;
			this.done = false;
		}
		next(term) {
			if (this.done) return -1;
			if (!this.lines || !this.path) return -1;

			if (term.toLowerCase() !== this.term) {
				this.term = term.toLowerCase();
				this.reset();
			}
			while (true) {
				const oldIndex = this.currentColumn;
				const newIndex = (this.lines[this.currentLine] || "").indexOf(
					this.term,
					this.currentColumn
				);
				if (newIndex === -1) {
					this.currentColumn = 0;
					this.currentLine++;
					if (this.currentLine > this.lines.length - 1) {
						this.done = true;
						return -1;
					}
					continue;
				}
				this.currentColumn = newIndex + 1;
				return {
					file: this.path,
					line: this.currentLine,
					column: this.currentColumn - 1,
					text: this.lines[this.currentLine]
						// TODO: break on previous word seperator
						.slice(
							oldIndex === 0
								? Math.max(0, newIndex - 30)
								: oldIndex + this.term.length - 1,
							Math.max(newIndex + 30 + this.term.length)
						)
						.trim(),
				};
			}
		}
	}

	class ServiceSearch {
		MAX_RESULTS = 10000;
		encoder = new TextEncoder();
		timer;
		stream;
		async init({ term, include = "./", /*exclude,*/ fileStore }) {
			this.timer = {
				t1: performance.now(),
			};
			const cache = {};
			await fileStore.iterate((value, key) => {
				const isIncluded = key.startsWith(include) ||
					`./${key}`.startsWith(include);
				if (!isIncluded) return;
				cache[key] = value;
			});
			const fileStoreCache = {
				getItem: async (key) => cache[key],
			};
			const fileSearch = new FileSearch(fileStoreCache);
			let currentFileIndex = -1;

			const files = Object.keys(cache);

			//console.log(`init: ${performance.now() - this.timer.t1} ms`)

			const thisEncoder = this.encoder;
			let streamResultCount = 0;
			this.stream = new ReadableStream({
				start(controller) {},

				// if it has search term, queue up search results per occurence
				// if not, search files until one is found with search term in it
				// when done with all files, close controller
				async pull(controller) {
					while (true) {
						try {
							const result = fileSearch.next(term);
							const doneReading =
								streamResultCount >= this.MAX_RESULTS ||
								(result === -1 && currentFileIndex === files.length - 1);
							if (doneReading) {
								controller.close();
								return;
							}
							if (result === -1) {
								await fileSearch.load(files[++currentFileIndex]);
								continue;
							}
							streamResultCount++;
							controller.enqueue(
								thisEncoder.encode(JSON.stringify(result) + "\n")
							);
						} catch (e) {
							console.log(e);
							controller.close();
							return;
						}
					}
				},
			});
		}
		// does this ever need to be awaited?
		async search(handler) {
			const reader = this.stream.getReader();
			let ct = 0;
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				handler(value);
				ct++;
				if (ct === this.MAX_RESULTS) break;
			}
			this.timer.t2 = performance.now();

			// should this be returned or passed to handler?
			// or should this be avoided and result totals passed with each stream item?
			handler({
				summary: {
					timer: this.timer.t2 - this.timer.t1,
					count: ct,
				},
			});
		}
	}

	async function getFileContents({
		filename,
		filesStore,
		cache,
		storagePath,
		fetchFileContents,
	}) {
		const cachedFile = await filesStore.getItem(filename);
		let contents;

		// https://developer.mozilla.org/en-US/docs/Web/API/Request/cache
		if (cachedFile && cache !== "reload") {
			return cachedFile;
		}
		contents = await fetchFileContents(filename);
		if (storagePath) {
			filesStore.setItem(
				"." + storagePath.replace("/welcome/", "/.welcome/"),
				contents
			);
		} else {
			filesStore.setItem(filename, contents);
		}

		return contents;
	}

	//TODO: this is intense, but save a more granular approach for future
	async function fileSystemTricks({
		result,
		filesStore,
		cache,
		servicesStore,
		fetchFileContents,
	}) {
		const { safe, flattenTree } = this.utils;

		if (!safe(() => result.result[0].code.find)) {
			const parsed = JSON.parse(result.result[0].code);
			result.result[0].code = parsed.files;
			result.result[0].tree = parsed.tree;
			console.log("will weird things ever stop happening?");
			return;
		}
		const serviceJSONFile = result.result[0].code.find(
			(item) => item.name === "service.json"
		);
		if (serviceJSONFile && !serviceJSONFile.code) {
			//console.log('service.json without code');
			const filename = `./.${result.result[0].name}/service.json`;
			serviceJSONFile.code = await getFileContents({
				filename,
				filesStore,
				cache,
				fetchFileContents,
			});
		}
		if (serviceJSONFile) {
			//console.log('service.json without tree');
			let serviceJSON = JSON.parse(serviceJSONFile.code);
			if (!serviceJSON.tree) {
				const filename = `./${serviceJSON.path}/service.json`;
				serviceJSONFile.code = await getFileContents({
					filename,
					filesStore,
					cache,
					fetchFileContents,
				});
				serviceJSON = JSON.parse(serviceJSONFile.code);
			}
			result.result[0].code = serviceJSON.files;
			result.result[0].tree = {
				[result.result[0].name]: serviceJSON.tree,
			};
		}
		const len = safe(() => result.result[0].code.length);
		const flat = flattenTree(safe(() => result.result[0].tree));

		for (var i = 0; i < len; i++) {
			const item = result.result[0].code[i];
			if (!item.code && item.path) {
				const filename = "./" + item.path;
				const storagePath = (flat.find((x) => x.name === item.name) || {}).path;
				item.code = await getFileContents({
					filename,
					filesStore,
					cache,
					storagePath,
					fetchFileContents,
				});
			}
		}

		if (!result.result[0].name) {
			console.error("cannot set services store item without name");
			return;
		}
		await servicesStore.setItem(result.result[0].id + "", {
			name: result.result[0].name,
			id: result.result[0].id,
			tree: result.result[0].tree,
		});
	}

	/* TODO:
		file get runs slower here versus previous version
		is this the problem? potential issues
		local forage has to JSON.parse change store items to get the value
		changes store has to be queried before file store can be checked
		file store is huge because of policy of pulling all repo items
	*/
	function cacheFn(fn, ttl) {
		const cache = {};

		const apply = (target, thisArg, args) => {
			const key = target.name;
			cache[key] = cache[key] || {};
			const argsKey = args.toString();
			const cachedItem = cache[key][argsKey];
			if (cachedItem) return cachedItem;

			cache[key][argsKey] = target.apply(thisArg, args);
			setTimeout(() => {
				delete cache[key][argsKey];
			}, ttl);
			return cache[key][argsKey];
		};

		return new Proxy(fn, { apply });
	}

	let changeCache, fileCache, servicesCache;
	let cacheTTL = 250;
	let serviesCacheTTL = 500;
	async function getFile(path){
		const changesStore = this.stores.changes;
		const filesStore = this.stores.files;
		const servicesStore = this.stores.services;
		const { fetchFileContents } = this.utils;

		const getAllServices = async () => {
			const keys = await servicesStore.keys();
			let services = [];
			for(let i=0, len=keys.length; i<len; i++){
				const thisService = await servicesStore.getItem(keys[i]);
				services.push(thisService);
			}
			return services;
		};

		changeCache = changeCache || cacheFn(changesStore.getItem.bind(changesStore), cacheTTL);
		fileCache = fileCache || cacheFn(filesStore.getItem.bind(filesStore), cacheTTL);
		servicesCache = servicesCache || cacheFn(getAllServices, serviesCacheTTL);

		let t0 = performance.now();
		const perfNow = () => {
			const d = performance.now() - t0;
			t0 = performance.now();
			return d.toFixed(3);
		};

		const changes = await changeCache(path);
		console.log(`changes store: ${perfNow()}ms (${path})`);
		if(changes && changes.type === 'update'){
			return changes.value;
		}

		let file = await fileCache(path);
		console.log(`file store: ${perfNow()}ms (${path})`);

		if(file && file.includes && file.includes('##PLACEHOLDER##')){
			const services = await servicesCache();
			services.sort((a,b) => b.name.length - a.name.length);

			let serviceFile;
			let thisService = {};
			for(let i=0, len=services.length; i<len; i++){
				thisService = services[i];
				if(thisService.type !== 'github' || !thisService.git || !thisService.git.tree) continue;
				if(!path.startsWith(thisService.name)) continue;
				serviceFile = thisService.git.tree
					.find(x => path === `${thisService.name}/${x.path}`);
				if(serviceFile) break;
			}
			if(!serviceFile) return file;

			const getFileContents = async ({ path }) => {
				try {
					const contentUrl = 'https://raw.githubusercontent.com/{owner}/{repo}/{sha}/{path}'
						.replace('{path}', path)
						.replace('{owner}', thisService.owner)
						.replace('{repo}', thisService.repo)
						.replace('{sha}', thisService.git.sha);
					const contents = await fetchFileContents(contentUrl);
					return contents;
				} catch(e){
					console.error(e);
					return;
				}
			};

			file = await getFileContents(serviceFile);
			if(file) filesStore.setItem(path, file);
		}

		return file;
	}

	const handleServiceSearch = (fileStore) => async (params, event) => {
		const serviceSearch = new ServiceSearch();
		await serviceSearch.init({ ...params, fileStore });
		return serviceSearch.stream;
	};

	const handleServiceRead = (
		servicesStore, filesStore, fetchFileContents, ui, changesStore
	) =>
		async function (params, event) {
			//also, what if not "file service"?
			//also, what if "offline"?

			//THIS ENDPOINT SHOULD BE (but is not now) AS DUMB AS:
			// - if id passed, return that id from DB
			// - if no id passed (or * passed), return all services from DB
			const cacheHeader = event.request.headers.get("x-cache");

			if (Number(params.id) === 0) return await ui.read();

			const defaults = defaultServices();

			//if not id, return all services
			if (!params.id || params.id === "*") {
				//TODO: include Fuig Service here, too!!!
				const savedServices = [];
				await servicesStore.iterate((value, key) => {
					savedServices.push(value);
				});

				for (var i = 0, len = savedServices.length; i < len; i++) {
					const service = savedServices[i];
					const code = await this.getCodeFromStorageUsingTree(
						service.tree,
						filesStore,
						service.name
					);
					service.code = code;
				}
				//console.log({ defaults, savedServices });

				const allServices = [...defaults, ...savedServices]
					.sort((a, b) => Number(a.id) - Number(b.id))
					.map((x) => ({ id: x.id, name: x.name }));

				return JSON.stringify({
					result: this.utils.unique(allServices, (x) => Number(x.id)),
				}, null, 2);
			}

			const addTreeState = async (service) => {
				const changed = (await changesStore.keys())
					.filter(x => x.startsWith(`${service.name}`))
					.map(x => x.split(service.name+'/')[1]);
				const opened = (await changesStore.getItem(`state-${service.name}-opened`)) || [];
				const selected = (opened.find(x => x.order === 0)||{}).name || '';
				service.state = { opened, selected, changed };

				service.treeState = {
					expand: (await changesStore.getItem(`tree-${service.name}-expanded`)) || [],
					select: selected,
					changed,
					new: [], //TODO: from changes store
				};
			};

			// if id, return that service
			// (currently doesn't do anything since app uses localStorage version of this)
			await filesStore.setItem("lastService", params.id);

			const foundService = await servicesStore.getItem(params.id);
			if (foundService) {
				foundService.code = await this.getCodeFromStorageUsingTree(
					foundService.tree,
					filesStore,
					foundService.name
				);
				await addTreeState(foundService);
				return JSON.stringify({
					result: [foundService],
				}, null, 2);
			}

			//TODO (AND WARNING): get this from store instead!!!
			// currently will only return fake/default services
			const lsServices = defaultServices() || [];
			const result = {
				result:
					params.id === "*" || !params.id
						? lsServices
						: lsServices.filter((x) => Number(x.id) === Number(params.id)),
			};
			await this.fileSystemTricks({
				result,
				filesStore,
				servicesStore,
				cache: cacheHeader,
				fetchFileContents,
			});

			result.forEach(addTreeState);
			return JSON.stringify(result, null, 2);
		};

	class StorageManager {
		stores = getStores();
		defaultServices = defaultServices;
		getCodeFromStorageUsingTree = getCodeFromStorageUsingTree.bind(this);
		fileSystemTricks = fileSystemTricks.bind(this);
		getFile = getFile.bind(this);

		constructor({ utils, ui }) {
			this.utils = utils;
			this.handlers = {
				serviceSearch: handleServiceSearch(this.stores.files),
				serviceRead: handleServiceRead(
					this.stores.services,
					this.stores.files,
					utils.fetchFileContents,
					ui,
					this.stores.changes
				).bind(this),
			};
		}
	}

	// FOR NOW: instead of importing path-to-regex
	// go here https://forbeslindesay.github.io/express-route-tester/
	// enter path expression; include regex for base path, eg. (.*)/.welcome/:path?
	// get the regex and add it to this
	// DEPRECATE pathToRegex? - it's of little value, maybe, or maybe it should be moved elsewhere?
	const pathToRegex = {
		"/service/create/:id?": (() => {
			const regex = new RegExp(
				/^((?:.*))\/service\/create(?:\/((?:[^\/]+?)))?(?:\/(?=$))?$/i
			);
			return {
				match: (url) => regex.test(url),
				params: (url) => ({
					id: regex.exec(url)[2],
				}),
			};
		})(),
		"/service/read/:id?": (() => {
			const regex = new RegExp(
				/^((?:.*))\/service\/read(?:\/((?:[^\/]+?)))?(?:\/(?=$))?$/i
			);
			return {
				match: (url) => regex.test(url),
				params: (url) => ({
					id: regex.exec(url)[2],
				}),
			};
		})(),
		"/service/update/:id?": (() => {
			const regex = new RegExp(
				/^((?:.*))\/service\/update(?:\/((?:[^\/]+?)))?(?:\/(?=$))?$/i
			);
			return {
				match: (url) => regex.test(url),
				params: (url) => ({
					id: regex.exec(url)[2],
				}),
			};
		})(),
		"/service/change": (() => {
			const regex = new RegExp(
				/^((?:.*))\/service\/change(?:\/((?:[^\/]+?)))?(?:\/(?=$))?$/i
			);
			return {
				match: (url) => regex.test(url),
				params: (url) => ({
					id: regex.exec(url)[2],
				}),
			};
		})(),
		"/service/commit": (() => {
			const regex = new RegExp(
				/^((?:.*))\/service\/commit(?:\/((?:[^\/]+?)))?(?:\/(?=$))?$/i
			);
			return {
				match: (url) => regex.test(url),
				params: (url) => ({
					id: regex.exec(url)[2],
				}),
			};
		})(),
		"/service/delete/:id?": (() => {
			const regex = new RegExp(
				/^((?:.*))\/service\/delete(?:\/((?:[^\/]+?)))?(?:\/(?=$))?$/i
			);
			return {
				match: (url) => regex.test(url),
				params: (url) => ({
					id: regex.exec(url)[2],
				}),
			};
		})(),
		"/service/provider/test/:id?": (() => {
			const regex = new RegExp(
				/^((?:.*))\/service\/provider\/test(?:\/((?:[^\/]+?)))?(?:\/(?=$))?$/i
			);
			return {
				match: (url) => regex.test(url),
				params: (url) => ({
					id: regex.exec(url)[2],
				}),
			};
		})(),
		"/service/provider/create": (() => {
			const regex = new RegExp(
				/^((?:.*))\/service\/provider\/create(?:\/((?:[^\/]+?)))?(?:\/(?=$))?$/i
			);
			return {
				match: (url) => regex.test(url),
				params: (url) => ({
					id: regex.exec(url)[2],
				}),
			};
		})(),
		"/service/provider/read/:id?": (() => {
			const regex = new RegExp(
				/^((?:.*))\/service\/provider\/read(?:\/((?:[^\/]+?)))?(?:\/(?=$))?$/i
			);
			return {
				match: (url) => regex.test(url),
				params: (url) => ({
					id: regex.exec(url)[2],
				}),
			};
		})(),
		"/service/provider/update/:id?": (() => {
			const regex = new RegExp(
				/^((?:.*))\/service\/provider\/update(?:\/((?:[^\/]+?)))?(?:\/(?=$))?$/i
			);
			return {
				match: (url) => regex.test(url),
				params: (url) => ({
					id: regex.exec(url)[2],
				}),
			};
		})(),
		"/service/provider/delete/:id?": (() => {
			const regex = new RegExp(
				/^((?:.*))\/service\/provider\/delete(?:\/((?:[^\/]+?)))?(?:\/(?=$))?$/i
			);
			return {
				match: (url) => regex.test(url),
				params: (url) => ({
					id: regex.exec(url)[2],
				}),
			};
		})(),
		"/manage/:id?": (() => {
			const regex = new RegExp(
				/^((?:.*))\/manage(?:\/((?:[^\/]+?)))?(?:\/(?=$))?$/i
			);
			return {
				match: (url) => regex.test(url),
				params: (url) => ({
					id: regex.exec(url)[2],
				}),
			};
		})(),
		"/monitor/:id?": (() => {
			const regex = new RegExp(
				/^((?:.*))\/monitor(?:\/((?:[^\/]+?)))?(?:\/(?=$))?$/i
			);
			return {
				match: (url) => regex.test(url),
				params: (url) => ({
					id: regex.exec(url)[2],
				}),
			};
		})(),
		"/persist/:id?": (() => {
			const regex = new RegExp(
				/^((?:.*))\/persist(?:\/((?:[^\/]+?)))?(?:\/(?=$))?$/i
			);
			return {
				match: (url) => regex.test(url),
				params: (url) => ({
					id: regex.exec(url)[2],
				}),
			};
		})(),
		"/.welcome/:path?": (() => {
			// NOTE: this is actually the regex for (.*)/.welcome/(.*)
			const regex = new RegExp(/^((?:.*))\/\.welcome\/((?:.*))(?:\/(?=$))?$/i);
			return {
				match: (url) => regex.test(url),
				params: (url) => ({
					path: (regex.exec(url)[2] || "").split("?")[0],
					query: (regex.exec(url)[2] || "").split("?")[1],
				}),
			};
		})(),
		"/service/search/": (() => {
			const safeUrl = (u) => (u[u.length - 1] === "/" ? u : u + "/");
			const regex = new RegExp(/^((?:.*))\/service\/search\/.*$/i);
			return {
				match: (url) => regex.test(safeUrl(url)),
				params: (url, urlFull) =>
					Object.fromEntries(
						urlFull
							.split("?")
							.pop()
							.split("&")
							.map((x) => x.split("="))
					),
			};
		})(),
	};

	const _generic = ({ _handlers }) => (method) => (pathString, handler) => {
		const path = pathToRegex[pathString];

		const genericPath = (pathString) => {
			const name = pathString.replace("/:path?", "").replace("/", "");
			const regex = new RegExp(`^((?:.*))\/${name}\/((?:.*))(?:\/(?=$))?$`, "i");
			return {
				match: (url) => regex.test(url),
				params: (url) => ({
					path: (regex.exec(url)[2] || "").split("?")[0],
					query: (regex.exec(url)[2] || "").split("?")[1],
				}),
			};
		};

		let alternatePath;
		if (!path) {
			alternatePath = genericPath(pathString);
			//console.log({ alternatePath });
		}
		const foundHandler = _handlers.find(
			(x) => x.pathString === pathString && x.method === method
		);
		if (foundHandler) {
			//console.log(`Overwriting handler for ${method} : ${pathString}`);
			foundHandler.handler = handler;
			return;
		}
		_handlers.push({
			...(path || alternatePath),
			pathString,
			method,
			handler,
		});
	};

	const _expressHandler = ({ templates, storage }) => {
		const { getFile } = storage;

		//bind to base, ie. when a service is added
		return async (base, msg) => {
			await templates.refresh();

			//handle individual network request
			return async (params, event) => {
				const { path, query } = params;
				const cleanPath = decodeURI(path.replace("/::preview::/", ""));
				const previewMode = path.includes("/::preview::/");
				path.includes(".templates/");

				const filename = previewMode
					? cleanPath.split("/").pop()
					: path.split("/").pop();
				let xformedFile;

				// if headers.event-requestor is 'editor-state': let getFile know so it can track
				// try {
				// 	const xRequestor = event.request.headers.get('x-requestor');
				// 	console.log(xRequestor === 'editor-state'
				// 		? 'TODO: keep track of files when they are got by editor!'
				// 		: ''
				// 	 );
				// } catch(e){
				// 	console.error(e);
				// }
				const file = await getFile(`${base}/${cleanPath}`)
					|| await getFile(`./${base}/${cleanPath}`);

				let fileJSONString;
				try {
					if (typeof file !== "string") {
						fileJSONString = file ? JSON.stringify(file, null, 2) : "";
					} else {
						fileJSONString = file;
					}
				} catch (e) {}

				if (previewMode) {
					xformedFile = templates.convert(filename, fileJSONString);
				}

				if (previewMode && !xformedFile) {
					return templates.NO_PREVIEW;
				}

				// most likely a blob
				if (file && file.type && file.size) {
					//xformedFile because there may be a template for blob type file
					return xformedFile || file;
				}

				//TODO: need to know file type so that it can be returned properly
				return xformedFile || fileJSONString || file;
			};
		};
	};

	const _addServiceHandler = ({ storage, expressHandler, generic, swHandlers }) => async function ({ name, msg }) {
		const handlersStore = storage.stores.handlers;
		const route = `^/${name}/(.*)`;
		const handlerName = "./modules/service-worker.handler.js";
		const foundHandler = swHandlers.find((x) => x.handlerName === handlerName);
		const type = foundHandler ? foundHandler.type : 'fetch';
		const handler = foundHandler ? foundHandler.handler : 'route-handler';
		const handlerText = foundHandler ? foundHandler.handlerText : 'service-worker-handler';
		const foundExactHandler = foundHandler && swHandlers.find(
			(x) => x.handlerName === handlerName && x.routePattern === route
		);

		if (foundExactHandler) ; else {
			swHandlers.push({
				type,
				routePattern: route,
				route: new RegExp(route),
				handler,
				handlerName,
				handlerText,
			});
			// question: if handler is found in SW state, should store be updated?
			await handlersStore.setItem(route, { type, route, handlerName, handlerText });
		}

		// question: if handler is found in SW state, should service-worker.handler state be updated?
		const expHandler = await expressHandler(name, msg);
		generic("get")(`/${name}/:path?`, expHandler);
		// ^^^ this should add handler to express _handlers
	};

	const _restorePrevious = ({ storage, addServiceHandler }) => async () => {
		const servicesStore = storage.stores.services;

		const restoreToExpress = [];
		await servicesStore.iterate((value, key) => {
			let { name } = value;
			restoreToExpress.push({ name });
		});
		for (let i = 0, len = restoreToExpress.length; i < len; i++) {
			const { name } = restoreToExpress[i];
			await addServiceHandler({ name, msg: "served from reconstituted" });
		}
		// TODO: should also add routes/paths/handlers to SW which have been created but are not there already
		// could run in to problems with this ^^^ because those may be in the process of being added
	};

	const _find = ({ _handlers, restorePrevious }) => async (request) => {
		const { url, method } = request;
		const query = (() => {
			try {
				return Object.fromEntries([ ...(new URL(url)).searchParams ]);
			} catch(e){
				return {};
			}
		})();

		let found = _handlers.find((x) => {
			return method.toLowerCase() === x.method && x.match(url.split('?')[0]);
		});
		if (!found) {
			await restorePrevious();
			found = _handlers.find((x) => {
				return method.toLowerCase() === x.method && x.match(url.split('?')[0]);
			});

			if (!found) {
				return;
			}
		}

		return {
			exec: async (event) => {
				return await found.handler(
					found.params(url.split('?')[0], url),
					event,
					query
				);
			},
		};
	};

	class Router {
		_handlers=[];

		constructor({ storage, templates, swHandlers }){
			this.swHandlers = swHandlers;

			this.storage = storage;
			this.templates = templates;

			this.generic = _generic(this);
			this.get = this.generic("get");
			this.post = this.generic("post");

			this.expressHandler = _expressHandler(this);
			this.addServiceHandler = _addServiceHandler(this);
			this.restorePrevious = _restorePrevious(this);
			this.find = _find(this);

			this.restorePrevious();
		}
	}

	/*
		access this service
		terminal: read 0
		
		part of the UI system is loaded to/from cache (by the service worker)
			- service.manifest.json (which specifies many of this files if not all)
			- /_/modules - the core of the UI
			- index.html, index.bootstrap.html, index.service.test.html, settings.html
			- assets: bartok-logo.png, index.css
			- vendor files and dependencies

		part of the ui system is loaded into service worker's memory (where?)
			- files that are part of the service worker itself, ie importScripts
			- service-worker.js

		the idea with this module is to allow reading and writing to the current state of the ui system

		this also includes making sure that new versions of these files will be used when UI is refreshed

		should also include resetting back to last known good

		this does not currently include writing those files back to source control, but may in the future

	*/


	const stringify$3 = o => JSON.stringify(o,null,2);

	const UIManagerRead = async (manager) => {
		async function populateCache() {
			let tree = {};
			const code = [];
			const cache = await caches.open(cacheName);
			const keys = await cache.keys();

			for (var i = 0, len = keys.length; i < len; i++) {
				const request = keys[i];
				const split = request.url.split(/(\/fiug\/|\/shared\/|\/_\/modules\/)/);
				split.shift();
				const pathSplit = split
					.join("")
					.split("/")
					.filter((x) => !!x);
				let current = tree;
				for (var j = 0, jlen = pathSplit.length; j < jlen; j++) {
					const leafName = pathSplit[j];
					if (!leafName) {
						continue;
					}
					current[leafName] = current[leafName] || {};
					current = current[leafName];
				}

				let name = (pathSplit[pathSplit.length - 1] || "").replace("/", "");
				const _code = await (await cache.match(request)).text();
				code.push({
					name,
					code: _code,
					url: request.url,
				});
			}

			//tree = { ...tree.fiug, ...tree };
			//delete tree.fiug;

			tree.modules = tree._.modules;
			delete tree._;

			const uiCode = {
				id: manager.id,
				name: manager.name,
				tree: { [manager.name]: tree },
				code,
			};
			manager.cache = uiCode;
		}

		function applyChangedToCache(changed, cache) {
			const overlayCode = JSON.parse(JSON.stringify(cache.code));
			//TODO: should handle tree but not right now...
			Object.entries(changed).forEach(([key, value]) => {
				const changeFilename = key.split("/").pop();
				const foundCachedFile = overlayCode.find(
					(x) => x.name === changeFilename
				);
				foundCachedFile && (foundCachedFile.code = value);
			});
			return { ...cache, code: overlayCode };
		}

		if (!manager.cache) await populateCache();

		let overlayedWithChanges;
		if (Object.keys(manager.changed).length) {
			overlayedWithChanges = applyChangedToCache(
				manager.changed,
				manager.cache
			);
		}

		return stringify$3({
			result: [overlayedWithChanges || manager.cache],
		});
	};

	const UIManagerUpdate = async (manager, { service }) => {
		// update caches with changed files
		const cache = await caches.open(cacheName);
		const changesAsArray = Object.entries(manager.changed);
		for (var i = 0, len = changesAsArray.length; i < len; i++) {
			const [key, value] = changesAsArray[i];
			const fileName = key.split("/").pop();
			const managerCachedFile = manager.cache.code.find(
				(x) => x.name === fileName
			);
			const { url } = managerCachedFile;
			const { contentType } = getMime(url) || {};
			const headers = { "content-type": contentType || "" };
			const response = new Response(value, { headers });

			await cache.put(url, response);
			managerCachedFile.code = value;
		}

		// read service.manifest.json
		//const manifest = manager.cache.code.find(x => x.name === 'service.manifest.json');
		//console.log({ manifest });

		console.warn("TODO: save files to backend (if provider is available?)");
		// TODO: tell UI to refresh?

		manager.changed = {};
		await manager.changeStore.setItem("UIManagerChanged", manager.changed);

		return stringify$3({ result: [service] });
	};

	const UIManagerChange = async (manager, { path, code }) => {
		manager.changed[path] = code;

		console.warn(`changed a file at: ${path}`);

		await manager.changeStore.setItem("UIManagerChanged", manager.changed);

		return stringify$3({
			result: { path, code },
		});
	};

	const UIManagerInit = async (manager, { handlerStore, changeStore }) => {
		manager.changeStore = changeStore;
		manager.changed = (await changeStore.getItem("UIManagerChanged")) || {};

		const route = `^/${manager.name}/(.*)`;
		const handler = "./modules/service-worker.handler.js";

		// this is the service worker's handlers
		let foundHandler;
		let currentTry = 0;
		const giveUp = 5;
		const timeBetweenTries = 3000;
		while (!foundHandler && currentTry < giveUp) {
			foundHandler = handlers.find((x) => x.handlerName === handler);
			if (!foundHandler) {
				currentTry++;
				await new Promise((r) => setTimeout(r, timeBetweenTries));
			}
		}
		if (!foundHandler)
			return console.error(
				"could not find a handler to base UIManager handler on!"
			);

		const foundExactHandler =
			foundHandler &&
			handlers.find(
				(x) => x.handlerName === handler && x.routePattern === route
			);
		if (foundExactHandler) return;
		handlers.push({
			type: foundHandler.type,
			routePattern: route,
			route: new RegExp(route),
			handler: foundHandler.handler,
			handlerName: handler,
			handlerText: foundHandler.handlerText,
		});
		await handlerStore.setItem(route, {
			type: foundHandler ? foundHandler.type : "fetch",
			route,
			handlerName: handler,
			handlerText: foundHandler ? foundHandler.handlerText : 'service-worker-handler(set in ui manager)',
		});
	};

	class UIManager {
		id = 0;
		name;
		changeStore = undefined;
		cache = undefined;
		changed = undefined;

		constructor(name) {
			this.name = name;
		}
		init = (handlerStore, changeStore) =>
			UIManagerInit(this, { handlerStore, changeStore });
		read = () => UIManagerRead(this);
		update = (args) => UIManagerUpdate(this, args);
		change = (args) => UIManagerChange(this, args);
	}

	const stringify$2 = o => JSON.stringify(o,null,2);

	async function _fetchFileContents(url, opts) {
		const storeAsBlob = [
			"image/",
			"audio/",
			"video/",
			"wasm",
			"application/zip",
			'application/octet-stream'
		];
		const storeAsBlobBlacklist = ["image/svg", "image/x-portable-pixmap"];
		const fileNameBlacklist = [
			".ts", // mistaken as video/mp2t
		].map(x => new RegExp(`${x}\$`.replace(/\./, '\.')));

		const fetched = await fetch(url, opts);
		const contentType = fetched.headers.get("Content-Type");

		let _contents =
			storeAsBlob.find((x) => contentType.includes(x)) &&
			!storeAsBlobBlacklist.find((x) => contentType.includes(x)) &&
			!fileNameBlacklist.find((x) => x.test(url))
				? await fetched.blob()
				: await fetched.text();
		return _contents;
	}

	const handleProviderTest = ({ github}) => async (params, event) => {
		// in the future, will cycle through ALL providers and return repsonse from one
		const githubResponse = github && await github.handler('test', { params, event });
		if(githubResponse) return githubResponse;

		const body = await event.request.json();
		const { providerType, providerUrl, providerAccessToken } = body;
		const isSupported = ["basic-bartok-provider", "github-provider"].includes(
			providerType
		);
		if (!isSupported) stringify$2({ error: `Unsupported provider type: ${providerType}` });
		if (providerType === "github-provider")  stringify$2({ success: true, todo: "test user's access token" });

		const fileUrl = (providerUrl + "/file/").replace("//file/", "/file/");
		const treeUrl = (providerUrl + "/tree/").replace("//tree/", "/tree/");
		try {
			const baseRes = await fetch(providerUrl);
			if (baseRes.status !== 200) return stringify$2({ error: `Failed to connect to provider at: ${providerUrl}` });
		} catch (e) {
			return stringify$2({ error: `Failed to connect to provider at: ${providerUrl}` });
		}
		try {
			const fileRes = await fetch(fileUrl);
			if (fileRes.status !== 200) return stringify$2({ error: `Failed to connect to provider at: ${fileUrl}` });
		} catch (e) {
			return stringify$2({ error: `Failed to connect to provider at: ${fileUrl}` });
		}
		try {
			const treeRes = await fetch(treeUrl);
			if (treeRes.status !== 200) return stringify$2({ error: `Failed to connect to provider at: ${treeUrl}` });
		} catch (e) {
			return stringify$2({ error: `Failed to connect to provider at: ${treeUrl}` });
		}
		return stringify$2({ success: true });
	};

	const handleProviderCreate = ({ create, github }) => async (params, event) => {
		// in the future, will cycle through ALL providers and return repsonse from one
		const githubResponse = github && await github.handler('create', { params, event });
		if(githubResponse) return githubResponse;

		try {
			const body = await event.request.json();
			const { providerType, providerUrl } = body;
			const isSupported = ["basic-bartok-provider"].includes(providerType);
			if (!isSupported) stringify$2({ error: `Unsupported provider type: ${providerType}` });
			const provider = await create({
				id: providerUrl,
				url: providerUrl,
			});
			return stringify$2({ success: true, provider });
		} catch (error) {
			return stringify$2({ error });
		}
	};

	const handleProviderRead = () => async (params, event) => {
		console.error(
			"not implemented: provider read.  Should return one or all saved provider details."
		);
		return stringify$2({ error: "not implemented" });
	};

	const handleProviderUpdate = () => async (params, event) => {
		console.error(
			"not implemented: provider update.  Should update provider details."
		);
		return stringify$2({ error: "not implemented" });
	};

	const handleProviderDelete = () => async (params, event) => {
		console.error(
			"not implemented: provider delete.  Should delete saved provider."
		);
		return stringify$2({ error: "not implemented" });
	};

	const handleCreateCommit = ({ github }) => async (params, event) => {
		const githubResponse = github && await github.handler('createCommit', { params, event });
		if(githubResponse) return githubResponse;
		return stringify$2({ error: "commits are only implemented for github repos" });
	};

	// servicesCreate
	async function _providerCreateServiceHandler(event) {
		const servicesStore = this.stores.services;
		const filesStore = this.stores.files;

		// in the future, will cycle through ALL providers and return repsonse from one
		const githubResponse = this.github && await this.github.handler('servicesCreate', { event });
		if(githubResponse) return githubResponse;

		try {
			const body = await event.request.json();
			let { providerType, providerUrl, providerAccessToken, repoName } = body;

			/*
				reminder:
					- providers create services that have provider attribute
					- services act like servers within service worker
					- for github this is a two step process because file system is not handling target selection as with bartok servers

				if github provider and no accessToken
					- reject
				if github provider and repoName
					- read repository list for logged in user (providerAccessToken
					- return to UI for selection
				if both of these
					- recursively read tree
					- add files as you go (with file contents or sync|read-one-by-one later?)
					- create service using repository name
			*/

			const isSupported = ["basic-bartok-provider"].includes(providerType);
			if (!isSupported) return stringify$2({ error: `Unsupported provider type: ${providerType}` });
			const provider = await this.read(providerUrl);
			if (!provider) return stringify$2({ error: `Provider does not exist: ${providerUrl}` });

			// TODO: treeUrl, fileUrl aka provider.getTree should be on provider at this point
			// maybe even provider.supported should be there
			const treeUrl = (providerUrl + "/tree/").replace("//tree/", "/tree/");
			const fileUrl = (providerUrl + "/file/").replace("//file/", "/file/");
			const allServices = [];
			await servicesStore.iterate((value, key) => {
				allServices.push(value);
			});

			const baseRes = await fetch(treeUrl);
			if (baseRes.status !== 200) return stringify$2({ error: `Failed to connect to provider at: ${providerUrl}` });
			const {
				files: providerFiles,
				root: providerRoot,
				tree: providerTree,
			} = await baseRes.json();
			const providerRootName = providerRoot.split("/").pop();

			const foundService = allServices.find((x) => x.name === providerRootName);
			const id = foundService
				? foundService.id
				: allServices.reduce((all, one) => {
						return Number(one.id) >= all ? Number(one.id) + 1 : all;
					}, 1);

			const service = {
				name: providerRootName,
				id,
				providerRoot,
				providerUrl,
				tree: providerTree,
			};
			if (!service.name) {
				console.error("cannot set services store item without service name");
				return;
			}
			await servicesStore.setItem(id + "", service);
			service.code = [];
			for (let f = 0; f < providerFiles.length; f++) {
				const filePath = providerFiles[f];
				const fileContents = await this.utils.fetchFileContents(
					`${fileUrl}${providerRoot}/${filePath}`
				);
				filesStore.setItem(
					`./${providerRootName}/${filePath}`,
					fileContents
				);
				service.code.push({
					name: filePath.split("/").pop(),
					path: `./${providerRootName}/${filePath}`,
					code: typeof fileContents === "string" ? fileContents : "",
				});
			}
			await this.providerUpdateServiceJson({ service, servicesStore, filesStore });

			await this.app.addServiceHandler({
				name: providerRootName,
				msg: "served from fresh baked",
			});
			return stringify$2({ result: { services: [service] } });
		} catch (error) {
			console.error(error);
			return stringify$2({ error });
		}
	}
	// servicesRead
	// servicesUpdate
	const _providerUpdateServiceJson = async function({ service, servicesStore, filesStore, }) {
		// in the future, will cycle through ALL providers and return repsonse from one
		const githubResponse = this.github && await this.github.handler('servicesUpdate', { service });
		if(githubResponse) return githubResponse;

		const serviceJsonFile = service.code.find((x) =>
			x.path.includes("/service.json")
		);
		if (!serviceJsonFile) return;
		const serviceJson = JSON.parse(serviceJsonFile.code);

		const { code, ...serviceOther } = service;
		const { providerUrl, providerRoot } = service;

		serviceJson.tree = service.tree[service.name];
		serviceJson.files = service.code
			.map((x) => ({
				name: x.name,
				path: x.path.replace("./", ""),
			}))
			.sort((a, b) => {
				if (a.name.toLowerCase() > b.name.toLowerCase()) {
					return 1;
				}
				if (a.name.toLowerCase() < b.name.toLowerCase()) {
					return -1;
				}
				return 0;
			});
		const pathWithoutParent = serviceJsonFile.path.replace(
			"./" + service.name,
			""
		);
		const filePostUrl = `${providerUrl}file/${providerRoot}${pathWithoutParent}`;

		serviceJsonFile.code = stringify$2(serviceJson);
		if (!serviceOther.name) {
			console.error("cannot set services store item without service name");
			return;
		}
		await servicesStore.setItem(service.id + "", serviceOther);
		await filesStore.setItem(serviceJsonFile.path, serviceJsonFile.code);
		await fetch(filePostUrl, {
			method: "post",
			body: serviceJsonFile.code,
		});
	};
	// servicesDelete

	// filesCreate
	// filesRead
	// filesUpdate
	async function _providerFileChange(args) {
		let { path, code, parent:service, deleteFile } = args;

		// in the future, will cycle through ALL providers and return repsonse from one
		const githubResponse = this.github && await this.github.handler('filesUpdate', args);
		if(githubResponse) return githubResponse;

		service = service ||
			(await this.stores.services.iterate((value, key) => {
				if (value.name === service || value.name === service.name) {
					return value;
				}
			}));
		if (!service || !service.providerUrl)
			throw new Error(
				"file not saved to provider: service not associated with a provider"
			);
		const { providerUrl, providerRoot } = service;
		const pathWithoutParent = path.replace("./" + service.name, "");
		const filePostUrl = `${providerUrl}file/${providerRoot}${pathWithoutParent}`;

		const filePostRes = await this.utils.fetchJSON(filePostUrl, {
			method: deleteFile ? "DELETE" : "POST",
			body: deleteFile ? undefined : code,
		});
		if (filePostRes.error) throw new Error(filePostRes.error);
		return filePostRes;
	}
	// filesDelete

	class ProviderManager {
		constructor({ app, storage, utils, GithubProvider }) {
			return new Promise(async (resolve) => {
				try {
					this.app = app;
					this.storage = storage;
					this.utils = utils;
					this.fetchContents = _fetchFileContents.bind(this);

					// I kinda don't like either of these (or thier usage)
					this.store = storage.stores.providers;
					this.stores = storage.stores;

					this.github = await new GithubProvider(this);

					this.handlers = {
						testHandler: handleProviderTest(this),
						createHandler: handleProviderCreate(this),
						readHandler: handleProviderRead(this),
						updateHandler: handleProviderUpdate(this),
						deleteHandler: handleProviderDelete(this),

						createCommit: handleCreateCommit(this),
					};

					// servicesCreate
					this.createServiceHandler = _providerCreateServiceHandler.bind(this);
					// servicesRead
					// servicesUpdate
					this.providerUpdateServiceJson = _providerUpdateServiceJson.bind(this);
					// servicesDelete

					// filesCreate
					// filesRead
					// filesUpdate
					this.fileChange = _providerFileChange.bind(this);
					// filesDelete

					resolve(this);
				} catch(error) {
					reject(error);
				}
			});
		}

		create = async (provider) => {
			return await this.store.setItem(provider.id + "", provider);
		};

		read = async (id) => {
			if (!id) {
				return await this.store.keys();
			}
			return await this.store.getItem(id);
		};

		update = async (id, updates) => {
			const provider = await this.read(id);
			if (updates.id && updates.id !== id) {
				await this.delete(id);
			}
			return await this.store.setItem((updates.id || provider.id) + "", {
				...provider,
				...updates,
			});
		};

		delete = async (id) => {
			return await this.store.removeItem(id);
		};
	}

	//https://docs.github.com/en/rest

	const baseUrl = "https://api.github.com";
	const urls = {
		rateLimit: '/rate_limit',
		repoInfo: '/repos/{owner}/{repo}',
		latestCommit: '/repos/{owner}/{repo}/branches/{branch}',
		tree: '/repos/{owner}/{repo}/git/trees',
		getTreeRecursive: '/repos/{owner}/{repo}/git/trees/{tree_sha}?recursive=true',
		rawBlob: 'https://raw.githubusercontent.com/{owner}/{repo}/{branch}/{path}',
		contents: '/repos/{owner}/{repo}/contents/{path}?ref={sha}',

		//commit
		branch: '/repos/{owner}/{repo}/branches/{branch}',
		treeRecurse: '/repos/{owner}/{repo}/git/trees/{sha}?recursive=true',
		commit: '/repos/{owner}/{repo}/git/commits/{sha}',
		createCommit: '/repos/{owner}/{repo}/git/commits',
		blobCreate: '/repos/{owner}/{repo}/git/blobs',
		refs: '/repos/{owner}/{repo}/git/refs/heads/{branch}'
	};
	Object.entries(urls).forEach(([k,v]) => {
		if(v[0] !== '/') return
		urls[k] = baseUrl + urls[k];
	});

	const stringify$1 = o => JSON.stringify(o,null,2);
	const _fetchJSON = (url, opts) => fetch(url, opts).then(x => x.json());
	const fill = (url, obj) => Object.keys(obj).reduce((all,one) => all.replace(`{${one}}`, obj[one]),	url);

	//const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

	const debug = () => {
		console.warn('Someone wants to be debugging...');
		//debugger;
	};
	const NOT_IMPLEMENTED_RESPONSE = () => {
		return debug() || stringify$1({ message: 'not implemented' })
	};

	const githubRequestHandler = (githubProvider) => async (which, handlerArgs) => {
		try {
			const { params, event, service, parent } = handlerArgs;
			const req = event && event?.request?.clone();
			const payload = req && await req?.json();
			const { providerType } = (payload || {});

			if(which === 'createCommit'){
				return await githubProvider.createCommit(payload, params);
			}

			const isSupported = providerType
				? providerType === "github-provider"
				: (service||parent)?.type === 'github';

			if(!isSupported) return;

			const githubHandler = githubProvider[which];
			if(!githubHandler) return;

			const notANetReqHandler = ['filesUpdate'].includes(which);

			return notANetReqHandler
				? await githubHandler(handlerArgs)
				: await githubHandler(payload, params);
		} catch(e) {}
		return;
	};

	const githubTest = (githubProvider) => async (payload, params) => {
		try {
			const { storage } = githubProvider;
			const { auth, repo, branch } = payload;

			const opts = { headers: {} };
			if(auth) opts.headers.authorization = `token ${auth}`;
			opts.headers.Accept = "application/vnd.github.v3+json";

			const result = await githubProvider.fetchJSON(urls.rateLimit, opts);
			let { limit, remaining, reset } = result?.resources?.core;
			reset = new Date(reset*1000).toLocaleString('sv').split(' ').reverse().join(' ');

			console.log(stringify$1({ limit, remaining, reset }));

			return stringify$1({ success: true, ...{limit, remaining, reset} });
		} catch(error){
			return stringify$1({ error });
		}
	};

	const githubCreate = (githubProvider) => async (payload, params) => {
		try {
			const { storage } = githubProvider;
			const { auth, repo, branch } = payload;
			const providersStore = storage.stores.providers;

			console.log({ payload, params });

			// check if provider exists

			// if exists then update
			// don't overwrite access_token if not present in payload ???

			// if not exists then create
			// save access_token
			// save type = github
			// other properties?

			return NOT_IMPLEMENTED_RESPONSE();
		} catch(error){
			console.error(error);
			return stringify$1({ error });
		}
	};

	const githubRead = (githubProvider) => async (payload, params) => NOT_IMPLEMENTED_RESPONSE();
	const githubDelete = (githubProvider) => async (payload, params) => NOT_IMPLEMENTED_RESPONSE();

	const githubServiceCreate = (githubProvider) => async (payload, params) => {
		try {
			const { storage: { stores }, fetchContents, app } = githubProvider;
			// TODO: should not use auth from this call (should exist on provider)

			const { auth, repo } = payload;
			const providersStore = stores.providers;
			const servicesStore = stores.services;
			const filesStore = stores.files;

			//console.log({ payload, params });

			const opts = { headers: {} };
			if(auth) opts.headers.authorization = `token ${auth}`;
			opts.headers.Accept = "application/vnd.github.v3+json";

			const getDefaultBranch = async () => {
				const repoInfoUrl = urls.repoInfo
					.replace('{owner}/{repo}', repo);
				const { default_branch } = await githubProvider.fetchJSON(repoInfoUrl, opts);
				return default_branch;
			};
			const branch = payload.branch || await getDefaultBranch();

			// TODO: check if provider exists, reject if not (create it, no?)

			// pull tree (includes files info) from github
			const latestCommitUrl = urls.latestCommit
				.replace('{owner}/{repo}', repo)
				.replace('{branch}', branch);
			const { commit: { sha } } = await githubProvider.fetchJSON(latestCommitUrl, opts);

			const getTreeUrl = urls.getTreeRecursive
				.replace('{owner}/{repo}', repo)
				.replace('{tree_sha}', sha);
			const { tree, truncated } = await githubProvider.fetchJSON(getTreeUrl, opts);

			if(truncated) console.warn('github repo tree truncated - try without recursive flag');

			//const ghTreeItems = tree.filter(x => x.type === 'tree');
			const ghFileItems = tree.filter(x => x.type === 'blob');

			// pull files from github
			/*
			// does raw github access (not api) go against quota
			// if so, warn the user that we can't do it without access token ??
			// also, may be better to use API in the future
			const result = await githubProvider.fetchJSON(urls.rateLimit, opts);
			let { remaining, reset, limit } = result?.resources?.core;
			reset = new Date(reset*1000).toLocaleString('sv').split(' ').reverse().join(' ');

			if(remaining < ghFileItems.length) {
				const files = ghFileItems.length;
				return stringify({
					files, remaining, reset, limit,
					error: 'file sync exceeds rate limit'
				});
			}
			*/

			const getOneFile = async (ghFile, commitSha) => {
				const getRawUrl = (file) => urls.rawBlob
					.replace('{owner}/{repo}', repo)
					.replace('{branch}', commitSha || branch)
					.replace('{path}', file.path);

				const contents = await fetchContents(
					getRawUrl(ghFile)
				);
				return { ...ghFile, contents };
			};

			for(let i=0, len = ghFileItems.length; i<len; i++){
				const ghFile = ghFileItems[i];
				// TODO: could override JIT cache here according to some settimg/param
				const PLACEHOLDER = '##PLACEHOLDER##';
				if(!ghFile.path.includes('.templates')){
					await filesStore.setItem(`${repo}/${ghFileItems[i].path}`, PLACEHOLDER);
					continue;
				}

				const { contents } = await getOneFile(ghFile, sha);
				await filesStore.setItem(`${repo}/${ghFileItems[i].path}`, contents);
				//await sleep(50);
			}

			// check if service exists
			let foundService = {};
			const keys = [];
			await servicesStore.iterate((value, key) => {
				keys.push(key);
				if(value.name === repo) foundService = { key, ...value };
			});
			const newId = keys.length
				? Math.max(...keys) + 1
				: 3000; // this sucks

			const githubToServiceTree = (githubTreeItems) => {
				const tree = { [repo]: {} };
				const root = tree[repo];
				githubTreeItems.forEach(item => {
					item.path.split('/').reduce((all, one) => {
						all[one] = all[one] || {};
						return all[one];
					}, root);
				});
				return tree;
			};

			/*
				TODO: files in tree should include a url such as this
				because blobs don't have mime types, but file contents do
				GET https://api.github.com/repos/:owner/:repo/contents/:FILE_PATH?ref=SHA << file SHA
				see https://stackoverflow.com/a/34460532/1627873

				Also, auth for API should be handled... in some way

				Also, should maybe preload .templates
			*/

			const saveService = async (githubTree, commitSha) => {
				const id = foundService.id || newId;
				const type = 'github';
				const name = repo;
				const tree = githubToServiceTree(githubTree);
				const thisService = {
					id, type, name, tree,
					owner: repo.split('/').slice(0,1).join(''),
					repo: repo.split('/').pop(),
					git: {
						tree: githubTree,
						sha: commitSha
					},
					branch
				};

				// create or update service
				await servicesStore.setItem(id+'', thisService);
				return { id, thisService };
			};
			const { id, thisService } = await saveService(tree, sha);

			// may be issues with merging, but overwrite for now
			// create files that do not exist
			// overwrite files that already exist
			// delete files that exist but not in github

			//console.log({ ghTreeItems, ghFileItems });

			await app.addServiceHandler({
				name: repo,
				msg: "service added from github provider",
			});
			return stringify$1({ result: { services: [thisService] } });
		} catch(error){
			console.error(error);
			return stringify$1({ error });
		}
	};

	const githubServiceRead = (githubProvider) => async (payload, params) => NOT_IMPLEMENTED_RESPONSE();
	const githubServiceUpdate = (githubProvider) => async (payload, params) => NOT_IMPLEMENTED_RESPONSE(); // this should not return a network response
	const githubServiceDelete = (githubProvider) => async (payload, params) => NOT_IMPLEMENTED_RESPONSE();

	/*
		files: { path, content, operation }[], operation is one of [create, update, delete]
		git: { owner, repo, branch }
		auth: github authorization token,
		message: commit message
	*/
	async function commit({ files, git, auth, message, fetchJSON }){
		//TODO: message can be formatted in Title Description format by including \n\n between the two

		if(!files || !Array.isArray(files)) return { error: 'no files were changed'};
		files = files.filter(x => !x.ignore);
		if(!files.length) return { error: 'no files were changed'};

		if(!auth) return { error: 'auth is required' };
		if(!message) return { error: 'message is required' };
		if(!git.owner) return { error: 'repository owner is required' };
		if(!git.branch) return { error: 'repository branch name is required' };
		if(!git.repo) return { error: 'repository name is required' };

		let blobs = [];

		const opts = {
			headers: {
				authorization: `token ${auth}`,
				Accept: "application/vnd.github.v3+json"
			}
		};
		const ghFetch = async (templateUrl, params={}, extraOpts={}) => {
			const filledUrl = fill(templateUrl, { ...git, ...params });
			return await fetchJSON(filledUrl, {...opts, ...extraOpts });
		};
		const ghPost = async (url, params, body) => await ghFetch(url, params, {
			method: 'POST',
			body: JSON.stringify(body)
		});
		const safeBase64 = (content) => {
			try {
				return { content: btoa(content), encoding: 'base64' }
			} catch(e) {
				return { content, encoding: "utf-8" }
			}
		};
		const fileToTree = ({ path }, index) => ({
			path, mode: '100644', type: 'blob',	sha: blobs[index].sha
		});
		const treeToTree = ({ path, mode, type, sha }) => ({ path, mode, type, sha });
		const blobCreate = ({ content }) => ghPost(urls.blobCreate, null, safeBase64(content));
		const createNewTree = (fwodel, fullt, fileps, delfileps) => {
			return [
				...fwodel.map(fileToTree),
				...fullt.tree
					.filter(x =>
						x.type !== 'tree' &&
						!fileps.includes(x.path) &&
						!delfileps.includes(x.path)
					)
					.map(treeToTree)
			];
		};

		const filesWithoutDeleted = files.filter(x => !x.deleteFile);
		const deletedFilePaths = files.filter(x => x.deleteFile).map(x => x.path);
		const filePaths = filesWithoutDeleted.map(x => x.path);

		blobs = await Promise.all(filesWithoutDeleted.map(blobCreate));
		const latest = await ghFetch(urls.branch);
		const fullTree = await ghFetch(urls.treeRecurse, { sha: latest?.commit?.sha });
		const createdTree = await ghPost(urls.tree, null, {
			tree: createNewTree(filesWithoutDeleted, fullTree, filePaths, deletedFilePaths)
		});
		const newCommit = await ghPost(urls.createCommit, null, {
			message, tree: createdTree.sha, parents: [ latest.commit.sha ]
		});
		const updateRefs = await ghPost(urls.refs, null, { sha: newCommit.sha });
		return (updateRefs?.object?.url || 'no commit url available')
			.replace('https://api.github.com/repos', 'https://github.com')
			.replace('git/commits','commit');
	}

	/*
	in the future:
		this will not automatically push commit to github, but instead create a commit to be pushed later
		auth will come from a seperate login command, not manually passed
		cwd will not be supported and instead some other method used to get current service, etc (maybe)
	*/
	const githubCreateCommit = (githubProvider) => async (payload, params) => {
		try {
			const { message, auth, cwd } = payload;

			if(!message) return stringify$1({ error: 'commit message is required' });
			if(!auth) return stringify$1({ error: 'auth token is required for commit' });
			if(!cwd) return stringify$1({ error: 'current working directory (cwd) is required for commit' });

			const { storage: { stores }, utils } = githubProvider;
			const servicesStore = stores.services;
			const changesStore = stores.changes;
			const filesStore = stores.files;
			const { flattenObject } = utils;

			let service;
			await servicesStore.iterate((value, key) => {
				const { tree, name } = value;

				if(cwd === `${name}/`){
					service = value;
					return true;
				}
				const flattened = flattenObject(tree);
				if(flattened.includes(cwd)){
					service = value;
					return true;
				}
			});

			if(!service || !service.name || !service.branch || !service.repo || service?.type !== 'github'){
				throw new Error('missing or malformed service');
			}
			const svcRegExp = new RegExp('^' + service.name + '/', 'g');
			const { owner, repo, branch } = service;
			const git = { owner, repo, branch };

			const files = [];
			const changes = [];
			const changesKeys = await changesStore.keys();
			for(let i=0, len=changesKeys.length; i<len; i++){
				const key = changesKeys[i];
				if(!svcRegExp.test(key)) continue;

				const change = await changesStore.getItem(key);
				if(!change?.service) continue;
				const {
					type: operation,
					value: content,
					service: { name: parent },
					deleteFile
				} = change;

				if(!parent) continue;
				if(parent !== service.name) continue;
				const path = key.replace(svcRegExp, '');

				const file = { path, content, operation, deleteFile };
				if(file.path.startsWith('.git/')) file.ignore = true;
				files.push(file);

				changes.push({ ...change, key });
			}

			let commitResponse;
			if(files.filter(x => !x.ignore).length){
				commitResponse = await commit({ auth, files, git, message, fetchJSON: githubProvider.fetchJSON });
				if(!commitResponse) throw new Error('commit failed');
				if(commitResponse.error) throw new Error(commitResponse.error)
			} else {
				commitResponse = { error: 'no files changed'};
			}

			for(let i=0, len=files.length; i<len; i++){
				const change = changes[i];
				if(change.deleteFile){
					await filesStore.removeItem(change.key);
				} else {
					await filesStore.setItem(change.key, change.value);
				}
				await changesStore.removeItem(change.key);
			}
			return stringify$1({ commitResponse });
		} catch(e){
			return stringify$1({ commitResponse: { error: e.message } });
		}
	};

	class GithubProvider {
		constructor ({ storage, fetchContents, app, utils }) {
			return new Promise((resolve, reject) => {
				try {
					this.handler = githubRequestHandler(this);

					this.storage = storage;
					this.fetchContents = fetchContents;
					this.fetchJSON = _fetchJSON;
					this.app = app;
					this.utils = utils;

					// the provider  user entered info <-> fiug providersStore
					// store details about how each service connects to github
					this.test = githubTest(this);
					this.create = githubCreate(this);
					this.read = githubRead(this);
					this.update = githubDelete(this);
					this.delete = githubDelete(this);

					// child of the provider  gh repository <-> fiug servicesStore
					// get repo from github, store tree in servicesStore
					// modify service tree, sync github
					this.servicesCreate = githubServiceCreate(this);
					this.servicesRead = githubServiceRead(this);
					this.servicesUpdate = githubServiceUpdate(this);
					this.servicesDelete = githubServiceDelete(this);

					// files from repository  gh repo files <-> fiug filesStore
					// change a files contents, sync to github
					this.filesCreate = githubServiceCreate(this);
					this.filesRead = githubServiceRead(this);
					this.filesUpdate = githubServiceUpdate(this);
					this.filesDelete = githubServiceDelete(this);

					this.createCommit = githubCreateCommit(this);

					resolve(this);
				} catch(error) {
					reject(error);
				}
			});
		}
	}

	const useNew = true;

	const stringify = o => JSON.stringify(o,null,2);
	const clone = o => {
		if(!o) return;
		try {
			return JSON.parse(stringify(o));
		} catch(e){
			return;
		}
	};
	const unique = (a) => [...new Set(a)];
	function objectPath(obj, path) {
		var result = obj;
		try{
			var props = path.split('/');
			props.every(function propsEveryCb(prop) {
				if(prop === '.') return true;
				if (typeof result[prop] === 'undefined') {
					result = undefined;
					return false;
				}
				result = result[prop];
				return true;
			});
			return result;
		} catch(e) {
			return;
		}
	}
	const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);
	const stripFrontDotSlash = (x) => x.replace(/^\.\//, '');

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
		storage.stores.files;
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

	//smoking this right now
	//https://medium.com/javascript-scene/reduce-composing-software-fe22f0c39a1d
	//https://medium.com/javascript-scene/functors-categories-61e031bac53f#.4hqndcx22
	const _operationsUpdater = (() => {

		const getBody = (operation) => {
			const convertStoreObject = (code={}) => {
				const entries = Object.entries(code);
				entries.forEach(([k,v]) => {
					if(k.slice(2) === './') return;
					if(k[0] === '/'){
						delete code[k];
						code['.'+k] = v;
						return;
					}
					delete code[k];
					code['./'+k] = v;
				});
				return code;
			};
			return {
				...operation,
				service: operation.service.name,
				tree: clone(operation.service.tree) || {},
				code: convertStoreObject(operation.code),
				changes: convertStoreObject(operation.changes),
				filesToAdd: [],
				filesToDelete: []
			};
		};
		const adjustMoveTarget = (operation) => {
			const isMove = operation.name.includes('move') || operation.name.includes('copy');
			if(!isMove) return operation;
			let { target, source } = operation;
			operation.name.includes('Folder');
			//if(isFolder && !target.endsWith('/')) target += '/';
			if(target.endsWith('/')){
				target += source.split('/').pop();
			}
			return { ...operation, target };
		};
		const adjustRenameTarget = (operation) => {
			const isRename = operation.name.includes('rename');
			if(!isRename) return operation;
			let target = operation.target;
			if(!operation.target.includes('/') && operation.source.includes('/')){
				target = [
					...operation.source.split('/').slice(0,-1),
					target
				].join('/');
			}
			return { ...operation, target };
		};
		const addChildrenToTarget = (operation) => {
			const isFile = operation.name.includes('File');
			if(isFile) return operation;
			const sourcePath = `./${operation.service}/${operation.source}`;
			const targetPath = `./${operation.service}/${operation.target}`;
			const children = unique([
				...Object.keys(operation.code),
				...Object.keys(operation.changes)
			])
				.filter(x => x.startsWith(sourcePath+'/'));
			const childrenMappedToTarget = children.map(child => {
				const childRelative = child.split(operation.source).pop();
				return `${targetPath}${childRelative}`;
			});
			const filesToAdd = [
				...operation.filesToAdd,
				...childrenMappedToTarget
			];
			children.forEach((c, i) => {
				operation.code[childrenMappedToTarget[i]] = async (store) => await store.getItem(c);
			});
			return { ...operation, filesToAdd };
		};
		const addTargetToTree = (operation) => {
			const {service,source,target,tree} = operation;
			const sourceValue = objectPath(tree[service], source) || {};

			const targetSplit = target.split('/');
			const targetKey = targetSplit.length === 1
				? targetSplit[0]
				: targetSplit.slice(-1).join('/');
			const targetParentPath = targetSplit.length === 1
				? ''
				: targetSplit.slice(0,-1).join('/');
			const targetParent = targetSplit.length === 1
				? tree[service]
				: objectPath(tree[service], targetParentPath);

			targetParent[targetKey] = sourceValue;

			return { ...operation, tree };
		};
		const addTargetToFiles = (operation) => {
			const isFile = operation.name.includes('File');
			if(!isFile) return operation;
			const path = `./${operation.service}/${operation.target}`;
			const update = `./${operation.service}/${operation.source}`;
			const fileGetter = operation.name === 'addFile'
				? async (store) => operation.source || ''
				: async (store) => await store.getItem(update);
			operation.code[path] = fileGetter;
			const filesToAdd = [ ...operation.filesToAdd, path ];
			return { ...operation, filesToAdd };
		};
		const deleteChildrenFromSource = (operation) => {
			const isFile = operation.name.includes('File');
			if(isFile) return operation;
			const sourcePath = `./${operation.service}/${operation.source}`;
			const children =unique([
				...Object.keys(operation.code),
				...Object.keys(operation.changes)
			])
				.filter(x => x.startsWith(sourcePath+'/'));
			const filesToDelete = [
				...operation.filesToDelete,
				...children
			];
			children.forEach(c => {
				delete operation.code[c];
			});
			return { ...operation, filesToDelete };
		};
		const deleteSourceFromTree = (operation) => {
			const {service,source,tree} = operation;
			const sourceSplit = source.split('/');
			const sourceKey = sourceSplit.length === 1
				? sourceSplit[0]
				: sourceSplit.slice(-1).join('/');
			const sourceParentPath = sourceSplit.length === 1
				? ''
				: sourceSplit.slice(0,-1).join('/');
			const sourceParent = sourceSplit.length === 1
				? tree[service]
				: objectPath(tree[service], sourceParentPath);
			delete sourceParent[sourceKey];
			return operation;
		};
		const deleteSourceFromFiles = (operation) => {
			const isFile = operation.name.includes('File');
			if(!isFile) return operation;
			const path = `./${operation.service}/${operation.source}`;
			delete operation.code[`./${operation.service}/${operation.source}`];
			const filesToDelete = [
				...operation.filesToDelete,
				path
			];
			return { ...operation, filesToDelete };
		};
		const keepHelper = (operation) => {
			let { filesToAdd, filesToDelete } = operation;
			const { tree, code, utils, service, changes } = operation;
			const mapCodeForHelper = () => {
				const changesFiles = Object.entries(changes)
					.map(([path,value]) => ({
						name: path.split('/').pop(),
						path
					}));
				const codeFiles = Object.entries(code)
					.map(([path,value]) => ({
						name: path.split('/').pop(),
						path
					}));
				return [...codeFiles, ...changesFiles];
			};
			const keepFilesFromHelper = utils
				.keepHelper(tree, mapCodeForHelper())
				.filter(x => x.includes('/.keep'))
				.map(x => '.'+x);

			keepFilesFromHelper.forEach(k => {
				const parentPath = k.split('/').slice(0,-1).join('/').replace(service+'/', '');
				const parentInTree = objectPath(tree[service], parentPath) || {};
				if(!parentInTree) return;
				parentInTree['.keep'] = {};
				code[k] = ' ';
				filesToAdd.push(k);
				filesToDelete = filesToDelete.filter(x => x !== k);
			});
			const keepFilesInCode = Object.keys(operation.code)
				.filter(x => x.includes('/.keep'));

			keepFilesInCode.forEach(k => {
				const parentPath = k.split('/').slice(0,-1).join('/').replace(service+'/', '');
				const parentInTree = objectPath(tree[service], parentPath) || {};
				const parentKeys = Object.keys(parentInTree).filter(x => x !== '.keep');
				if(parentKeys.length === 0) return;
				delete parentInTree['.keep'];
				delete code[k];
				const keepIsAdded = filesToAdd.find(x => x === k);
				if(!keepIsAdded) filesToDelete.push(k);
				filesToAdd = filesToAdd.filter(x => x !== k);
			});
			return { ...operation, filesToAdd, filesToDelete, code, tree };
		};

		const addSourceToTarget = pipe(
			addChildrenToTarget,
			addTargetToTree,
			addTargetToFiles
		);
		const deleteSource = pipe(
			deleteChildrenFromSource,
			deleteSourceFromTree,
			deleteSourceFromFiles
		);
		const init = (...fns) => pipe(
			getBody,
			adjustMoveTarget,
			adjustRenameTarget,
			...fns,
			keepHelper
		);
		const add    = init( addSourceToTarget );
		const copy   = init( addSourceToTarget );
		const move   = init( addSourceToTarget, deleteSource );
		const rename = init( addSourceToTarget, deleteSource );
		const remove = init( deleteSource );

		const operations = {
			addFile: add,
			addFolder: add,
			moveFile: move,
			moveFolder: move,
			copyFile: copy,
			copyFolder: copy,
			renameFile: rename,
			renameFolder: rename,
			deleteFile: remove,
			deleteFolder: remove
		};

		return operation => (service, code, utils, changes) =>
			operations[operation.name]({
				...operation, service, code, utils, changes
			});

	})();

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
			const isCopy = operation?.name?.includes('copy');

			const operationsUpdater = _operationsUpdater(operation);
			let update;

			if(useNew && operationsUpdater){
				const _service = await servicesStore.getItem(id + "");
				const fileKeys = (await filesStore.keys())
					.filter(key =>
						key.startsWith(`./${_service.name}/`) ||
						key.startsWith(`${_service.name}/`)
					);
				const changeKeys = (await changesStore.keys())
					.filter(key =>
						key.startsWith(`./${_service.name}/`) ||
						key.startsWith(`${_service.name}/`)
					);
				const _code = fileKeys
					.reduce((all, key) => ({
						...all,
						[key]: ''
					}), {});
				const _changed = changeKeys
					.reduce((all, key) => ({
						...all,
						[key]: ''
					}), {});

				update = operationsUpdater(_service, _code, utils, _changed);

				const getItem = (target, update) => async (key) => {
					let formattedKey = key;
					if(key.slice(0,2) === './' && _service.type === 'github'){
						formattedKey = key.slice(2);
					}
					if(key.slice(0,1) === '/' && _service.type === 'github'){
						formattedKey = key.slice(1);
					}
					const changed = await changesStore.getItem(formattedKey);
					if(changed && changed.type === "update") return changed.value;

					if(changed && changed.deleteFile){
						update.filesToAdd = update.filesToAdd.filter(x => x!==target);
						let parent = objectPath(update.tree, target.split('/').slice(0,-1).join('/'));
						delete parent[target.split('/').pop()];
						return '';
					}

					const file = await filesStore.getItem(formattedKey);
					return file;
				};
				for(var key in update.code){
					if(typeof update.code[key] !== 'function') continue;
					update.code[key] = await update.code[key]({ getItem: getItem(key, update) });
				}
			}
			if(update){
				body.code = Object.entries(update.code)
					.map(([path,value]) => ({
						name: path.split('/').pop(),
						path: path.replace(/^\.\//, ''),
						update: value
					}));
				body.tree = update.tree;
			}
			if(!update && (isMoveOrRename || isCopy) ){
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

			//console.log(JSON.stringify(body.code, null, 2));
			//console.log(JSON.stringify(body.tree, null, 2));

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

			const { filesToAdd, filesToDelete } = await (async () => {
				if(update && update.filesToAdd && update.filesToDelete) return update;

				const filesFromUpdateTree = utils
					.keepHelper(body.tree, body.code)
					//.map(x => x.startsWith('/') ? x.slice(1) : x);
					.map(x => `.${x}`);

				const filesInStore = (await filesStore.keys())
					.filter(key => key.startsWith(`./${service.name}/`));

				const filesToDelete = filesInStore
					.filter(file => !filesFromUpdateTree.includes(file));

				const filesToAdd = filesFromUpdateTree
					.filter(file => !filesInStore.includes(file));

				return { filesToAdd, filesToDelete };
			})();

			// TODO: binary files
			const binaryFiles = [];

			for (let i = 0, len = filesToAdd.length; i < len; i++) {
				const path = service.type === 'github'
					? stripFrontDotSlash(filesToAdd[i])
					: filesToAdd[i];
				const fileUpdate = body.code.find(x =>
					`.${x.path}` === path ||
					x.path === `/${path}` ||
					x.path === path
				);
				const parent = service;
				let fileUpdateCode;
				if(fileUpdate?.update){
					fileUpdateCode = fileUpdate.update;
					delete fileUpdate.update;
				}
				const code = fileUpdateCode || ''; //TODO: if not in update, default for file
				//await providers.fileChange({ path: filesToAdd[i], code, parent });

				await changesStore.setItem(path, {
					type: 'update',
					value: code,
					service: (() => {
						const { tree, ...rest } = service;
						return rest;
					})()
				});
				//TODO: I think this is a problem, not sure...
				//files get written with blank string and dot in front of name
				//await filesStore.setItem(path, code);
			}

			for (let i = 0, len = filesToDelete.length; i < len; i++) {
				const parent = service;
				const path = service.type === 'github'
					? stripFrontDotSlash(filesToDelete[i])
					: filesToDelete[i];
				const existingFile = await filesStore.getItem(path);

				if(existingFile !== null){
					await changesStore.setItem(path, {
						deleteFile: true,
						service: (() => {
							const { tree, ...rest } = service;
							return rest;
						})()
					});
					//await providers.fileChange({ path: filesToDelete[i], parent, deleteFile: true });
				} else {
					await changesStore.removeItem(path);
					//await providers.removeChange({ path: filesToDelete[i], parent });
				}
			}

			/*

			this looks like it would:
				erase all changes for this service
				put those changes in file store

			this is not exactly the desired behavior in current iteration...

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

			*/

			const changed = (await changesStore.keys())
					.filter(x => x.startsWith(`${service.name}`))
					.map(x => x.split(service.name+'/')[1]);
			const opened = (await changesStore.getItem(`state-${service.name}-opened`)) || [];
			const selected = (opened.find(x => x.order === 0)||{}).name || '';

			/*
				TODO:
				addFile - select the file and show it opened
				removeFile - remove from opened / selected
				etc..
				similar thing with treeState
			*/

			return stringify({
				result: [{
					id: service.id,
					name: service.name,
					code: body.code.map(({ name, path }) => ({ name, path })),
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
				serviceDelete: handleServiceDelete(),
			};
		}
	}

	const NO_PREVIEW = () => {
		return `
	<!DOCTYPE html>
	<html class="dark-enabled">
		<head>
			<meta charset="UTF-8">
		</head>
		<style>
			.no-preview {
				position: absolute;
				top: 0;
				left: 0;
				width: 100%;
				height: 100%;
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 1.5em;
				color: var(--main-theme-text-color);
			}
			body {
				margin: 0px;
				margin-top: 40px;
				height: calc(100vh - 40px);
				overflow: hidden;
				color: var(--main-theme-text-color);
				background: var(--main-theme-color);
				font-family: sans-serif;
			}
		</style>
		<link rel="stylesheet" href="/colors.css" />
		<body>
			<pre>
				<div class="no-preview" title="No preview!">⠝⠕ ⠏⠗⠑⠧⠊⠑⠺</div>
			</pre>
		</body>
	</html>
	`.replace(/^		/g, '');
	};

	class TemplateEngine {
		templates = [];

		constructor({ storage }){
			this.storage = storage;
			this.refresh = this.refresh.bind(this);
			this.NO_PREVIEW = NO_PREVIEW();
		}

		add(name, template) {
			const newTemp = {
				name,
				extensions: [],
				body: template,
				tokens: ["{{template_value}}", "{{markdown}}", "{{template_input}}"],
				matcher: () => false, //TODO: matchers are not currently implemented
			};
			newTemp.extensions.push(name.split(".").shift());
			newTemp.convert = (contents) => {
				let xfrmed = newTemp.body + "";
				newTemp.tokens.forEach((t) => {
					xfrmed = xfrmed.replace(new RegExp(t, "g"), contents);
					//xfrmed = xfrmed.replace(t, contents);
				});
				return xfrmed;
			};
			this.templates.push(newTemp);
		}

		update(name, contents) {
			const ext = name.split(".").shift();
			const matchingTemplates = this.templates.filter((t) =>
				t.extensions.includes(ext)
			);
			matchingTemplates.forEach((m) => (m.body = contents));
			if (!matchingTemplates.length) {
				this.add(name, contents);
			}
		}

		getTemplate(filename = "", contents = "") {
			const ext = filename.split(".").pop();
			const extMatch = this.templates.find((x) => x.extensions.includes(ext));
			if (extMatch) return extMatch;

			// json files can use different templates
			const jsonMatch = (() => {
				if (!filename.includes(".json")) {
					return;
				}
				if (!contents.includes("file-type")) {
					return;
				}
				try {
					const parsed = JSON.parse(contents);
					const fileType = parsed["file-type"];
					if (!fileType) return;
					const _jsonMatch = this.templates.find((x) =>
						x.extensions.includes(fileType)
					);
					return _jsonMatch;
				} catch (e) {
					console.error(e);
					return;
				}
			})();
			return jsonMatch;
		}

		convert(filename, contents) {
			filename.split(".").pop();

			if (filename.includes(".htm")) {
				return contents;
			}
			if (!this.templates.length) return false;
			const foundTemplate = this.getTemplate(filename, contents);
			if (!foundTemplate) return;
			return foundTemplate.convert(contents);
		}

		async refresh(){
			const filesStore = this.storage.stores.files;
			const currentTemplateNames = (await filesStore.keys())
				.filter(x => x.includes(`/.templates/`));
			for(var i=0, len=currentTemplateNames.length; i < len; i++){
				const key = currentTemplateNames[i];
				const value = await filesStore.getItem(key);
				const name = key.split("/").pop();
				const existing = this.templates.find((x) => x.name === name);
				if(existing) {
					this.update(name, value);
					continue;
				}
				this.add(name, value);
			}
		}
	}

	var Handler = async () => {
		const swHandlers = self.handlers;
		await utils.initMimeTypes();

		//TODO: ideally, would not allow generic access of storage, instead access Manager methods
		const ui = new UIManager("fiug"); // ui manager is a special kind of storage
		const storage = new StorageManager({ utils, ui });
		ui.init(storage.stores.handlers, storage.stores.changes);

		const templates = new TemplateEngine({ storage });

		const app = new Router({ storage, templates, swHandlers });
		const providers = await new ProviderManager({
			app, storage, utils, GithubProvider
		});
		const services = new ServicesManager({
			app, storage, providers, ui, utils, templates
		});

		app.get("/service/search/", storage.handlers.serviceSearch); // move handler to services
		app.get("/service/read/:id?", storage.handlers.serviceRead); // move handler to services
		app.post("/service/create/:id?", services.handlers.serviceCreate);
		app.get("/service/change", services.handlers.serviceGetChanges);
		app.post("/service/change", services.handlers.serviceChange);

		app.post("/service/commit", providers.handlers.createCommit);

		app.post("/service/update/:id?", services.handlers.serviceUpdate);
		app.post("/service/provider/delete/:id?", services.handlers.serviceDelete);

		app.post("/service/provider/test/:id?", providers.handlers.testHandler);
		app.post("/service/provider/create", providers.handlers.createHandler);
		app.post("/service/provider/read/:id?", providers.handlers.readHandler);
		app.post("/service/provider/update/:id?", providers.handlers.updateHandler);
		app.post("/service/provider/delete/:id?", providers.handlers.deleteHandler);

		app.get("/manage/:id?", utils.notImplementedHandler);
		app.get("/monitor/:id?", utils.notImplementedHandler);
		app.get("/persist/:id?", utils.notImplementedHandler);

		self.handler = async (event) => {
			//console.warn('Service Request Handler - usage');
			//console.log(event.request.url);

			try {
				const splitPath = event.request.url
					.replace(location.origin, "")
					.split("/");
				if (splitPath.includes("::preview::") && splitPath.includes(ui.name)) {
					return new Response(templates.NO_PREVIEW, {
						headers: { "Content-Type": "text/html" },
					});
				}
			} catch (e) {}

			const serviceAPIMatch = await app.find(event.request);

			const res = serviceAPIMatch
				? await serviceAPIMatch.exec(event)
				: "no match in service request listener!";
			let response;

			// if(res && res.type){ //most likely a blob
			//     response = new Response(res, {headers:{'Content-Type': res.type }});
			//     return response;
			// }

			if (event.request.url.includes("/::preview::/")) {
				response = new Response(utils.addBase(res), {
					headers: { "Content-Type": "text/html" },
				});
				return response;
			}

			let { contentType } = utils.getMime(event.request.url) || {};
			if (!contentType && serviceAPIMatch && !res?.type) {
				({ contentType } = utils.getMime(".json"));
			}

			if (contentType) {
				response = new Response(res, {
					headers: { "Content-Type": contentType || res.type },
				});
				return response;
			}

			return new Response(res);

			// should be able to interact with instantiated services as well,
			// ie. all '.welcome' files should be available
			// each instantiated service should have its own store
		};
	};

	Handler();

}());
