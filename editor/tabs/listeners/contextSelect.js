function copyPath(data, relative) {
	const state = getState();
	const { name } = data;
	let url;
	try {
		url = state.paths
			.find((x) => x.name === name)
			.path.replace("/welcome/", "/.welcome/")
			.replace(/^\//, "./");
	} catch (e) {}
	if (!url) {
		console.log("TODO: make Copy Path work with folders!");
		return;
	}
	const path = relative ? url : new URL(url, document.baseURI).href;
	navigator.clipboard
		.writeText(path)
		.then((x) => console.log(`Wrote path to clipboard: ${path}`))
		.catch((e) => {
			console.error(`Error writing path to clipboard: ${path}`);
			console.error(e);
		});
}

// TODO: should make sure that this editor instance is the originator of context request
const handler = (event, context) => {
	const { tabs, triggers: { tabs: triggers} } = context;

	const { which, parent, data } = event.detail || {};
	if (parent !== "Tab Bar") return;
	const NOT_IMPLEMENTED = (fn) => () =>
		setTimeout(() => alert(fn + ": not implemented"), 0);
	const handler = {
		close: ({ tab }) => triggers.fileClose({ detail: tab }),
		closeothers: triggers.closeOthers,
		closeall: triggers.closeAll,
		copypath: ({ tab }) => copyPath(tab),
		copyrelativepath: ({ tab }) => copyPath(tab, "relative"),
		revealinsidebar: ({ tab }) => {
			triggers.fileSelect({ detail: tab });
			//TODO: this will not work inside editor iframe !!!
			document.getElementById("explorer").focus();
		},
		keepopen: NOT_IMPLEMENTED("keepopen"),
		pin: NOT_IMPLEMENTED("pin"),
	}[which.toLowerCase().replace(/ /g, "")];

	handler && handler(data);
};

export default handler;
