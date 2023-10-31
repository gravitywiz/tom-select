function mouseEvent(el, evt = 'click') {
	const event = new MouseEvent(evt, {
		view: window,
		bubbles: true,
		cancelable: true,
		composed: true,
	});
	const cancelled = !el.dispatchEvent(event);
	return cancelled;
}

// eslint-disable-next-line no-unused-vars
async function asyncClick(el) {
	if (mouseEvent(el, 'mousedown')) {
		mouseEvent(el, 'click');
	}

	await waitFor(100);
}

// eslint-disable-next-line no-unused-vars
async function asyncType(text) {
	return new Promise((resolve) => {
		// eslint-disable-next-line @wordpress/no-global-active-element
		syn.type(text, document.activeElement, () => {
			resolve();
		});
	});
}

async function waitFor(delay) {
	return new Promise((resolve) => {
		setTimeout(resolve, delay);
	});
}
