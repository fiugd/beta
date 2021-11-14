import { getCurrentService } from "../../utils/State.js";

const showSearchListener = (event, context) => {
	const { searchProject } = context.tree;
	const service = getCurrentService();
	const include = `./${service.name}/`;
	searchProject({ hideSearch: false, include }, context);
};

export default showSearchListener;
