const notFound = () => {
	document.body.innerHTML = 'not found';
};
const loadRepo = (path) => {
	console.log('load repo: '+path)
};
const onload = () => {
	if(window === window.parent) return notFound();
	const path = document.location.pathname.slice(1);
	const isRepoPath = new RegExp('^[a-zA-Z]*\/[a-zA-Z]*$').test(path)
	if(!isRepoPath) return notFound();
	loadRepo(path);
};

window.onload = onload;
