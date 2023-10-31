window.expect = chai.expect;
window.assert = chai.assert;
window.has_focus = function (elem) {
	// eslint-disable-next-line @wordpress/no-global-active-element
	return !!(elem === document.activeElement);
};

const current_test_label = document.createElement('h1');
current_test_label.setAttribute('style', 'white-space:nowrap;overflow:hidden');
document.body.appendChild(current_test_label);

const sandbox = document.createElement('div');
sandbox.setAttribute('role', 'main');
document.body.appendChild(sandbox);

const preventHover = document.createElement('div');
preventHover.style.cssText =
	'position:absolute;top:0;left:0;right:0;bottom:0;z-index:10000';
document.body.appendChild(preventHover);

let test_number = 0;

const teardownLast = function () {
	if (window.test_last) {
		if (window.test_last.instance) {
			window.test_last.instance.destroy();
			delete window.test_last.instance;
		}
		sandbox.innerHTML = '';
		window.test_last = null;
	}
};

window.teardownLast = teardownLast;

const test_html = {
	AB_Multi:
		'<select multiple><option value="a">a</option><option value="b">b</option><option value="c">c</option></select>',
	AB_Single:
		'<select><option value="a">a</option><option value="b">b</option><option value="c">c</option></select>',
	AB_Single_Long:
		'<select><option>a</option><option>b</option><option>c</option><option>d</option><option>e</option><option>f</option><option>g</option><option>h</option><option>i</option><option>j</option><option>k</option><option>l</option><option>m</option><option>n</option><option>o</option><option>p</option></select>',
};

Array.prototype.foo = function () {
	return true;
};

window.setup_test = function (html, options, callback) {
	let instance, select;
	teardownLast();

	if (html in test_html) {
		html = test_html[html];
	}

	if (typeof html === 'string') {
		sandbox.innerHTML = html;
	} else {
		sandbox.append(html);
	}

	select = sandbox.querySelector('.setup-here');
	if (!select) {
		select = sandbox.firstChild;
	}

	if (select.nodeName === 'SELECT' || select.nodeName === 'INPUT') {
		instance = tomSelect(select, options);
	}

	const test = (window.test_last = {
		html: sandbox.firstChild,
		select,
		callback,
		instance,
	});

	return test;
};

/**
 * Create a test with two options
 *
 */
window.ABTestSingle = function (options) {
	return setup_test('ABTestSingle', options);
};

after(function () {
	window.teardownLast();
});

/**
 * The following section defines function used throughout the rest of the test suite.
 * They are not called in this file, but are colled in other files.
 */
const IS_MAC = /Mac/.test(navigator.userAgent);
// eslint-disable-next-line no-unused-vars
const shortcut_key = IS_MAC ? 'meta' : 'ctrl';

// eslint-disable-next-line no-unused-vars
const it_n = function (label, orig_func) {
	let new_func;

	label = test_number++ + ' - ' + label;

	if (orig_func.length > 0) {
		new_func = function (done) {
			current_test_label.textContent = label;
			return orig_func.call(this, done);
		};
	} else {
		const func = orig_func.toString();
		if (func.match(/(\s|syn\.)(type|click)\(/)) {
			throw 'test should be async or use done():' + func;
		}
		new_func = function () {
			current_test_label.textContent = label;
			return orig_func.call(this);
		};
	}

	it.call(this, label, new_func);
};

// eslint-disable-next-line no-unused-vars
const click = function (el, cb) {
	syn.click(el).delay(100, cb);
};

// eslint-disable-next-line no-unused-vars
function isVisible(el) {
	return el.offsetParent !== null;
}
