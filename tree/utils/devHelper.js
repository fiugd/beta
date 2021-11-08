/*

this code is useful when testing and developing, but less so otherwise

*/

import { DEBUG, initState } from './State.js';
import { list, trigger as rawTrigger  } from "./EventSystem.js";

const module = async () => {
	const isRunningAsModule = document.location.href.includes("_/modules");
	if(!isRunningAsModule){
		const ROOT_SERVICE_ID = 0;
		const currentServiceId = localStorage.getItem('lastService') || ROOT_SERVICE_ID;
		const serviceUrl = `/service/read/${currentServiceId}`;
		const { result: [service] } = await fetch(serviceUrl).then(x => x.json())
		DEBUG && console.log(service)

		initState([service], service);
		rawTrigger({
			e: {},
			type: 'operationDone',
			params: {},
			source: {},
			data: {},
			detail: {
				op: 'read',
				id: service.id,
				result: [service]
			}
		});
		DEBUG && console.log(
			'Listeners:\n' + 
			list().map(x => x.split('__').reverse().join(': '))
			.sort()
			.join('\n')
		);
		DEBUG && console.log(
			'Triggers:\n' + 
			listTriggers().map(x => x.split('__').reverse().join(': '))
			.sort()
			.join('\n')
		);
	}
};

export default { module };