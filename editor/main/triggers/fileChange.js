import { getCurrentService, setState } from "../../utils/State.js";

const trigger = {
	data: (event) => {
		setState(event);
		const service = getCurrentService({ pure: true });
		const eventOut = {
			...event,
			service: service ? service.name : undefined
		}
		return eventOut;
	}
};

export default trigger;
