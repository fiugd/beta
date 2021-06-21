/*
const module = { exports: {} };
(async () => {

	await import('../modules/service-worker.services.js');
	console.log(module.exports);
	
	
	
}();
*/
const module = { exports: {} };
(async () => {

	await import('../modules/service-worker.services.js');
	
	console.log('hello')
})();