import { sleep } from './.example_import.js';

(async () => {
	console.log('start execution');
	//throw new Error('error test');
	sleep(3000);
	console.log('end execution');
})();
