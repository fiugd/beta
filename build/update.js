/*

NOTE: this is currently out-of-date

this should be used to update files which are cached in service-worker
essentially, this is a "local build" which can update the app in place to test before commiting

*/

const semVer = `([0-9]+(\.[0-9]+)+)`;
const iso8601Date = `[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]+)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?`;
const semVerDateRegex = new RegExp(`v${semVer}\$`);

const getCacheName = async () => {
	const allCaches = await caches.keys();
	const allVersioned = allCaches
		.filter(x => semVerDateRegex.exec(x))
	return allVersioned.sort().reverse()[0];
};

const cacheName = await getCacheName();
const root = `https://beta.fiug.dev`;
const cache = await caches.open(cacheName);


const updates = [[
	`/fiugd/beta/shared/vendor/codemirror/addon.bundle.js`,
	`/shared/vendor/codemirror/addon.bundle.js`
],[
	`/fiugd/beta/shared/vendor/codemirror/mode.bundle.js`,
	`/shared/vendor/codemirror/mode.bundle.js`
],[
	`/fiugd/beta/shared/modules/utilities.mjs`,
	`/shared/modules/utilities.mjs`
],[
	`/fiugd/beta/shared/modules/editor.mjs`,
	`/shared/modules/editor.mjs`
],[
	`/fiugd/beta/shared/images/faviconBeta.svg`,
	`/shared/images/faviconBeta.svg`
],[
	`/fiugd/beta/shared/icons/seti/ext.json.mjs`,
	`/shared/icons/seti/ext.json.mjs`
],[
	`/fiugd/beta/modules/Editor.mjs`,
	`/_/modules/Editor.mjs`
],[
	`/fiugd/beta/modules/TreeView.mjs`,
	`/_/modules/TreeView.mjs`
],[
	`/fiugd/beta/modules/editorEvents.mjs`,
	`/_/modules/editorEvents.mjs`
],[
	`/fiugd/beta/modules/treeEvents.mjs`,
	`/_/modules/treeEvents.mjs`
],[
	`/fiugd/beta/modules/statusBarEvents.mjs`,
	`/_/modules/statusBarEvents.mjs`
],[
	`/fiugd/beta/modules/editorTabsEvents.mjs`,
	`/_/modules/editorTabsEvents.mjs`
],[
	`/fiugd/beta/modules/operationsEvents.mjs`,
	`/_/modules/operationsEvents.mjs`
],[
	`/fiugd/beta/modules/statusBarEvents.mjs`,
	`/_/modules/statusBarEvents.mjs`
],[
	`/fiugd/beta/modules/state.mjs`,
	`/_/modules/state.mjs`
],

//terminal
[
	`/fiugd/beta/modules/Terminal.mjs`,
	`/_/modules/Terminal.mjs`
],[
	`/fiugd/beta/terminal/terminal.html`,
	`/_/modules/terminal/index.html`
],[
	`/fiugd/beta/terminal/terminal.js`,
	`/_/modules/terminal/terminal.js`
],[
	`/fiugd/beta/terminal/terminal.ops.js`,
	`/_/modules/terminal/terminal.ops.js`
],[
	`/fiugd/beta/terminal/terminal.history.js`,
	`/_/modules/terminal/terminal.history.js`
],[
	`/fiugd/beta/terminal/terminal.git.js`,
	`/_/modules/terminal/terminal.git.js`
],[
	`/fiugd/beta/terminal/terminal.css`,
	`/_/modules/terminal/terminal.css`
],[
	`/fiugd/beta/terminal/terminal.lib.js`,
	`/_/modules/terminal/terminal.lib.js`
],[
	`/fiugd/beta/terminal/terminal.utils.js`,
	`/_/modules/terminal/terminal.utils.js`
]];

const updateCache = async (source, target) => {
	const bundleText = await fetch(root+source).then(x => x.text());
	let contentType = 'application/javascript; charset=utf-8';
	if(target.endsWith('.svg')) contentType = 'image/svg+xml';
	if(target.endsWith('.html')) contentType = 'text/html';
	const opts = {
		headers: {
			'Content-Type': contentType
		}
	};
	await cache.put(root+target, new Response(bundleText, opts));
};

for(var i=0, len=updates.length; i<len; i++){
	await updateCache(...updates[i]);
}

console.log(`\nupdated cache [${cacheName}]:\n\n${updates.map(([,x]) => x).join('\n')}`);


const importMap = {
	"imports": {
		"chalk": "https://cdn.skypack.dev/chalk",
		//"chalk": "https://cdn.skypack.dev/-/chalk@v2.4.2-3J9R9FJJA7NuvPxkCfFq/dist=es2020,mode=imports/optimized/chalk.js",
		//"chalk/": "https://cdn.skypack.dev/-/chalk/",
	}
};
const importMapResponse = new Response(
	JSON.stringify(importMap, null, 2),
	{
		headers: {
			'Content-Type': 'application/importmap+json; charset=utf-8'
		}
	}
);
await cache.put(root+'/importmap.importmap', importMapResponse);
console.log(`also added /importmap.importmap`);
