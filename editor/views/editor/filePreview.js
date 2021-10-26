import { getExtension, getFileType } from '../../utils/misc.js';
import { getState, getAllServices } from "../../state.js";

let binaryPreview;
const showBinaryPreview = ({ filename, path = "." } = {}) => {
	try{
		document.getElementById('file-search').style.visibility = "";
	}catch(e){}

	if (!binaryPreview) {
		const editorContainer = document.getElementById("editor-container");
		binaryPreview = document.createElement("div");
		binaryPreview.id = "editor-preview";
		editorContainer.appendChild(binaryPreview);
	}

	const state = getState();
	let url;
	try {
		url = state.paths
			.find((x) => x.name === filename)
			.path.replace("/welcome/", "/.welcome/")
			.replace(/^\//, "./");
	} catch (e) {}

	const extension = getExtension(filename);
	const fileType = getFileType(filename);
	const style = `
		<style>
			#editor-preview {
				width: 100%;
				height: 100%;
				display: flex;
				justify-content: center;
				align-items: center;
				padding-bottom: 30%;
				font-size: 2em;
				color: var(--main-theme-text-invert-color);
			}
			#editor-preview .preview-image {
				min-width: 50%;
				image-rendering: pixelated;
				object-fit: contain;
				margin-bottom: -20%;
				padding: 0.7em;
			}
			audio {
				filter: invert(0.7) contrast(1.5);
			}
			audio:focus {
				outline: 0;
				border: 1px solid #444;
				border-radius: 50px;
			}
			video {
				max-width: 95%;
			}
			.image-disclaim {
				position: absolute;
				top: 40px;
				padding: .1em 1em;
				font-size: 0.55em;
				display: flex;
				flex-direction: column;
				justify-content: start;
				align-items: start;
				width: 100%;
			}
			#editor-preview pre {
				font-size: 0.72em;
				opacity: 0.7;
				position: absolute;
				top: 0;
				bottom: 0;
				display: flex;
				justify-content: center;
				align-items: center;
				white-space: pre-line;
			}
		</style>
	`;
	if (fileType === "audio") {
		binaryPreview.innerHTML =
			style +
			`
			<figure>
			<audio
				controls
				loop
				autoplay
				controlsList="play timeline volume"
				src="${url}"
			>
				Your browser does not support the
				<code>audio</code> element.
			</audio>
			</figure>
		`;
	} else if (fileType === "video") {
		binaryPreview.innerHTML =
			style +
			`
			<video
				controls
				loop
				autoplay
				controlsList="play timeline volume"
				disablePictureInPicture
			>
				<source
					src="${url}"
					type="video/${extension}"
				>
				Sorry, your browser doesn't support embedded videos.
			</video>
		`;
	} else {
		binaryPreview.innerHTML =
			style +
			`
			<pre>No editable text for this file type.</pre>
		`;
	}
	return binaryPreview;
};

export default showBinaryPreview;
