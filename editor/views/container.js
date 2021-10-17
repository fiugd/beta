//This is used by inlineEditor
const Container = () => {
	const prevConatiner = document.querySelector("#full-page-container");
	if (prevConatiner) {
		prevConatiner.parentNode.removeChild(prevConatiner);
	}
	const containerDiv = document.createElement("div");
	containerDiv.innerHTML = `
		<div class="editor-space hide-on-med-and-down"></div>
		<div class="contain"></div>
	`;
	containerDiv.classList.add("section", "simulation", "editor");
	containerDiv.id = "full-page-container";
	containerDiv.classList.add("section", "simulation", "editor");

	document.querySelector("#editor").appendChild(containerDiv);
	return containerDiv;
};

export default Container;
