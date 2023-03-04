import localforage from "https://cdn.skypack.dev/localforage";
const { createInstance } = localforage;

const getStores = (def) => {
	const it = (all, [name, storeName]) => {
		all[storeName] = createInstance({ name, storeName });
		return all;
	};
	return def.reduce(it, {});
};

const getItems = (store) => new Promise(async (resolve) => {
	const all = [];
	const it = (value, key) => { all[key] = value; };
	await store.iterate(it);
	resolve(all);
});

const storesDef = [
	['service-worker', 'changes'],
	['service-worker', 'files'],
	['service-worker', 'services'],
	['editorState', 'editor'],
];

const stores = getStores(storesDef);
const changes = await getItems(stores.changes);
const services = await getItems(stores.services);

console.table(changes);
console.table(services);

console.log('\nChanges: \n\n'+Object.keys(changes).join('\n'));
console.log('\nServices: \n\n'+services.map(v => `[${v.id}] ${v.name}`).join('\n'));

console.log('\nTODO: clear a given service\'s files/settings');
