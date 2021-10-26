import { getCurrentService } from "../../state.js";

function triggerCloseTab(event, fileCloseTrigger, tabs) {
	let name, parent;
	try {
		name = event.target.dataset.name.trim();
		parent = (event.target.dataset.parent||'').trim();
	} catch (e) {
		console.log("error trying to handle close tab click");
		console.log(e);
	}
	if (!name) {
		return;
	}
	const closedFullName = parent ? `${parent}/${name}` : name;
	const tabFullName = (x) => (x.parent ? `${x.parent}/${x.name}` : x.name);

	const closedTab = tabs.find((x) => closedFullName === tabFullName(x));
	const nextTabs = tabs.filter((x) => closedFullName !== tabFullName(x));
	const nextTab = closedTab.active
		? (nextTabs[nextTabs.length - 1] || {})
		: (tabs.filter((x) => x.active) || [{}])[0];

	fileCloseTrigger({
		detail: {
			name: closedTab.name,
			path: closedTab.parent,
			next: nextTab.name,
			nextPath: nextTab.parent,
		},
	});
}

const handler = (e, context) => {
	const { tabs, triggers } = context;
	const container = tabs;

	if (!container.contains(event.target)) {
		//console.log('did not click any tab container element');
		return;
	}
	if (
		!event.target.classList.contains("tab") &&
		!event.target.classList.contains("close-editor-action")
	) {
		return;
	}

	if (event.target.classList.contains("close-editor-action")) {
		triggerCloseTab(event, triggers["fileClose"], tabs.api.list());
		event.preventDefault();
		return;
	}
	const id = event.target.id;

	const foundTab = tabs.api.list().find((x) => x.id === id);
	if (
		tabs.api.list()
			.filter((x) => x.active)
			.map((x) => x.id)
			.includes(id)
	) {
		return;
	}

	//TODO: keep track of the order which tabs are clicked

	// const { tabsToUpdate, foundTab } = getTabsToUpdate(name);
	// tabsToUpdate.map(updateTab);
	const service = getCurrentService({ pure: true });

	triggers["fileSelect"]({
		detail: {
			name: foundTab.name,
			path: foundTab.parent,
			parent: foundTab.parent,
			service: service ? service.name : '',
		},
	}, context);
};

export default handler;
