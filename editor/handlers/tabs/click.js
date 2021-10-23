import { getCurrentService } from "../../state.js";

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
		triggerCloseTab(event, triggers["fileClose"]);
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
