const listener = (e, context) => {
	let { name, next, collapse } = e.detail;

	if (collapse) {
		return;
	}

	let split;

	if ((name || next).includes("/")) {
		console.log(`tree path: ${name || next}`);
		console.error("should be opening all parent folders");
		split = (name || next).split("/").filter((x) => !!x);
		//name = split[split.length-1];
	} else {
		split = [name || next];
	}

	// Array.from(
	// 	document.querySelectorAll('#tree-view .selected')||[]
	// )
	// 	.forEach(x => x.classList.remove('selected'));

	const leaves = Array.from(
		document.querySelectorAll("#tree-view .tree-leaf-content") || []
	);

	split.forEach((spl, i) => {
		const found = leaves.find((x) => {
			return x.innerText.includes(spl);
		});
		if (!found) {
			return;
		}
		if (i === split.length - 1) {
			tree.selected = spl;
			//found.classList.add('selected');
		}
		const expando = found.querySelector(".tree-expando");
		expando && expando.classList.remove("closed");
		expando && expando.classList.add("expanded", "open");
		const childLeaves = found.parentNode.querySelector(".tree-child-leaves");
		childLeaves && childLeaves.classList.remove("hidden");
	});
};

export default listener;