let alreadyAppended;
const appendToEditor = (nothingOpen) => {
	if(alreadyAppended) return;
	if(!nothingOpen) return;
	const editorContainer = document.getElementById("editor-container");
	if(!editorContainer) return;
	alreadyAppended = editorContainer.querySelector('#editor-empty');
	!alreadyAppended && editorContainer.appendChild(nothingOpen);
};

let nothingOpen;
const showNothingOpen = () => {
	try{
		document.getElementById('file-search').style.visibility = "";
	}catch(e){}

	appendToEditor(nothingOpen);

	if(nothingOpen) return nothingOpen;

	nothingOpen = document.createElement("div");
	nothingOpen.id = "editor-empty";
	const style = `
		<style>
			#editor-empty {
				position: absolute;
				left: 0;
				right: 0;
				top: 0;
				bottom: 0;
				/* background: #1e1e1e; */
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				overflow: hidden;
				min-width: 160px;
				z-index: 11;
			}
			#editor-empty-logo {
				opacity: .7;
				color: rgb(var(--main-theme-highlight-color));
				fill: currentColor;
				width: 18em;
				margin-top: -14em;
				stroke: rgba(var(--main-theme-highlight-color),.4);
			}
			.editor-empty-blurb {
				/* visibility: hidden; */
				font-variant: small-caps;
				font-style: italic;
				color: var(--main-theme-text-color);
			}
		</style>
	`;
	const logo = `
	<svg viewBox="-4 -4 172 150" id="editor-empty-logo">
		<g>
			<title>Do or do not.  There is no try.</title>
			<path d="m0.66613,141.12654l40.94759,-22.96759l39.55286,22.95911l-80.50045,0.00848z" stroke="#000000" stroke-width="0" opacity=".3" style="fill: black;opacity: .15;"></path>
			<path d="m81.32664,141.18317l41.77172,-23.74405l40.66986,23.45933l-82.44158,0.28472z" stroke-width="0" opacity=".1" style="fill: black;opacity: .15;"></path>
			<path d="m-8.80672,124.5856l39.68109,-24.32103l39.94988,23.98956l-79.63097,0.33147z" stroke-width="0" transform="rotate(120.005 31.0088 112.425)" opacity=".15" style="fill: black;opacity: .5;"></path>
			<path d="m29.8517,54.08169l40.95021,-23.76637l41.15387,23.42957l-82.10408,0.3368z" stroke-width="0" transform="rotate(120.005 70.9037 42.1985)" opacity=".15" style="fill: black;opacity: .5;"></path>
			<path d="m50.84794,54.21713l41.14723,-23.71165l40.66986,23.126l-81.81709,0.58565z" stroke-width="0" transform="rotate(240.005 91.7565 42.3613)" opacity=".6" style="fill: black;opacity: .6;"></path>
			<path d="m92.34289,123.94524l40.84106,-24.40053l40.54568,23.11973l-81.38674,1.2808z" stroke-width="0" transform="rotate(240.005 133.036 111.745)" opacity=".35" style="fill: black;opacity: .67;"></path>

			<path id="border" d="m80.7229,0.44444l82.61043,140.55521l-163.22223,0.44479l80.6118,-141z" fill="none" stroke-width="1" style="fill: transparent;stroke: transparent;"></path>

			<path d="m80.63317,96.1755l0.39079,45.37696l41.8002,-23.91294l-0.6859,-46.06544l-41.50509,24.60142z" stroke-width="0" opacity=".25" style="fill: black;opacity: .41;"></path>
			<path d="m60.24695,60.10716l0.41626,47.48081l41.25377,-23.26463l-0.93192,-47.77411l-40.73811,23.55793z" stroke-width="0" transform="rotate(60 81.082 72.0686)" opacity=".67" style="fill: aliceblue;opacity: .01;"></path>
			<path d="m41.52036,94.93062l-0.5376,46.74648l39.55956,-24.26797l-0.06849,-45.66349l-38.95347,23.18498z" stroke-width="0" transform="rotate(120 60.7625 106.711)" style="fill: black;opacity: .25;"></path>
		</g>
	</svg>
	`;
	const coloredLogo = `
	<svg viewBox="-4 -4 172 150" id="editor-empty-logo">
		<g>
			<title>Do or do not.  There is no try.</title>
			<path d="m0.66613,141.12654l40.94759,-22.96759l39.55286,22.95911l-80.50045,0.00848z" stroke="#000000" stroke-width="0" opacity=".3"></path>
			<path d="m81.32664,141.18317l41.77172,-23.74405l40.66986,23.45933l-82.44158,0.28472z" stroke-width="0" opacity=".1"></path>
			<path d="m-8.80672,124.5856l39.68109,-24.32103l39.94988,23.98956l-79.63097,0.33147z" stroke-width="0" transform="rotate(120.005 31.0088 112.425)" opacity=".15"></path>
			<path d="m29.8517,54.08169l40.95021,-23.76637l41.15387,23.42957l-82.10408,0.3368z" stroke-width="0" transform="rotate(120.005 70.9037 42.1985)" opacity=".15"></path>
			<path d="m50.84794,54.21713l41.14723,-23.71165l40.66986,23.126l-81.81709,0.58565z" stroke-width="0" transform="rotate(240.005 91.7565 42.3613)" opacity=".5"></path>
			<path d="m92.34289,123.94524l40.84106,-24.40053l40.54568,23.11973l-81.38674,1.2808z" stroke-width="0" transform="rotate(240.005 133.036 111.745)" opacity=".35"></path>

			<path id="border" d="m80.7229,0.44444l82.61043,140.55521l-163.22223,0.44479l80.6118,-141z" fill="none" stroke-width="1"></path>

			<path d="m80.63317,96.1755l0.39079,45.37696l41.8002,-23.91294l-0.6859,-46.06544l-41.50509,24.60142z" stroke-width="0" opacity=".25"></path>
			<path d="m60.24695,60.10716l0.41626,47.48081l41.25377,-23.26463l-0.93192,-47.77411l-40.73811,23.55793z" stroke-width="0" transform="rotate(60 81.082 72.0686)" opacity=".67"></path>
			<path d="m41.52036,94.93062l-0.5376,46.74648l39.55956,-24.26797l-0.06849,-45.66349l-38.95347,23.18498z" stroke-width="0" transform="rotate(120 60.7625 106.711)" opacity=".55"></path>
		</g>
	</svg>
	`;
	nothingOpen.innerHTML =
		style +
		logo +
		'<div class="editor-empty-blurb"><p>All models are wrong.</p><p style="margin-top:-10px;">Some models are useful.</p></div>';

	appendToEditor(nothingOpen);
	return nothingOpen;
};

export default showNothingOpen;
