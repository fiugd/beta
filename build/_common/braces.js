export default (url) => {
	const blacklist = [
		'jsdelivr',
		'skypack.dev',
		'unpkg'
	];
	if(blacklist.find(x => url.includes(x))) return url;
	return `˹${url}˺`;
};
