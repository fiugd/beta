import { getCurrentService } from "../../state.js";

function removeTabByEventDetail({ removeTab, updateTab }, eventDetail, tabs){
	let { name, filename, path, parent, next, nextPath } = eventDetail;
	name = name || filename;
	path = path || parent;

	const service = getCurrentService({ pure: true });

	if(!path && name?.includes('/')){
		path = name.split('/').slice(0,-1).join('/');
		name = name.split('/').pop();
	}
	if(!nextPath && next?.includes('/')){
		nextPath = next.split('/').slice(0,-1).join('/');
		next = next.split('/').pop();
	}
	let closedFullName = path ? `${path}/${name}` : name;
	if(service?.name && new RegExp("^" + service.name).test(closedFullName)){
		closedFullName = closedFullName.replace(service.name+'/', '');
	}

	const tabFullName = (x) => (x.parent ? `${x.parent}/${x.name}` : x.name);
	const found = tabs.api.find((x) => tabFullName(x) === closedFullName);
	if(!found) return;
	
	tabs.api.update(
		tabs.api.list().filter((x) => tabFullName(x) != closedFullName)
	);

	if(next || !tabs.find(x => x.active)){
		const nextTab = next && tabs.api.find(
			(x) => (x.name === next && x.parent === nextPath) || x.systemDocsName === next
		);
		const tabToActivate = nextTab || tabs[tabs.length-1];
		if(tabToActivate){
			tabToActivate.active = true;
			updateTab(tabToActivate);
		}
	}

	//localStorage.setItem("tabs/"+(service?.name||''), JSON.stringify(tabs));
	removeTab(found);
}

const handler = (e, { tabs }) => {
	const { removeTab, updateTab } = tabs.operations;
	removeTabByEventDetail({ removeTab, updateTab }, event.detail, tabs);
};

export default handler;
