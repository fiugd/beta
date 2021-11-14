import { setState, getState } from '../../utils/State.js';

const operationDoneListener = (e, context) => {
	const { newTree } = context.tree;
	const { id, result, op } = e.detail;
	const { selected, expanded=[], tree } = getState();

	if (!id) {
		//console.log(`No ID for: ${e.type} - ${op}`);
		return;
	}

	//console.log(e.detail);
	if (e.type === "operationDone" && op === "update") {
		//TODO: maybe pay attention to what branches are expanded/selected?
		setState("selected", tree ? tree.selected : undefined);
		setState("expanded", (tree ? tree.expanded : undefined) || expanded);

		tree && tree.off();
		setState("tree", undefined);
	}

	if (result.length > 1) {
		return; // TODO: this is right???
	}

	/*
		when operationDone, probably means service has been loaded

		get newTree method from UpdateTree to create tree
			- requires tree state and service
			- those are safe to get here
	*/
	setState("currentService", result[0]);

	newTree({
		service: result[0],
		treeState: result[0].treeState
	}, context);
};

export default operationDoneListener;
