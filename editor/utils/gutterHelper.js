function attachGutterHelper(editorGutter){
	const getSizers = () => Array.from(document.querySelectorAll(".CodeMirror-sizer"));
	const getGutter = () => editorGutter || document.body.querySelector('.CodeMirror-gutters');

	let gutter = getGutter();
	let inGutter;
	let gutterNoted;

	const removeGutterHovered = () => {
		const cmSizers = getSizers();
		if(!cmSizers.length) return;
		cmSizers.forEach(x => x.classList.remove('gutter-hovered'));
		gutterNoted = false;
	};
	const addGutterHovered = () => {
		const cmSizers = getSizers();
		if(!cmSizers.length) return;
		cmSizers.forEach(x => x.classList.add('gutter-hovered'));
		gutterNoted = true;
	};

	const gutterHandler = (e) => {
		gutter = getGutter();
		if(!gutter) return removeGutterHovered();

		const { className="", classList } = e.target;
		inGutter = gutter.contains(e.target) ||
			classList.contains('CodeMirror-gutters') ||
			classList.contains('gutter-elt') ||
			classList.contains('guttermarker') ||
			(className.includes && className.includes('CodeMirror-guttermarker'));

		if(inGutter && !gutterNoted) return addGutterHovered();
		if(!inGutter && gutterNoted) return removeGutterHovered();
	};

	const listenOpts = { passive: true, capture: false };
	document.body.addEventListener("mouseover", gutterHandler, listenOpts);
}

export default attachGutterHelper;
