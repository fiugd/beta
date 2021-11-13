import { getCurrentService } from "../../utils/State.js";

const listener = (event, context) => {
	const { searchProject } = context.tree;
	const service = getCurrentService();
	const include = `./${currentServiceName}/`;
	searchProject({ hideSearch: false, include }, context);
};

export default listener;
