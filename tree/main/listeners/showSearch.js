import { getCurrentService } from "../../utils/State.js";

const listener = (event, context) => {
	const { searchProject } = context.tree;
	const service = getCurrentService();
	const include = `./${service.name}/`;
	searchProject({ hideSearch: false, include }, context);
};

export default listener;
