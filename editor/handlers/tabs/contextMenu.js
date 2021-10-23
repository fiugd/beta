const handler = (event, { showMenu }) => {
	const editorDom = document.querySelector("#editor-tabs-container");
	if (!editorDom.contains(event.target)) {
		return true;
	}
	event.preventDefault();

	const tabBarClicked = event.target.id === "editor-tabs";
	const theTab =
		!tabBarClicked && event.target.classList.contains("tab")
			? event.target
			: undefined;
	const theTabId = theTab && theTab.id;
	const tab = theTab && tabs.find((x) => x.id === theTabId);
	// TODO: maybe these should be defined in UI Module
	// filter actions based on whether tab was found or not
	const barClickItems = [{ name: "Close All" }];
	const multiTabsItems = [
		"Close",
		{ name: "Close Others" },
		{ name: "Close All" },
		"-------------------",
		"Copy Path",
		"Copy Relative Path",
		//"-------------------",
		//"Reveal in Side Bar",
		//"-------------------",
		//{ name: "Keep Open", disabled: true },
		//{ name: "Pin", disabled: true },
	];
	const tabClickItems = [
		"Close",
		"-------------------",
		"Copy Path",
		"Copy Relative Path",
		//"-------------------",
		//"Reveal in Side Bar",
		//"-------------------",
		//{ name: "Keep Open", disabled: true },
		//{ name: "Pin", disabled: true },
	];

	const listItems = (tab
		? tabs.length > 1
			? multiTabsItems
			: tabClickItems
		: barClickItems
	).map((x) =>
		x === "-------------------"
			? "seperator"
			: typeof x === "string"
			? { name: x, disabled: false }
			: x
	);
	let data;
	try {
		data = { tab };
	} catch (e) {}

	if (!data) {
		console.error("some issue finding data for this context click!");
		return;
	}

	showMenu()({
		x: event.clientX,
		y: event.clientY,
		list: listItems,
		parent: "Tab Bar",
		data,
	});
	return false;
};

export default handler;
