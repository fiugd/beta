/*!
	fiug service-worker
	Version v0.4.4 - 2021-09-09T18:01:48.351Z
	https://github.com/crosshj/fiug
	(c) 20xx-20xx Harrison Cross.
*/

const utils = (() => {
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
	const getMime = (filename) =>
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

	const unique = (array, fn) => {
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
		const mime = getMime(filename) || {};
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

	return {
		addBase,
		fetchJSON,
		flattenTree,
		flattenObject,
		keepHelper,
		getCodeAsStorage,
		getMime,
		initMimeTypes,
		notImplementedHandler,
		safe,
		treeInsertFile,
		unique,

		// ugh
		fetchFileContents,
	};
})();

const StorageManager = (() => {
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
	return StorageManager;
})();

const Router = (() => {
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

	return Router;
})();

const { UIManager, UIManagerAddChanged } = (() => {
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


	const stringify = o => JSON.stringify(o,null,2);

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

		return stringify({
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

		return stringify({ result: [service] });
	};

	const UIManagerChange = async (manager, { path, code }) => {
		manager.changed[path] = code;

		console.warn(`changed a file at: ${path}`);

		await manager.changeStore.setItem("UIManagerChanged", manager.changed);

		return stringify({
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

	const UIManagerAddChanged = (manager) => {};

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
	return { UIManager, UIManagerAddChanged };
})();

const ProviderManager = (() => {
	const stringify = o => JSON.stringify(o,null,2);

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
		if (!isSupported) stringify({ error: `Unsupported provider type: ${providerType}` });
		if (providerType === "github-provider")  stringify({ success: true, todo: "test user's access token" });

		const fileUrl = (providerUrl + "/file/").replace("//file/", "/file/");
		const treeUrl = (providerUrl + "/tree/").replace("//tree/", "/tree/");
		try {
			const baseRes = await fetch(providerUrl);
			if (baseRes.status !== 200) return stringify({ error: `Failed to connect to provider at: ${providerUrl}` });
		} catch (e) {
			return stringify({ error: `Failed to connect to provider at: ${providerUrl}` });
		}
		try {
			const fileRes = await fetch(fileUrl);
			if (fileRes.status !== 200) return stringify({ error: `Failed to connect to provider at: ${fileUrl}` });
		} catch (e) {
			return stringify({ error: `Failed to connect to provider at: ${fileUrl}` });
		}
		try {
			const treeRes = await fetch(treeUrl);
			if (treeRes.status !== 200) return stringify({ error: `Failed to connect to provider at: ${treeUrl}` });
		} catch (e) {
			return stringify({ error: `Failed to connect to provider at: ${treeUrl}` });
		}
		return stringify({ success: true });
	};

	const handleProviderCreate = ({ create, github }) => async (params, event) => {
		// in the future, will cycle through ALL providers and return repsonse from one
		const githubResponse = github && await github.handler('create', { params, event });
		if(githubResponse) return githubResponse;

		try {
			const body = await event.request.json();
			const { providerType, providerUrl } = body;
			const isSupported = ["basic-bartok-provider"].includes(providerType);
			if (!isSupported) stringify({ error: `Unsupported provider type: ${providerType}` });
			const provider = await create({
				id: providerUrl,
				url: providerUrl,
			});
			return stringify({ success: true, provider });
		} catch (error) {
			return stringify({ error });
		}
	};

	const handleProviderRead = () => async (params, event) => {
		console.error(
			"not implemented: provider read.  Should return one or all saved provider details."
		);
		return stringify({ error: "not implemented" });
	};

	const handleProviderUpdate = () => async (params, event) => {
		console.error(
			"not implemented: provider update.  Should update provider details."
		);
		return stringify({ error: "not implemented" });
	};

	const handleProviderDelete = () => async (params, event) => {
		console.error(
			"not implemented: provider delete.  Should delete saved provider."
		);
		return stringify({ error: "not implemented" });
	};

	const handleCreateCommit = ({ github }) => async (params, event) => {
		const githubResponse = github && await github.handler('createCommit', { params, event });
		if(githubResponse) return githubResponse;
		return stringify({ error: "commits are only implemented for github repos" });
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
			if (!isSupported) return stringify({ error: `Unsupported provider type: ${providerType}` });
			const provider = await this.read(providerUrl);
			if (!provider) return stringify({ error: `Provider does not exist: ${providerUrl}` });

			// TODO: treeUrl, fileUrl aka provider.getTree should be on provider at this point
			// maybe even provider.supported should be there
			const treeUrl = (providerUrl + "/tree/").replace("//tree/", "/tree/");
			const fileUrl = (providerUrl + "/file/").replace("//file/", "/file/");
			const allServices = [];
			await servicesStore.iterate((value, key) => {
				allServices.push(value);
			});

			const baseRes = await fetch(treeUrl);
			if (baseRes.status !== 200) return stringify({ error: `Failed to connect to provider at: ${providerUrl}` });
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
			return stringify({ result: { services: [service] } });
		} catch (error) {
			console.error(error);
			return stringify({ error });
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

		serviceJsonFile.code = stringify(serviceJson);
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

	return ProviderManager;
})();

const GithubProvider = (() => {
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

	const stringify = o => JSON.stringify(o,null,2);
	const _fetchJSON = (url, opts) => fetch(url, opts).then(x => x.json());
	const fill = (url, obj) => Object.keys(obj).reduce((all,one) => all.replace(`{${one}}`, obj[one]),	url);

	//const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

	const debug = () => {
		console.warn('Someone wants to be debugging...');
		//debugger;
	};
	const NOT_IMPLEMENTED_RESPONSE = () => {
		return debug() || stringify({ message: 'not implemented' })
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

			console.log(stringify({ limit, remaining, reset }));

			return stringify({ success: true, ...{limit, remaining, reset} });
		} catch(error){
			return stringify({ error });
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
			return stringify({ error });
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
			return stringify({ result: { services: [thisService] } });
		} catch(error){
			console.error(error);
			return stringify({ error });
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

			if(!message) return stringify({ error: 'commit message is required' });
			if(!auth) return stringify({ error: 'auth token is required for commit' });
			if(!cwd) return stringify({ error: 'current working directory (cwd) is required for commit' });

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
			return stringify({ commitResponse });
		} catch(e){
			return stringify({ commitResponse: { error: e.message } });
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

	return GithubProvider;
})();

const ServicesManager = (() => {
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
	return ServicesManager;
})();

const TemplateEngine = (() => {
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
	return TemplateEngine;
})();

const init = async () => {
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

var Handler = { init };

/*!
    localForage -- Offline Storage, Improved
    Version 1.7.4
    https://localforage.github.io/localForage
    (c) 2013-2017 Mozilla, Apache License 2.0
*/
!function(a){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=a();else if("function"==typeof define&&define.amd)define([],a);else {var b;b="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:this,b.localforage=a();}}(function(){return function a(b,c,d){function e(g,h){if(!c[g]){if(!b[g]){var i="function"==typeof require&&require;if(!h&&i)return i(g,!0);if(f)return f(g,!0);var j=new Error("Cannot find module '"+g+"'");throw j.code="MODULE_NOT_FOUND",j}var k=c[g]={exports:{}};b[g][0].call(k.exports,function(a){var c=b[g][1][a];return e(c||a)},k,k.exports,a,b,c,d);}return c[g].exports}for(var f="function"==typeof require&&require,g=0;g<d.length;g++)e(d[g]);return e}({1:[function(a,b,c){(function(a){function c(){k=!0;for(var a,b,c=l.length;c;){for(b=l,l=[],a=-1;++a<c;)b[a]();c=l.length;}k=!1;}function d(a){1!==l.push(a)||k||e();}var e,f=a.MutationObserver||a.WebKitMutationObserver;if(f){var g=0,h=new f(c),i=a.document.createTextNode("");h.observe(i,{characterData:!0}),e=function(){i.data=g=++g%2;};}else if(a.setImmediate||void 0===a.MessageChannel)e="document"in a&&"onreadystatechange"in a.document.createElement("script")?function(){var b=a.document.createElement("script");b.onreadystatechange=function(){c(),b.onreadystatechange=null,b.parentNode.removeChild(b),b=null;},a.document.documentElement.appendChild(b);}:function(){setTimeout(c,0);};else {var j=new a.MessageChannel;j.port1.onmessage=c,e=function(){j.port2.postMessage(0);};}var k,l=[];b.exports=d;}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{});},{}],2:[function(a,b,c){function d(){}function e(a){if("function"!=typeof a)throw new TypeError("resolver must be a function");this.state=s,this.queue=[],this.outcome=void 0,a!==d&&i(this,a);}function f(a,b,c){this.promise=a,"function"==typeof b&&(this.onFulfilled=b,this.callFulfilled=this.otherCallFulfilled),"function"==typeof c&&(this.onRejected=c,this.callRejected=this.otherCallRejected);}function g(a,b,c){o(function(){var d;try{d=b(c);}catch(b){return p.reject(a,b)}d===a?p.reject(a,new TypeError("Cannot resolve promise with itself")):p.resolve(a,d);});}function h(a){var b=a&&a.then;if(a&&("object"==typeof a||"function"==typeof a)&&"function"==typeof b)return function(){b.apply(a,arguments);}}function i(a,b){function c(b){f||(f=!0,p.reject(a,b));}function d(b){f||(f=!0,p.resolve(a,b));}function e(){b(d,c);}var f=!1,g=j(e);"error"===g.status&&c(g.value);}function j(a,b){var c={};try{c.value=a(b),c.status="success";}catch(a){c.status="error",c.value=a;}return c}function k(a){return a instanceof this?a:p.resolve(new this(d),a)}function l(a){var b=new this(d);return p.reject(b,a)}function m(a){function b(a,b){function d(a){g[b]=a,++h!==e||f||(f=!0,p.resolve(j,g));}c.resolve(a).then(d,function(a){f||(f=!0,p.reject(j,a));});}var c=this;if("[object Array]"!==Object.prototype.toString.call(a))return this.reject(new TypeError("must be an array"));var e=a.length,f=!1;if(!e)return this.resolve([]);for(var g=new Array(e),h=0,i=-1,j=new this(d);++i<e;)b(a[i],i);return j}function n(a){function b(a){c.resolve(a).then(function(a){f||(f=!0,p.resolve(h,a));},function(a){f||(f=!0,p.reject(h,a));});}var c=this;if("[object Array]"!==Object.prototype.toString.call(a))return this.reject(new TypeError("must be an array"));var e=a.length,f=!1;if(!e)return this.resolve([]);for(var g=-1,h=new this(d);++g<e;)b(a[g]);return h}var o=a(1),p={},q=["REJECTED"],r=["FULFILLED"],s=["PENDING"];b.exports=e,e.prototype.catch=function(a){return this.then(null,a)},e.prototype.then=function(a,b){if("function"!=typeof a&&this.state===r||"function"!=typeof b&&this.state===q)return this;var c=new this.constructor(d);if(this.state!==s){g(c,this.state===r?a:b,this.outcome);}else this.queue.push(new f(c,a,b));return c},f.prototype.callFulfilled=function(a){p.resolve(this.promise,a);},f.prototype.otherCallFulfilled=function(a){g(this.promise,this.onFulfilled,a);},f.prototype.callRejected=function(a){p.reject(this.promise,a);},f.prototype.otherCallRejected=function(a){g(this.promise,this.onRejected,a);},p.resolve=function(a,b){var c=j(h,b);if("error"===c.status)return p.reject(a,c.value);var d=c.value;if(d)i(a,d);else {a.state=r,a.outcome=b;for(var e=-1,f=a.queue.length;++e<f;)a.queue[e].callFulfilled(b);}return a},p.reject=function(a,b){a.state=q,a.outcome=b;for(var c=-1,d=a.queue.length;++c<d;)a.queue[c].callRejected(b);return a},e.resolve=k,e.reject=l,e.all=m,e.race=n;},{1:1}],3:[function(a,b,c){(function(b){"function"!=typeof b.Promise&&(b.Promise=a(2));}).call(this,"undefined"!=typeof global?global:"undefined"!=typeof self?self:"undefined"!=typeof window?window:{});},{2:2}],4:[function(a,b,c){function d(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}function e(){try{if("undefined"!=typeof indexedDB)return indexedDB;if("undefined"!=typeof webkitIndexedDB)return webkitIndexedDB;if("undefined"!=typeof mozIndexedDB)return mozIndexedDB;if("undefined"!=typeof OIndexedDB)return OIndexedDB;if("undefined"!=typeof msIndexedDB)return msIndexedDB}catch(a){return}}function f(){try{if(!ua||!ua.open)return !1;var a="undefined"!=typeof openDatabase&&/(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent)&&!/Chrome/.test(navigator.userAgent)&&!/BlackBerry/.test(navigator.platform),b="function"==typeof fetch&&-1!==fetch.toString().indexOf("[native code");return (!a||b)&&"undefined"!=typeof indexedDB&&"undefined"!=typeof IDBKeyRange}catch(a){return !1}}function g(a,b){a=a||[],b=b||{};try{return new Blob(a,b)}catch(f){if("TypeError"!==f.name)throw f;for(var c="undefined"!=typeof BlobBuilder?BlobBuilder:"undefined"!=typeof MSBlobBuilder?MSBlobBuilder:"undefined"!=typeof MozBlobBuilder?MozBlobBuilder:WebKitBlobBuilder,d=new c,e=0;e<a.length;e+=1)d.append(a[e]);return d.getBlob(b.type)}}function h(a,b){b&&a.then(function(a){b(null,a);},function(a){b(a);});}function i(a,b,c){"function"==typeof b&&a.then(b),"function"==typeof c&&a.catch(c);}function j(a){return "string"!=typeof a&&(console.warn(a+" used as a key, but it is not a string."),a=String(a)),a}function k(){if(arguments.length&&"function"==typeof arguments[arguments.length-1])return arguments[arguments.length-1]}function l(a){for(var b=a.length,c=new ArrayBuffer(b),d=new Uint8Array(c),e=0;e<b;e++)d[e]=a.charCodeAt(e);return c}function m(a){return new va(function(b){var c=a.transaction(wa,Ba),d=g([""]);c.objectStore(wa).put(d,"key"),c.onabort=function(a){a.preventDefault(),a.stopPropagation(),b(!1);},c.oncomplete=function(){var a=navigator.userAgent.match(/Chrome\/(\d+)/),c=navigator.userAgent.match(/Edge\//);b(c||!a||parseInt(a[1],10)>=43);};}).catch(function(){return !1})}function n(a){return "boolean"==typeof xa?va.resolve(xa):m(a).then(function(a){return xa=a})}function o(a){var b=ya[a.name],c={};c.promise=new va(function(a,b){c.resolve=a,c.reject=b;}),b.deferredOperations.push(c),b.dbReady?b.dbReady=b.dbReady.then(function(){return c.promise}):b.dbReady=c.promise;}function p(a){var b=ya[a.name],c=b.deferredOperations.pop();if(c)return c.resolve(),c.promise}function q(a,b){var c=ya[a.name],d=c.deferredOperations.pop();if(d)return d.reject(b),d.promise}function r(a,b){return new va(function(c,d){if(ya[a.name]=ya[a.name]||B(),a.db){if(!b)return c(a.db);o(a),a.db.close();}var e=[a.name];b&&e.push(a.version);var f=ua.open.apply(ua,e);b&&(f.onupgradeneeded=function(b){var c=f.result;try{c.createObjectStore(a.storeName),b.oldVersion<=1&&c.createObjectStore(wa);}catch(c){if("ConstraintError"!==c.name)throw c;console.warn('The database "'+a.name+'" has been upgraded from version '+b.oldVersion+" to version "+b.newVersion+', but the storage "'+a.storeName+'" already exists.');}}),f.onerror=function(a){a.preventDefault(),d(f.error);},f.onsuccess=function(){c(f.result),p(a);};})}function s(a){return r(a,!1)}function t(a){return r(a,!0)}function u(a,b){if(!a.db)return !0;var c=!a.db.objectStoreNames.contains(a.storeName),d=a.version<a.db.version,e=a.version>a.db.version;if(d&&(a.version!==b&&console.warn('The database "'+a.name+"\" can't be downgraded from version "+a.db.version+" to version "+a.version+"."),a.version=a.db.version),e||c){if(c){var f=a.db.version+1;f>a.version&&(a.version=f);}return !0}return !1}function v(a){return new va(function(b,c){var d=new FileReader;d.onerror=c,d.onloadend=function(c){var d=btoa(c.target.result||"");b({__local_forage_encoded_blob:!0,data:d,type:a.type});},d.readAsBinaryString(a);})}function w(a){return g([l(atob(a.data))],{type:a.type})}function x(a){return a&&a.__local_forage_encoded_blob}function y(a){var b=this,c=b._initReady().then(function(){var a=ya[b._dbInfo.name];if(a&&a.dbReady)return a.dbReady});return i(c,a,a),c}function z(a){o(a);for(var b=ya[a.name],c=b.forages,d=0;d<c.length;d++){var e=c[d];e._dbInfo.db&&(e._dbInfo.db.close(),e._dbInfo.db=null);}return a.db=null,s(a).then(function(b){return a.db=b,u(a)?t(a):b}).then(function(d){a.db=b.db=d;for(var e=0;e<c.length;e++)c[e]._dbInfo.db=d;}).catch(function(b){throw q(a,b),b})}function A(a,b,c,d){void 0===d&&(d=1);try{var e=a.db.transaction(a.storeName,b);c(null,e);}catch(e){if(d>0&&(!a.db||"InvalidStateError"===e.name||"NotFoundError"===e.name))return va.resolve().then(function(){if(!a.db||"NotFoundError"===e.name&&!a.db.objectStoreNames.contains(a.storeName)&&a.version<=a.db.version)return a.db&&(a.version=a.db.version+1),t(a)}).then(function(){return z(a).then(function(){A(a,b,c,d-1);})}).catch(c);c(e);}}function B(){return {forages:[],db:null,dbReady:null,deferredOperations:[]}}function C(a){function b(){return va.resolve()}var c=this,d={db:null};if(a)for(var e in a)d[e]=a[e];var f=ya[d.name];f||(f=B(),ya[d.name]=f),f.forages.push(c),c._initReady||(c._initReady=c.ready,c.ready=y);for(var g=[],h=0;h<f.forages.length;h++){var i=f.forages[h];i!==c&&g.push(i._initReady().catch(b));}var j=f.forages.slice(0);return va.all(g).then(function(){return d.db=f.db,s(d)}).then(function(a){return d.db=a,u(d,c._defaultConfig.version)?t(d):a}).then(function(a){d.db=f.db=a,c._dbInfo=d;for(var b=0;b<j.length;b++){var e=j[b];e!==c&&(e._dbInfo.db=d.db,e._dbInfo.version=d.version);}})}function D(a,b){var c=this;a=j(a);var d=new va(function(b,d){c.ready().then(function(){A(c._dbInfo,Aa,function(e,f){if(e)return d(e);try{var g=f.objectStore(c._dbInfo.storeName),h=g.get(a);h.onsuccess=function(){var a=h.result;void 0===a&&(a=null),x(a)&&(a=w(a)),b(a);},h.onerror=function(){d(h.error);};}catch(a){d(a);}});}).catch(d);});return h(d,b),d}function E(a,b){var c=this,d=new va(function(b,d){c.ready().then(function(){A(c._dbInfo,Aa,function(e,f){if(e)return d(e);try{var g=f.objectStore(c._dbInfo.storeName),h=g.openCursor(),i=1;h.onsuccess=function(){var c=h.result;if(c){var d=c.value;x(d)&&(d=w(d));var e=a(d,c.key,i++);void 0!==e?b(e):c.continue();}else b();},h.onerror=function(){d(h.error);};}catch(a){d(a);}});}).catch(d);});return h(d,b),d}function F(a,b,c){var d=this;a=j(a);var e=new va(function(c,e){var f;d.ready().then(function(){return f=d._dbInfo,"[object Blob]"===za.call(b)?n(f.db).then(function(a){return a?b:v(b)}):b}).then(function(b){A(d._dbInfo,Ba,function(f,g){if(f)return e(f);try{var h=g.objectStore(d._dbInfo.storeName);null===b&&(b=void 0);var i=h.put(b,a);g.oncomplete=function(){void 0===b&&(b=null),c(b);},g.onabort=g.onerror=function(){var a=i.error?i.error:i.transaction.error;e(a);};}catch(a){e(a);}});}).catch(e);});return h(e,c),e}function G(a,b){var c=this;a=j(a);var d=new va(function(b,d){c.ready().then(function(){A(c._dbInfo,Ba,function(e,f){if(e)return d(e);try{var g=f.objectStore(c._dbInfo.storeName),h=g.delete(a);f.oncomplete=function(){b();},f.onerror=function(){d(h.error);},f.onabort=function(){var a=h.error?h.error:h.transaction.error;d(a);};}catch(a){d(a);}});}).catch(d);});return h(d,b),d}function H(a){var b=this,c=new va(function(a,c){b.ready().then(function(){A(b._dbInfo,Ba,function(d,e){if(d)return c(d);try{var f=e.objectStore(b._dbInfo.storeName),g=f.clear();e.oncomplete=function(){a();},e.onabort=e.onerror=function(){var a=g.error?g.error:g.transaction.error;c(a);};}catch(a){c(a);}});}).catch(c);});return h(c,a),c}function I(a){var b=this,c=new va(function(a,c){b.ready().then(function(){A(b._dbInfo,Aa,function(d,e){if(d)return c(d);try{var f=e.objectStore(b._dbInfo.storeName),g=f.count();g.onsuccess=function(){a(g.result);},g.onerror=function(){c(g.error);};}catch(a){c(a);}});}).catch(c);});return h(c,a),c}function J(a,b){var c=this,d=new va(function(b,d){if(a<0)return void b(null);c.ready().then(function(){A(c._dbInfo,Aa,function(e,f){if(e)return d(e);try{var g=f.objectStore(c._dbInfo.storeName),h=!1,i=g.openKeyCursor();i.onsuccess=function(){var c=i.result;if(!c)return void b(null);0===a?b(c.key):h?b(c.key):(h=!0,c.advance(a));},i.onerror=function(){d(i.error);};}catch(a){d(a);}});}).catch(d);});return h(d,b),d}function K(a){var b=this,c=new va(function(a,c){b.ready().then(function(){A(b._dbInfo,Aa,function(d,e){if(d)return c(d);try{var f=e.objectStore(b._dbInfo.storeName),g=f.openKeyCursor(),h=[];g.onsuccess=function(){var b=g.result;if(!b)return void a(h);h.push(b.key),b.continue();},g.onerror=function(){c(g.error);};}catch(a){c(a);}});}).catch(c);});return h(c,a),c}function L(a,b){b=k.apply(this,arguments);var c=this.config();a="function"!=typeof a&&a||{},a.name||(a.name=a.name||c.name,a.storeName=a.storeName||c.storeName);var d,e=this;if(a.name){var f=a.name===c.name&&e._dbInfo.db,g=f?va.resolve(e._dbInfo.db):s(a).then(function(b){var c=ya[a.name],d=c.forages;c.db=b;for(var e=0;e<d.length;e++)d[e]._dbInfo.db=b;return b});d=a.storeName?g.then(function(b){if(b.objectStoreNames.contains(a.storeName)){var c=b.version+1;o(a);var d=ya[a.name],e=d.forages;b.close();for(var f=0;f<e.length;f++){var g=e[f];g._dbInfo.db=null,g._dbInfo.version=c;}return new va(function(b,d){var e=ua.open(a.name,c);e.onerror=function(a){e.result.close(),d(a);},e.onupgradeneeded=function(){e.result.deleteObjectStore(a.storeName);},e.onsuccess=function(){var a=e.result;a.close(),b(a);};}).then(function(a){d.db=a;for(var b=0;b<e.length;b++){var c=e[b];c._dbInfo.db=a,p(c._dbInfo);}}).catch(function(b){throw (q(a,b)||va.resolve()).catch(function(){}),b})}}):g.then(function(b){o(a);var c=ya[a.name],d=c.forages;b.close();for(var e=0;e<d.length;e++){d[e]._dbInfo.db=null;}return new va(function(b,c){var d=ua.deleteDatabase(a.name);d.onerror=d.onblocked=function(a){var b=d.result;b&&b.close(),c(a);},d.onsuccess=function(){var a=d.result;a&&a.close(),b(a);};}).then(function(a){c.db=a;for(var b=0;b<d.length;b++)p(d[b]._dbInfo);}).catch(function(b){throw (q(a,b)||va.resolve()).catch(function(){}),b})});}else d=va.reject("Invalid arguments");return h(d,b),d}function M(){return "function"==typeof openDatabase}function N(a){var b,c,d,e,f,g=.75*a.length,h=a.length,i=0;"="===a[a.length-1]&&(g--,"="===a[a.length-2]&&g--);var j=new ArrayBuffer(g),k=new Uint8Array(j);for(b=0;b<h;b+=4)c=Da.indexOf(a[b]),d=Da.indexOf(a[b+1]),e=Da.indexOf(a[b+2]),f=Da.indexOf(a[b+3]),k[i++]=c<<2|d>>4,k[i++]=(15&d)<<4|e>>2,k[i++]=(3&e)<<6|63&f;return j}function O(a){var b,c=new Uint8Array(a),d="";for(b=0;b<c.length;b+=3)d+=Da[c[b]>>2],d+=Da[(3&c[b])<<4|c[b+1]>>4],d+=Da[(15&c[b+1])<<2|c[b+2]>>6],d+=Da[63&c[b+2]];return c.length%3==2?d=d.substring(0,d.length-1)+"=":c.length%3==1&&(d=d.substring(0,d.length-2)+"=="),d}function P(a,b){var c="";if(a&&(c=Ua.call(a)),a&&("[object ArrayBuffer]"===c||a.buffer&&"[object ArrayBuffer]"===Ua.call(a.buffer))){var d,e=Ga;a instanceof ArrayBuffer?(d=a,e+=Ia):(d=a.buffer,"[object Int8Array]"===c?e+=Ka:"[object Uint8Array]"===c?e+=La:"[object Uint8ClampedArray]"===c?e+=Ma:"[object Int16Array]"===c?e+=Na:"[object Uint16Array]"===c?e+=Pa:"[object Int32Array]"===c?e+=Oa:"[object Uint32Array]"===c?e+=Qa:"[object Float32Array]"===c?e+=Ra:"[object Float64Array]"===c?e+=Sa:b(new Error("Failed to get type for BinaryArray"))),b(e+O(d));}else if("[object Blob]"===c){var f=new FileReader;f.onload=function(){var c=Ea+a.type+"~"+O(this.result);b(Ga+Ja+c);},f.readAsArrayBuffer(a);}else try{b(JSON.stringify(a));}catch(c){console.error("Couldn't convert value into a JSON string: ",a),b(null,c);}}function Q(a){if(a.substring(0,Ha)!==Ga)return JSON.parse(a);var b,c=a.substring(Ta),d=a.substring(Ha,Ta);if(d===Ja&&Fa.test(c)){var e=c.match(Fa);b=e[1],c=c.substring(e[0].length);}var f=N(c);switch(d){case Ia:return f;case Ja:return g([f],{type:b});case Ka:return new Int8Array(f);case La:return new Uint8Array(f);case Ma:return new Uint8ClampedArray(f);case Na:return new Int16Array(f);case Pa:return new Uint16Array(f);case Oa:return new Int32Array(f);case Qa:return new Uint32Array(f);case Ra:return new Float32Array(f);case Sa:return new Float64Array(f);default:throw new Error("Unkown type: "+d)}}function R(a,b,c,d){a.executeSql("CREATE TABLE IF NOT EXISTS "+b.storeName+" (id INTEGER PRIMARY KEY, key unique, value)",[],c,d);}function S(a){var b=this,c={db:null};if(a)for(var d in a)c[d]="string"!=typeof a[d]?a[d].toString():a[d];var e=new va(function(a,d){try{c.db=openDatabase(c.name,String(c.version),c.description,c.size);}catch(a){return d(a)}c.db.transaction(function(e){R(e,c,function(){b._dbInfo=c,a();},function(a,b){d(b);});},d);});return c.serializer=Va,e}function T(a,b,c,d,e,f){a.executeSql(c,d,e,function(a,g){g.code===g.SYNTAX_ERR?a.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name = ?",[b.storeName],function(a,h){h.rows.length?f(a,g):R(a,b,function(){a.executeSql(c,d,e,f);},f);},f):f(a,g);},f);}function U(a,b){var c=this;a=j(a);var d=new va(function(b,d){c.ready().then(function(){var e=c._dbInfo;e.db.transaction(function(c){T(c,e,"SELECT * FROM "+e.storeName+" WHERE key = ? LIMIT 1",[a],function(a,c){var d=c.rows.length?c.rows.item(0).value:null;d&&(d=e.serializer.deserialize(d)),b(d);},function(a,b){d(b);});});}).catch(d);});return h(d,b),d}function V(a,b){var c=this,d=new va(function(b,d){c.ready().then(function(){var e=c._dbInfo;e.db.transaction(function(c){T(c,e,"SELECT * FROM "+e.storeName,[],function(c,d){for(var f=d.rows,g=f.length,h=0;h<g;h++){var i=f.item(h),j=i.value;if(j&&(j=e.serializer.deserialize(j)),void 0!==(j=a(j,i.key,h+1)))return void b(j)}b();},function(a,b){d(b);});});}).catch(d);});return h(d,b),d}function W(a,b,c,d){var e=this;a=j(a);var f=new va(function(f,g){e.ready().then(function(){void 0===b&&(b=null);var h=b,i=e._dbInfo;i.serializer.serialize(b,function(b,j){j?g(j):i.db.transaction(function(c){T(c,i,"INSERT OR REPLACE INTO "+i.storeName+" (key, value) VALUES (?, ?)",[a,b],function(){f(h);},function(a,b){g(b);});},function(b){if(b.code===b.QUOTA_ERR){if(d>0)return void f(W.apply(e,[a,h,c,d-1]));g(b);}});});}).catch(g);});return h(f,c),f}function X(a,b,c){return W.apply(this,[a,b,c,1])}function Y(a,b){var c=this;a=j(a);var d=new va(function(b,d){c.ready().then(function(){var e=c._dbInfo;e.db.transaction(function(c){T(c,e,"DELETE FROM "+e.storeName+" WHERE key = ?",[a],function(){b();},function(a,b){d(b);});});}).catch(d);});return h(d,b),d}function Z(a){var b=this,c=new va(function(a,c){b.ready().then(function(){var d=b._dbInfo;d.db.transaction(function(b){T(b,d,"DELETE FROM "+d.storeName,[],function(){a();},function(a,b){c(b);});});}).catch(c);});return h(c,a),c}function $(a){var b=this,c=new va(function(a,c){b.ready().then(function(){var d=b._dbInfo;d.db.transaction(function(b){T(b,d,"SELECT COUNT(key) as c FROM "+d.storeName,[],function(b,c){var d=c.rows.item(0).c;a(d);},function(a,b){c(b);});});}).catch(c);});return h(c,a),c}function _(a,b){var c=this,d=new va(function(b,d){c.ready().then(function(){var e=c._dbInfo;e.db.transaction(function(c){T(c,e,"SELECT key FROM "+e.storeName+" WHERE id = ? LIMIT 1",[a+1],function(a,c){var d=c.rows.length?c.rows.item(0).key:null;b(d);},function(a,b){d(b);});});}).catch(d);});return h(d,b),d}function aa(a){var b=this,c=new va(function(a,c){b.ready().then(function(){var d=b._dbInfo;d.db.transaction(function(b){T(b,d,"SELECT key FROM "+d.storeName,[],function(b,c){for(var d=[],e=0;e<c.rows.length;e++)d.push(c.rows.item(e).key);a(d);},function(a,b){c(b);});});}).catch(c);});return h(c,a),c}function ba(a){return new va(function(b,c){a.transaction(function(d){d.executeSql("SELECT name FROM sqlite_master WHERE type='table' AND name <> '__WebKitDatabaseInfoTable__'",[],function(c,d){for(var e=[],f=0;f<d.rows.length;f++)e.push(d.rows.item(f).name);b({db:a,storeNames:e});},function(a,b){c(b);});},function(a){c(a);});})}function ca(a,b){b=k.apply(this,arguments);var c=this.config();a="function"!=typeof a&&a||{},a.name||(a.name=a.name||c.name,a.storeName=a.storeName||c.storeName);var d,e=this;return d=a.name?new va(function(b){var d;d=a.name===c.name?e._dbInfo.db:openDatabase(a.name,"","",0),b(a.storeName?{db:d,storeNames:[a.storeName]}:ba(d));}).then(function(a){return new va(function(b,c){a.db.transaction(function(d){function e(a){return new va(function(b,c){d.executeSql("DROP TABLE IF EXISTS "+a,[],function(){b();},function(a,b){c(b);});})}for(var f=[],g=0,h=a.storeNames.length;g<h;g++)f.push(e(a.storeNames[g]));va.all(f).then(function(){b();}).catch(function(a){c(a);});},function(a){c(a);});})}):va.reject("Invalid arguments"),h(d,b),d}function da(){try{return "undefined"!=typeof localStorage&&"setItem"in localStorage&&!!localStorage.setItem}catch(a){return !1}}function ea(a,b){var c=a.name+"/";return a.storeName!==b.storeName&&(c+=a.storeName+"/"),c}function fa(){var a="_localforage_support_test";try{return localStorage.setItem(a,!0),localStorage.removeItem(a),!1}catch(a){return !0}}function ga(){return !fa()||localStorage.length>0}function ha(a){var b=this,c={};if(a)for(var d in a)c[d]=a[d];return c.keyPrefix=ea(a,b._defaultConfig),ga()?(b._dbInfo=c,c.serializer=Va,va.resolve()):va.reject()}function ia(a){var b=this,c=b.ready().then(function(){for(var a=b._dbInfo.keyPrefix,c=localStorage.length-1;c>=0;c--){var d=localStorage.key(c);0===d.indexOf(a)&&localStorage.removeItem(d);}});return h(c,a),c}function ja(a,b){var c=this;a=j(a);var d=c.ready().then(function(){var b=c._dbInfo,d=localStorage.getItem(b.keyPrefix+a);return d&&(d=b.serializer.deserialize(d)),d});return h(d,b),d}function ka(a,b){var c=this,d=c.ready().then(function(){for(var b=c._dbInfo,d=b.keyPrefix,e=d.length,f=localStorage.length,g=1,h=0;h<f;h++){var i=localStorage.key(h);if(0===i.indexOf(d)){var j=localStorage.getItem(i);if(j&&(j=b.serializer.deserialize(j)),void 0!==(j=a(j,i.substring(e),g++)))return j}}});return h(d,b),d}function la(a,b){var c=this,d=c.ready().then(function(){var b,d=c._dbInfo;try{b=localStorage.key(a);}catch(a){b=null;}return b&&(b=b.substring(d.keyPrefix.length)),b});return h(d,b),d}function ma(a){var b=this,c=b.ready().then(function(){for(var a=b._dbInfo,c=localStorage.length,d=[],e=0;e<c;e++){var f=localStorage.key(e);0===f.indexOf(a.keyPrefix)&&d.push(f.substring(a.keyPrefix.length));}return d});return h(c,a),c}function na(a){var b=this,c=b.keys().then(function(a){return a.length});return h(c,a),c}function oa(a,b){var c=this;a=j(a);var d=c.ready().then(function(){var b=c._dbInfo;localStorage.removeItem(b.keyPrefix+a);});return h(d,b),d}function pa(a,b,c){var d=this;a=j(a);var e=d.ready().then(function(){void 0===b&&(b=null);var c=b;return new va(function(e,f){var g=d._dbInfo;g.serializer.serialize(b,function(b,d){if(d)f(d);else try{localStorage.setItem(g.keyPrefix+a,b),e(c);}catch(a){"QuotaExceededError"!==a.name&&"NS_ERROR_DOM_QUOTA_REACHED"!==a.name||f(a),f(a);}});})});return h(e,c),e}function qa(a,b){if(b=k.apply(this,arguments),a="function"!=typeof a&&a||{},!a.name){var c=this.config();a.name=a.name||c.name,a.storeName=a.storeName||c.storeName;}var d,e=this;return d=a.name?new va(function(b){b(a.storeName?ea(a,e._defaultConfig):a.name+"/");}).then(function(a){for(var b=localStorage.length-1;b>=0;b--){var c=localStorage.key(b);0===c.indexOf(a)&&localStorage.removeItem(c);}}):va.reject("Invalid arguments"),h(d,b),d}function ra(a,b){a[b]=function(){var c=arguments;return a.ready().then(function(){return a[b].apply(a,c)})};}function sa(){for(var a=1;a<arguments.length;a++){var b=arguments[a];if(b)for(var c in b)b.hasOwnProperty(c)&&($a(b[c])?arguments[0][c]=b[c].slice():arguments[0][c]=b[c]);}return arguments[0]}var ta="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&"function"==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a},ua=e();"undefined"==typeof Promise&&a(3);var va=Promise,wa="local-forage-detect-blob-support",xa=void 0,ya={},za=Object.prototype.toString,Aa="readonly",Ba="readwrite",Ca={_driver:"asyncStorage",_initStorage:C,_support:f(),iterate:E,getItem:D,setItem:F,removeItem:G,clear:H,length:I,key:J,keys:K,dropInstance:L},Da="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",Ea="~~local_forage_type~",Fa=/^~~local_forage_type~([^~]+)~/,Ga="__lfsc__:",Ha=Ga.length,Ia="arbf",Ja="blob",Ka="si08",La="ui08",Ma="uic8",Na="si16",Oa="si32",Pa="ur16",Qa="ui32",Ra="fl32",Sa="fl64",Ta=Ha+Ia.length,Ua=Object.prototype.toString,Va={serialize:P,deserialize:Q,stringToBuffer:N,bufferToString:O},Wa={_driver:"webSQLStorage",_initStorage:S,_support:M(),iterate:V,getItem:U,setItem:X,removeItem:Y,clear:Z,length:$,key:_,keys:aa,dropInstance:ca},Xa={_driver:"localStorageWrapper",_initStorage:ha,_support:da(),iterate:ka,getItem:ja,setItem:pa,removeItem:oa,clear:ia,length:na,key:la,keys:ma,dropInstance:qa},Ya=function(a,b){return a===b||"number"==typeof a&&"number"==typeof b&&isNaN(a)&&isNaN(b)},Za=function(a,b){for(var c=a.length,d=0;d<c;){if(Ya(a[d],b))return !0;d++;}return !1},$a=Array.isArray||function(a){return "[object Array]"===Object.prototype.toString.call(a)},_a={},ab={},bb={INDEXEDDB:Ca,WEBSQL:Wa,LOCALSTORAGE:Xa},cb=[bb.INDEXEDDB._driver,bb.WEBSQL._driver,bb.LOCALSTORAGE._driver],db=["dropInstance"],eb=["clear","getItem","iterate","key","keys","length","removeItem","setItem"].concat(db),fb={description:"",driver:cb.slice(),name:"localforage",size:4980736,storeName:"keyvaluepairs",version:1},gb=function(){function a(b){d(this,a);for(var c in bb)if(bb.hasOwnProperty(c)){var e=bb[c],f=e._driver;this[c]=f,_a[f]||this.defineDriver(e);}this._defaultConfig=sa({},fb),this._config=sa({},this._defaultConfig,b),this._driverSet=null,this._initDriver=null,this._ready=!1,this._dbInfo=null,this._wrapLibraryMethodsWithReady(),this.setDriver(this._config.driver).catch(function(){});}return a.prototype.config=function(a){if("object"===(void 0===a?"undefined":ta(a))){if(this._ready)return new Error("Can't call config() after localforage has been used.");for(var b in a){if("storeName"===b&&(a[b]=a[b].replace(/\W/g,"_")),"version"===b&&"number"!=typeof a[b])return new Error("Database version must be a number.");this._config[b]=a[b];}return !("driver"in a&&a.driver)||this.setDriver(this._config.driver)}return "string"==typeof a?this._config[a]:this._config},a.prototype.defineDriver=function(a,b,c){var d=new va(function(b,c){try{var d=a._driver,e=new Error("Custom driver not compliant; see https://mozilla.github.io/localForage/#definedriver");if(!a._driver)return void c(e);for(var f=eb.concat("_initStorage"),g=0,i=f.length;g<i;g++){var j=f[g];if((!Za(db,j)||a[j])&&"function"!=typeof a[j])return void c(e)}(function(){for(var b=function(a){return function(){var b=new Error("Method "+a+" is not implemented by the current driver"),c=va.reject(b);return h(c,arguments[arguments.length-1]),c}},c=0,d=db.length;c<d;c++){var e=db[c];a[e]||(a[e]=b(e));}})();var k=function(c){_a[d]&&console.info("Redefining LocalForage driver: "+d),_a[d]=a,ab[d]=c,b();};"_support"in a?a._support&&"function"==typeof a._support?a._support().then(k,c):k(!!a._support):k(!0);}catch(a){c(a);}});return i(d,b,c),d},a.prototype.driver=function(){return this._driver||null},a.prototype.getDriver=function(a,b,c){var d=_a[a]?va.resolve(_a[a]):va.reject(new Error("Driver not found."));return i(d,b,c),d},a.prototype.getSerializer=function(a){var b=va.resolve(Va);return i(b,a),b},a.prototype.ready=function(a){var b=this,c=b._driverSet.then(function(){return null===b._ready&&(b._ready=b._initDriver()),b._ready});return i(c,a,a),c},a.prototype.setDriver=function(a,b,c){function d(){g._config.driver=g.driver();}function e(a){return g._extend(a),d(),g._ready=g._initStorage(g._config),g._ready}function f(a){return function(){function b(){for(;c<a.length;){var f=a[c];return c++,g._dbInfo=null,g._ready=null,g.getDriver(f).then(e).catch(b)}d();var h=new Error("No available storage method found.");return g._driverSet=va.reject(h),g._driverSet}var c=0;return b()}}var g=this;$a(a)||(a=[a]);var h=this._getSupportedDrivers(a),j=null!==this._driverSet?this._driverSet.catch(function(){return va.resolve()}):va.resolve();return this._driverSet=j.then(function(){var a=h[0];return g._dbInfo=null,g._ready=null,g.getDriver(a).then(function(a){g._driver=a._driver,d(),g._wrapLibraryMethodsWithReady(),g._initDriver=f(h);})}).catch(function(){d();var a=new Error("No available storage method found.");return g._driverSet=va.reject(a),g._driverSet}),i(this._driverSet,b,c),this._driverSet},a.prototype.supports=function(a){return !!ab[a]},a.prototype._extend=function(a){sa(this,a);},a.prototype._getSupportedDrivers=function(a){for(var b=[],c=0,d=a.length;c<d;c++){var e=a[c];this.supports(e)&&b.push(e);}return b},a.prototype._wrapLibraryMethodsWithReady=function(){for(var a=0,b=eb.length;a<b;a++)ra(this,eb[a]);},a.prototype.createInstance=function(b){return new a(b)},a}(),hb=new gb;b.exports=hb;},{3:3}]},{},[4])(4)});

/*!
    JSON5
    Version 2.0.0
    https://github.com/json5/json5
    (c) 2012-2018 Aseem Kishore, and [others].
*/
!function(u,D){"object"==typeof exports&&"undefined"!=typeof module?module.exports=D():"function"==typeof define&&define.amd?define(D):u.JSON5=D();}(undefined,function(){function u(u,D){return u(D={exports:{}},D.exports),D.exports}var D=u(function(u){var D=u.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=D);}),e=u(function(u){var D=u.exports={version:"2.6.5"};"number"==typeof __e&&(__e=D);}),t=(e.version,function(u){return "object"==typeof u?null!==u:"function"==typeof u}),r=function(u){if(!t(u))throw TypeError(u+" is not an object!");return u},F=function(u){try{return !!u()}catch(u){return !0}},n=!F(function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a}),C=D.document,A=t(C)&&t(C.createElement),i=!n&&!F(function(){return 7!=Object.defineProperty((u="div",A?C.createElement(u):{}),"a",{get:function(){return 7}}).a;var u;}),E=Object.defineProperty,o={f:n?Object.defineProperty:function(u,D,e){if(r(u),D=function(u,D){if(!t(u))return u;var e,r;if(D&&"function"==typeof(e=u.toString)&&!t(r=e.call(u)))return r;if("function"==typeof(e=u.valueOf)&&!t(r=e.call(u)))return r;if(!D&&"function"==typeof(e=u.toString)&&!t(r=e.call(u)))return r;throw TypeError("Can't convert object to primitive value")}(D,!0),r(e),i)try{return E(u,D,e)}catch(u){}if("get"in e||"set"in e)throw TypeError("Accessors not supported!");return "value"in e&&(u[D]=e.value),u}},a=n?function(u,D,e){return o.f(u,D,function(u,D){return {enumerable:!(1&u),configurable:!(2&u),writable:!(4&u),value:D}}(1,e))}:function(u,D,e){return u[D]=e,u},c={}.hasOwnProperty,B=function(u,D){return c.call(u,D)},s=0,f=Math.random(),l=u(function(u){var t=D["__core-js_shared__"]||(D["__core-js_shared__"]={});(u.exports=function(u,D){return t[u]||(t[u]=void 0!==D?D:{})})("versions",[]).push({version:e.version,mode:"global",copyright:"© 2019 Denis Pushkarev (zloirock.ru)"});})("native-function-to-string",Function.toString),d=u(function(u){var t,r="Symbol(".concat(void 0===(t="src")?"":t,")_",(++s+f).toString(36)),F=(""+l).split("toString");e.inspectSource=function(u){return l.call(u)},(u.exports=function(u,e,t,n){var C="function"==typeof t;C&&(B(t,"name")||a(t,"name",e)),u[e]!==t&&(C&&(B(t,r)||a(t,r,u[e]?""+u[e]:F.join(String(e)))),u===D?u[e]=t:n?u[e]?u[e]=t:a(u,e,t):(delete u[e],a(u,e,t)));})(Function.prototype,"toString",function(){return "function"==typeof this&&this[r]||l.call(this)});}),v=function(u,D,e){if(function(u){if("function"!=typeof u)throw TypeError(u+" is not a function!")}(u),void 0===D)return u;switch(e){case 1:return function(e){return u.call(D,e)};case 2:return function(e,t){return u.call(D,e,t)};case 3:return function(e,t,r){return u.call(D,e,t,r)}}return function(){return u.apply(D,arguments)}},p=function(u,t,r){var F,n,C,A,i=u&p.F,E=u&p.G,o=u&p.S,c=u&p.P,B=u&p.B,s=E?D:o?D[t]||(D[t]={}):(D[t]||{}).prototype,f=E?e:e[t]||(e[t]={}),l=f.prototype||(f.prototype={});for(F in E&&(r=t),r)C=((n=!i&&s&&void 0!==s[F])?s:r)[F],A=B&&n?v(C,D):c&&"function"==typeof C?v(Function.call,C):C,s&&d(s,F,C,u&p.U),f[F]!=C&&a(f,F,A),c&&l[F]!=C&&(l[F]=C);};D.core=e,p.F=1,p.G=2,p.S=4,p.P=8,p.B=16,p.W=32,p.U=64,p.R=128;var h,m=p,g=Math.ceil,y=Math.floor,w=function(u){return isNaN(u=+u)?0:(u>0?y:g)(u)},S=(h=!1,function(u,D){var e,t,r=String(function(u){if(null==u)throw TypeError("Can't call method on  "+u);return u}(u)),F=w(D),n=r.length;return F<0||F>=n?h?"":void 0:(e=r.charCodeAt(F))<55296||e>56319||F+1===n||(t=r.charCodeAt(F+1))<56320||t>57343?h?r.charAt(F):e:h?r.slice(F,F+2):t-56320+(e-55296<<10)+65536});m(m.P,"String",{codePointAt:function(u){return S(this,u)}});e.String.codePointAt;var b=Math.max,x=Math.min,N=String.fromCharCode,P=String.fromCodePoint;m(m.S+m.F*(!!P&&1!=P.length),"String",{fromCodePoint:function(u){for(var D,e,t,r=arguments,F=[],n=arguments.length,C=0;n>C;){if(D=+r[C++],t=1114111,((e=w(e=D))<0?b(e+t,0):x(e,t))!==D)throw RangeError(D+" is not a valid code point");F.push(D<65536?N(D):N(55296+((D-=65536)>>10),D%1024+56320));}return F.join("")}});e.String.fromCodePoint;var _,I,O,j,V,J,M,k,L,T,z,H,$,R,G={Space_Separator:/[\u1680\u2000-\u200A\u202F\u205F\u3000]/,ID_Start:/[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312E\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEA\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCA0-\uDCDF\uDCFF\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE83\uDE86-\uDE89\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F\uDFE0\uDFE1]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]/,ID_Continue:/[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u08D4-\u08E1\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u09FC\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9-\u0AFF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D00-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D54-\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1CD0-\u1CD2\u1CD4-\u1CF9\u1D00-\u1DF9\u1DFB-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312E\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEA\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDCA-\uDDCC\uDDD0-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE3E\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC00-\uDC4A\uDC50-\uDC59\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9\uDF00-\uDF19\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDCA0-\uDCE9\uDCFF\uDE00-\uDE3E\uDE47\uDE50-\uDE83\uDE86-\uDE99\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC36\uDC38-\uDC40\uDC50-\uDC59\uDC72-\uDC8F\uDC92-\uDCA7\uDCA9-\uDCB6\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD36\uDD3A\uDD3C\uDD3D\uDD3F-\uDD47\uDD50-\uDD59]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F\uDFE0\uDFE1]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6\uDD00-\uDD4A\uDD50-\uDD59]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/},U={isSpaceSeparator:function(u){return "string"==typeof u&&G.Space_Separator.test(u)},isIdStartChar:function(u){return "string"==typeof u&&(u>="a"&&u<="z"||u>="A"&&u<="Z"||"$"===u||"_"===u||G.ID_Start.test(u))},isIdContinueChar:function(u){return "string"==typeof u&&(u>="a"&&u<="z"||u>="A"&&u<="Z"||u>="0"&&u<="9"||"$"===u||"_"===u||"‌"===u||"‍"===u||G.ID_Continue.test(u))},isDigit:function(u){return "string"==typeof u&&/[0-9]/.test(u)},isHexDigit:function(u){return "string"==typeof u&&/[0-9A-Fa-f]/.test(u)}};function Z(){for(T="default",z="",H=!1,$=1;;){R=q();var u=X[T]();if(u)return u}}function q(){if(_[j])return String.fromCodePoint(_.codePointAt(j))}function W(){var u=q();return "\n"===u?(V++,J=0):u?J+=u.length:J++,u&&(j+=u.length),u}var X={default:function(){switch(R){case"\t":case"\v":case"\f":case" ":case" ":case"\ufeff":case"\n":case"\r":case"\u2028":case"\u2029":return void W();case"/":return W(),void(T="comment");case void 0:return W(),K("eof")}if(!U.isSpaceSeparator(R))return X[I]();W();},comment:function(){switch(R){case"*":return W(),void(T="multiLineComment");case"/":return W(),void(T="singleLineComment")}throw tu(W())},multiLineComment:function(){switch(R){case"*":return W(),void(T="multiLineCommentAsterisk");case void 0:throw tu(W())}W();},multiLineCommentAsterisk:function(){switch(R){case"*":return void W();case"/":return W(),void(T="default");case void 0:throw tu(W())}W(),T="multiLineComment";},singleLineComment:function(){switch(R){case"\n":case"\r":case"\u2028":case"\u2029":return W(),void(T="default");case void 0:return W(),K("eof")}W();},value:function(){switch(R){case"{":case"[":return K("punctuator",W());case"n":return W(),Q("ull"),K("null",null);case"t":return W(),Q("rue"),K("boolean",!0);case"f":return W(),Q("alse"),K("boolean",!1);case"-":case"+":return "-"===W()&&($=-1),void(T="sign");case".":return z=W(),void(T="decimalPointLeading");case"0":return z=W(),void(T="zero");case"1":case"2":case"3":case"4":case"5":case"6":case"7":case"8":case"9":return z=W(),void(T="decimalInteger");case"I":return W(),Q("nfinity"),K("numeric",1/0);case"N":return W(),Q("aN"),K("numeric",NaN);case'"':case"'":return H='"'===W(),z="",void(T="string")}throw tu(W())},identifierNameStartEscape:function(){if("u"!==R)throw tu(W());W();var u=Y();switch(u){case"$":case"_":break;default:if(!U.isIdStartChar(u))throw Fu()}z+=u,T="identifierName";},identifierName:function(){switch(R){case"$":case"_":case"‌":case"‍":return void(z+=W());case"\\":return W(),void(T="identifierNameEscape")}if(!U.isIdContinueChar(R))return K("identifier",z);z+=W();},identifierNameEscape:function(){if("u"!==R)throw tu(W());W();var u=Y();switch(u){case"$":case"_":case"‌":case"‍":break;default:if(!U.isIdContinueChar(u))throw Fu()}z+=u,T="identifierName";},sign:function(){switch(R){case".":return z=W(),void(T="decimalPointLeading");case"0":return z=W(),void(T="zero");case"1":case"2":case"3":case"4":case"5":case"6":case"7":case"8":case"9":return z=W(),void(T="decimalInteger");case"I":return W(),Q("nfinity"),K("numeric",$*(1/0));case"N":return W(),Q("aN"),K("numeric",NaN)}throw tu(W())},zero:function(){switch(R){case".":return z+=W(),void(T="decimalPoint");case"e":case"E":return z+=W(),void(T="decimalExponent");case"x":case"X":return z+=W(),void(T="hexadecimal")}return K("numeric",0*$)},decimalInteger:function(){switch(R){case".":return z+=W(),void(T="decimalPoint");case"e":case"E":return z+=W(),void(T="decimalExponent")}if(!U.isDigit(R))return K("numeric",$*Number(z));z+=W();},decimalPointLeading:function(){if(U.isDigit(R))return z+=W(),void(T="decimalFraction");throw tu(W())},decimalPoint:function(){switch(R){case"e":case"E":return z+=W(),void(T="decimalExponent")}return U.isDigit(R)?(z+=W(),void(T="decimalFraction")):K("numeric",$*Number(z))},decimalFraction:function(){switch(R){case"e":case"E":return z+=W(),void(T="decimalExponent")}if(!U.isDigit(R))return K("numeric",$*Number(z));z+=W();},decimalExponent:function(){switch(R){case"+":case"-":return z+=W(),void(T="decimalExponentSign")}if(U.isDigit(R))return z+=W(),void(T="decimalExponentInteger");throw tu(W())},decimalExponentSign:function(){if(U.isDigit(R))return z+=W(),void(T="decimalExponentInteger");throw tu(W())},decimalExponentInteger:function(){if(!U.isDigit(R))return K("numeric",$*Number(z));z+=W();},hexadecimal:function(){if(U.isHexDigit(R))return z+=W(),void(T="hexadecimalInteger");throw tu(W())},hexadecimalInteger:function(){if(!U.isHexDigit(R))return K("numeric",$*Number(z));z+=W();},string:function(){switch(R){case"\\":return W(),void(z+=function(){switch(q()){case"b":return W(),"\b";case"f":return W(),"\f";case"n":return W(),"\n";case"r":return W(),"\r";case"t":return W(),"\t";case"v":return W(),"\v";case"0":if(W(),U.isDigit(q()))throw tu(W());return "\0";case"x":return W(),function(){var u="",D=q();if(!U.isHexDigit(D))throw tu(W());if(u+=W(),D=q(),!U.isHexDigit(D))throw tu(W());return u+=W(),String.fromCodePoint(parseInt(u,16))}();case"u":return W(),Y();case"\n":case"\u2028":case"\u2029":return W(),"";case"\r":return W(),"\n"===q()&&W(),"";case"1":case"2":case"3":case"4":case"5":case"6":case"7":case"8":case"9":case void 0:throw tu(W())}return W()}());case'"':return H?(W(),K("string",z)):void(z+=W());case"'":return H?void(z+=W()):(W(),K("string",z));case"\n":case"\r":throw tu(W());case"\u2028":case"\u2029":!function(u){console.warn("JSON5: '"+nu(u)+"' in strings is not valid ECMAScript; consider escaping");}(R);break;case void 0:throw tu(W())}z+=W();},start:function(){switch(R){case"{":case"[":return K("punctuator",W())}T="value";},beforePropertyName:function(){switch(R){case"$":case"_":return z=W(),void(T="identifierName");case"\\":return W(),void(T="identifierNameStartEscape");case"}":return K("punctuator",W());case'"':case"'":return H='"'===W(),void(T="string")}if(U.isIdStartChar(R))return z+=W(),void(T="identifierName");throw tu(W())},afterPropertyName:function(){if(":"===R)return K("punctuator",W());throw tu(W())},beforePropertyValue:function(){T="value";},afterPropertyValue:function(){switch(R){case",":case"}":return K("punctuator",W())}throw tu(W())},beforeArrayValue:function(){if("]"===R)return K("punctuator",W());T="value";},afterArrayValue:function(){switch(R){case",":case"]":return K("punctuator",W())}throw tu(W())},end:function(){throw tu(W())}};function K(u,D){return {type:u,value:D,line:V,column:J}}function Q(u){for(var D=0,e=u;D<e.length;D+=1){var t=e[D];if(q()!==t)throw tu(W());W();}}function Y(){for(var u="",D=4;D-- >0;){var e=q();if(!U.isHexDigit(e))throw tu(W());u+=W();}return String.fromCodePoint(parseInt(u,16))}var uu={start:function(){if("eof"===M.type)throw ru();Du();},beforePropertyName:function(){switch(M.type){case"identifier":case"string":return k=M.value,void(I="afterPropertyName");case"punctuator":return void eu();case"eof":throw ru()}},afterPropertyName:function(){if("eof"===M.type)throw ru();I="beforePropertyValue";},beforePropertyValue:function(){if("eof"===M.type)throw ru();Du();},beforeArrayValue:function(){if("eof"===M.type)throw ru();"punctuator"!==M.type||"]"!==M.value?Du():eu();},afterPropertyValue:function(){if("eof"===M.type)throw ru();switch(M.value){case",":return void(I="beforePropertyName");case"}":eu();}},afterArrayValue:function(){if("eof"===M.type)throw ru();switch(M.value){case",":return void(I="beforeArrayValue");case"]":eu();}},end:function(){}};function Du(){var u;switch(M.type){case"punctuator":switch(M.value){case"{":u={};break;case"[":u=[];}break;case"null":case"boolean":case"numeric":case"string":u=M.value;}if(void 0===L)L=u;else {var D=O[O.length-1];Array.isArray(D)?D.push(u):D[k]=u;}if(null!==u&&"object"==typeof u)O.push(u),I=Array.isArray(u)?"beforeArrayValue":"beforePropertyName";else {var e=O[O.length-1];I=null==e?"end":Array.isArray(e)?"afterArrayValue":"afterPropertyValue";}}function eu(){O.pop();var u=O[O.length-1];I=null==u?"end":Array.isArray(u)?"afterArrayValue":"afterPropertyValue";}function tu(u){return Cu(void 0===u?"JSON5: invalid end of input at "+V+":"+J:"JSON5: invalid character '"+nu(u)+"' at "+V+":"+J)}function ru(){return Cu("JSON5: invalid end of input at "+V+":"+J)}function Fu(){return Cu("JSON5: invalid identifier character at "+V+":"+(J-=5))}function nu(u){var D={"'":"\\'",'"':'\\"',"\\":"\\\\","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t","\v":"\\v","\0":"\\0","\u2028":"\\u2028","\u2029":"\\u2029"};if(D[u])return D[u];if(u<" "){var e=u.charCodeAt(0).toString(16);return "\\x"+("00"+e).substring(e.length)}return u}function Cu(u){var D=new SyntaxError(u);return D.lineNumber=V,D.columnNumber=J,D}return {parse:function(u,D){_=String(u),I="start",O=[],j=0,V=1,J=0,M=void 0,k=void 0,L=void 0;do{M=Z(),uu[I]();}while("eof"!==M.type);return "function"==typeof D?function u(D,e,t){var r=D[e];if(null!=r&&"object"==typeof r)for(var F in r){var n=u(r,F,t);void 0===n?delete r[F]:r[F]=n;}return t.call(D,e,r)}({"":L},"",D):L},stringify:function(u,D,e){var t,r,F,n=[],C="",A="";if(null==D||"object"!=typeof D||Array.isArray(D)||(e=D.space,F=D.quote,D=D.replacer),"function"==typeof D)r=D;else if(Array.isArray(D)){t=[];for(var i=0,E=D;i<E.length;i+=1){var o=E[i],a=void 0;"string"==typeof o?a=o:("number"==typeof o||o instanceof String||o instanceof Number)&&(a=String(o)),void 0!==a&&t.indexOf(a)<0&&t.push(a);}}return e instanceof Number?e=Number(e):e instanceof String&&(e=String(e)),"number"==typeof e?e>0&&(e=Math.min(10,Math.floor(e)),A="          ".substr(0,e)):"string"==typeof e&&(A=e.substr(0,10)),c("",{"":u});function c(u,D){var e=D[u];switch(null!=e&&("function"==typeof e.toJSON5?e=e.toJSON5(u):"function"==typeof e.toJSON&&(e=e.toJSON(u))),r&&(e=r.call(D,u,e)),e instanceof Number?e=Number(e):e instanceof String?e=String(e):e instanceof Boolean&&(e=e.valueOf()),e){case null:return "null";case!0:return "true";case!1:return "false"}return "string"==typeof e?B(e):"number"==typeof e?String(e):"object"==typeof e?Array.isArray(e)?function(u){if(n.indexOf(u)>=0)throw TypeError("Converting circular structure to JSON5");n.push(u);var D=C;C+=A;for(var e,t=[],r=0;r<u.length;r++){var F=c(String(r),u);t.push(void 0!==F?F:"null");}if(0===t.length)e="[]";else if(""===A){var i=t.join(",");e="["+i+"]";}else {var E=",\n"+C,o=t.join(E);e="[\n"+C+o+",\n"+D+"]";}return n.pop(),C=D,e}(e):function(u){if(n.indexOf(u)>=0)throw TypeError("Converting circular structure to JSON5");n.push(u);var D=C;C+=A;for(var e,r,F=t||Object.keys(u),i=[],E=0,o=F;E<o.length;E+=1){var a=o[E],B=c(a,u);if(void 0!==B){var f=s(a)+":";""!==A&&(f+=" "),f+=B,i.push(f);}}if(0===i.length)e="{}";else if(""===A)r=i.join(","),e="{"+r+"}";else {var l=",\n"+C;r=i.join(l),e="{\n"+C+r+",\n"+D+"}";}return n.pop(),C=D,e}(e):void 0}function B(u){for(var D={"'":.1,'"':.2},e={"'":"\\'",'"':'\\"',"\\":"\\\\","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t","\v":"\\v","\0":"\\0","\u2028":"\\u2028","\u2029":"\\u2029"},t="",r=0;r<u.length;r++){var n=u[r];switch(n){case"'":case'"':D[n]++,t+=n;continue;case"\0":if(U.isDigit(u[r+1])){t+="\\x00";continue}}if(e[n])t+=e[n];else if(n<" "){var C=n.charCodeAt(0).toString(16);t+="\\x"+("00"+C).substring(C.length);}else t+=n;}var A=F||Object.keys(D).reduce(function(u,e){return D[u]<D[e]?u:e});return A+(t=t.replace(new RegExp(A,"g"),e[A]))+A}function s(u){if(0===u.length)return B(u);var D=String.fromCodePoint(u.codePointAt(0));if(!U.isIdStartChar(D))return B(u);for(var e=D.length;e<u.length;e++)if(!U.isIdContinueChar(String.fromCodePoint(u.codePointAt(e))))return B(u);return u}}}});

/* doing the same thing as workbox here? */
const cacheName$1 = "{{VERSION}}";

self.addEventListener("install", installHandler);
self.addEventListener("activate", activateHandler);
self.addEventListener("fetch", asyncFetchHandler);
self.addEventListener("foreignfetch", asyncFetchHandler);
self.addEventListener("message", messageHandler);
self.addEventListener("sync", syncHandler);
self.addEventListener("push", pushHandler);

self.handlers = [];
const driver = [
	localforage.INDEXEDDB,
	localforage.WEBSQL,
	localforage.LOCALSTORAGE,
];

let handlerStore;
function getHandlerStore() {
	return (
		handlerStore ||
		localforage.createInstance({
			driver,
			name: "service-worker",
			version: 1.0,
			storeName: "handlers",
			description: "used after app has booted when service worker is updated",
		})
	);
}
handlerStore = getHandlerStore();

Handler.init();

const activateHandlers = async () => {
	handlerStore = getHandlerStore();

	return await handlerStore.iterate((value, key) => {
		const { type, route, handlerName, handlerText } = value;
		//this (and the fact that all handlers currently use it) ensures that ./modules/serviceRequestHandler.js is a singleton
		const foundHandler = handlers.find((x) => x.handlerName === handlerName);

		const foundExactHandler =
			foundHandler &&
			handlers.find(
				(x) => x.handlerName === handlerName && x.routePattern === route
			);
		if (foundExactHandler) {
			//console.log(`handler was already installed for ${foundExactHandler.routePattern}`);
			return;
		}
		let handlerFunction;
		if (!foundHandler) {
			try {
				handlerFunction = eval(handlerText);
			} catch (e) {
				handlerFunction = self.handler;
			}
		}

		//console.log(`handler installed for ${route} (from indexDB handlerStore)`);
		handlers.push({
			type,
			routePattern: route,
			route: type === "fetch" ? new RegExp(route) : route,
			handler: handlerFunction || foundHandler.handler,
			handlerName,
			handlerText,
		});
	});
};

async function installHandler(event) {
	console.log("service worker install event");
	return self.skipWaiting();
}

function activateHandler(event) {
	console.log("service worker activate event");
	event.waitUntil(
		(async () => {
			await self.clients.claim();
			return await activateHandlers();
		})()
	);
	// cause clients to reload?
	//self.clients.matchAll({ type: 'window' })
	// 	.then(clients => {
	// 		for (const client of clients) {
	// 			client.navigate(client.url);
	// 		}
	// 	});
}

function asyncFetchHandler(event) {
	if (
		event.request.url.includes("https://crosshj.auth0.com") ||
		event.request.url.includes("index.bootstrap") ||
		event.request.url.includes("localhost:3333") ||
		event.request.url.includes("allorigins")
	) {
		return;
	}
	if (
		event.request.url.includes("browser-sync/socket.io") ||
		event.request.url.includes("browser-sync/browser-sync-client") ||
		event.request.url.includes("?browsersync=") // this is how css gets injected
	) {
		return;
	}
	// do not use or update cache
	if (
		event.request.cache === "no-store" ||
		(event.request.headers.get("pragma") === "no-cache" &&
			event.request.headers.get("cache-control") === "no-cache")
	) {
		return;
	}

	// if (event.request.cache === 'only-if-cached' && event.request.mode !== 'same-origin') {
	// 	debugger;
	// 	return;
	// }

	// if (
	// 	!event.request.url.includes('/bartok/') &&
	// 	!event.request.url.includes('/shared/')
	// ) {
	// 	return;
	// }

	if (
		event.request.url.includes("unpkg") ||
		event.request.url.includes("cdn.jsdelivr") ||
		event.request.url.includes("rawgit.com") ||
		event.request.url.includes("cdn.skypack.dev")
	) {
		const response = async () => {
			const cache = await caches.open(cacheName$1);
			const cacheResponse = await cache.match(event.request);
			if(cacheResponse) return cacheResponse;

			const networkResponse = await fetch(event.request);
			cache.put(event.request, networkResponse.clone());
			return networkResponse;
		};
		event.respondWith(response());
		return;
	}

	if (
		event.request.url.includes("https://webtorrent.io/torrents/") ||
		event.request.url.includes("api.github.com")
	) {
		return;
	}

	event.respondWith(
		(async function () {
			if (!handlers.length) {
				await activateHandlers();
			}
			const res = await fetchHandler(event);
			// if(!res){
			// 	return new Response('error handling this request!  see service-worker.js', {headers:{'Content-Type': 'text/html'}});
			// }
			return res;
		})()
	);
}

async function fetchHandler(event) {
	const routeHandlerBlacklist = ["//(.*)"];

	const safeHandlers = handlers.filter(
		(x) => !routeHandlerBlacklist.includes(x.routePattern)
	);
	const path = event.request.url.replace(location.origin, "");
	const foundHandler = safeHandlers.find((x) => {
		return x.type === "fetch" && x.route.test(path);
	});
	if (foundHandler) {
		//console.log(foundHandler)
		//TODO: check if the handler returns a response object, otherwise don't use it??
		//return foundHandler.handler(event);
		return self.handler(event);
	}

	const cacheMatch = await caches.match(event.request);
	if (cacheMatch) return cacheMatch;

	return await fetch(event.request);
}

function messageHandler(event) {
	/*
		all events should be sent through here

		an event handler can be registered here

		handlers can be listed (for service map)
	*/
	const { data } = event;
	const { bootstrap } = data || {};

	if (bootstrap) {
		(async () => {
			try {
				console.log("booting");
				const bootstrapMessageEach = (module) => {
					const client = event.source;
					if (!client) {
						console.error("failed to notify client on boot complete");
						return;
					}
					client.postMessage({ module, msg: "module-loaded" });
				};
				const modules = await bootstrapHandler(bootstrap, bootstrapMessageEach);

				const client = event.source;
				if (!client) {
					console.error("failed to notify client on boot complete");
					return;
				}
				client.postMessage({
					modules: modules.filter((x) => {
						return !x.includes || !x.includes("NOTE:");
					}),
					msg: "boot complete",
				});
			} catch (e) {
				console.log(e);
				const client = event.source;
				if (!client) {
					console.error("failed to notify client on boot complete");
					return;
				}
				client.postMessage({
					msg: "boot error - you offline?",
				});
			}
		})();
		return;
	}
	console.log("service worker message event");
	console.log({ data });
}

function syncHandler(event) {
	console.log("service worker sync event");
}

function pushHandler(event) {
	console.log("service worker push event");
}

// ----

async function bootstrapHandler({ manifest }, bootstrapMessageEach) {
	//console.log({ manifest});
	const manifestResponse = await fetch(manifest);
	const _manifest = JSON5.parse(await manifestResponse.text());
	const _source = new Response(JSON.stringify(_manifest, null, 2), {
		status: manifestResponse.status,
		statusText: manifestResponse.statusText,
		headers: manifestResponse.headers,
	});
	await caches.open(cacheName$1).then(function (cache) {
		cache.put(manifest, _source);
	});

	const { modules } = _manifest || {};
	if (!modules || !Array.isArray(modules)) {
		console.error("Unable to find modules in service manifest");
		return;
	}
	//should only register modules that are not in cache
	//await Promise.all(modules.map(registerModule));
	for (var i = 0, len = modules.length; i < len; i++) {
		await registerModule(modules[i]);
		bootstrapMessageEach(modules[i]);
	}
	return modules;
}
async function registerModule(module) {
	try {
		if (module.includes && module.includes("NOTE:")) {
			return;
		}
		const { source, include, route, handler, resources, type } = module;
		if (!route && !resources) {
			console.error(
				"module must be registered with a route or array of resources!"
			);
			return;
		}

		/*
	if handler is defined, matching routes will be handled by this function
	(optionally, the handler could listen to messages - not sure how that works right now)
	should instantiate this function and add it to handlers, but also add to DB
	*/
		if (handler) {
			let foundHandler = handlers.find((x) => x.handlerName === handler);
			let handlerFunction, handlerText;
			if (handler === "./modules/service-worker.handler.js" && self.handler) {
				handlerText = "service-worker-handler-register-module";
				handlerFunction = self.handler;
				foundHandler = { handler, handlerText };
			}
			if (!foundHandler || !foundHandler.handler) {
				handlerText = await (await fetch(handler)).text();
				handlerFunction = eval(handlerText);
			}
			const foundExactHandler =
				foundHandler &&
				handlers.find(
					(x) => x.handlerName === handler && x.routePattern === route
				);
			if (foundExactHandler) {
				//console.log(`handler was already installed for ${foundExactHandler.routePattern} (boot)`);
				return;
			}
			await handlerStore.setItem(route, {
				type,
				route,
				handlerName: handler,
				handlerText: handlerText || foundHandler.handlerText,
			});
			//console.log(`handler installed for ${route} (boot)`);
			handlers.push({
				type,
				routePattern: route,
				route: type === "fetch" ? new RegExp(route) : route,
				handler: handlerFunction || foundHandler.handler,
				handlerName: handler,
				handlerText: handlerText || foundHandler.handlerText,
			});
			return;
		}

		if (resources) {
			await Promise.all(
				resources.map(async (resourceUrl) => {
					const opts = {};
					if (resourceUrl.includes(".htm")) {
						opts.headers = opts.headers || {};
						opts.headers["Accept"] = opts.headers["Accept"] || "";
						opts.headers["Accept"] = "text/html," + opts.headers["Accept"];
					}
					const response = await fetch(resourceUrl, opts);

					return await caches.open(cacheName$1).then(function (cache) {
						cache.put(resourceUrl, response);
					});
				})
			);
		}

		if (include) {
			const response = await fetch(source);
			const extra = [];
			await Promise.all(
				include.map(async (x) => {
					const text = await (await fetch(x)).text();
					extra.push(`\n\n/*\n\n${x}\n\n*/ \n ${text}`);
				})
			);

			let modified =
				`/* ${source} */\n ${await response.text()}` + extra.join("");

			const _source = new Response(modified, {
				status: response.status,
				statusText: response.statusText,
				headers: response.headers,
			});
			return await caches.open(cacheName$1).then(function (cache) {
				cache.put(route, _source);
			});
		}

		/*
	if source is defined, service worker will respond to matching routes with this
	(which means this is pretty much a script? resource being registered)
	should fetch this resource and add to cache & DB
	*/
		//console.log({ source, route, handler });
		if (source) {
			const _source = await fetch(source);
			return caches.open(cacheName$1).then(function (cache) {
				cache.put(route, _source);
			});
		}
	} catch (e) {
		console.error("failed to register module");
		console.log(module);
		console.log(e);
	}
}
