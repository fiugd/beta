const CursorActivityHandler = ({ line, column }) => {
	const event = new CustomEvent("cursorActivity", {
		bubbles: true,
		detail: { line, column },
	});
	document.body.dispatchEvent(event);
};

export default CursorActivityHandler;
