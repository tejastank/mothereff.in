(function(window, document, evil) {

	var pre = document.getElementsByTagName('pre')[0],
	    code = document.getElementsByTagName('code')[0],
	    textarea = document.getElementsByTagName('textarea')[0],
	    checkbox = document.getElementsByTagName('input')[0],
	    permalink = document.getElementById('permalink'),
	    // http://mathiasbynens.be/notes/localstorage-pattern
	    storage = (function() {
	    	var uid = new Date,
	    	    storage,
	    	    result;
	    	try {
	    		(storage = window.localStorage).setItem(uid, uid);
	    		result = storage.getItem(uid) == uid;
	    		storage.removeItem(uid);
	    		return result && storage;
	    	} catch(e) {}
	    }()),
	    cache = {
	    	// http://es5.github.com/#x7.8.4
	    	// Table 4 — String Single Character Escape Sequences
	    	'\b': '\\b',
	    	'\t': '\\t',
	    	'\n': '\\n',
	    	'\v': '\\x0B', // In IE < 9, '\v' == 'v'
	    	'\f': '\\f',
	    	'\r': '\\r',
	    	'\0': '\\0',
	    	// escape double quotes, \u2028, and \u2029 too, as they break input
	    	'\"': '\\\"',
	    	'\u2028': '\\u2028',
	    	'\u2029': '\\u2029',
	    	// we’re wrapping the string in single quotes, so escape those too
	    	'\'': '\\\''
	    };

	function encode(string) {
		// URL-encode some more characters to avoid issues when using permalink URLs in Markdown
		return encodeURIComponent(string).replace(/['()_*]/g, function(character) {
			return '%' + character.charCodeAt().toString(16);
		});
	}

	function text(el, str) {
		if (str == null) {
			return el.innerText || el.textContent;
		}
		el.innerText != null && (el.innerText = str);
		el.textContent != null && (el.textContent = str);
	}

	// https://gist.github.com/1243213
	function unicodeEscape(str) {
		return str.replace(/[\s\S]/g, function(character) {
			var charCode = character.charCodeAt(),
			    hexadecimal = charCode.toString(16).toUpperCase(),
			    longhand = hexadecimal.length > 2,
			    escape;
			if (checkbox.checked && /[\x20-\x26\x28-\x7E]/.test(character)) {
				// it’s a printable ASCII character that is not `'`; don’t escape it
				return character;
			}
			if (cache[character]) {
				return cache[character];
			}
			escape = cache[character] = '\\' + (longhand ? 'u' : 'x') + ('0000' + hexadecimal).slice(longhand ? -4 : -2);
			return escape;
		});
	}

	function update() {
		var value = textarea.value.replace(/\\\n/g, ''); // LineContinuation
		try {
			text(
				code,
				'\'' + unicodeEscape(evil(
					'"'
					+ value.replace(/[\n\u2028\u2029"']/g, function(chr) {
						return cache[chr];
					})
					.replace(/\\v/g, '\x0B') // In IE < 9, '\v' == 'v'; this normalizes the input
					+ '"'
				)) + '\''
			);
			pre.className = '';
		} catch (e) {
			pre.className = 'fail';
		}
		if (storage) {
			storage.jsEscapeText = value;
			if (checkbox.checked) {
				storage.jsEscapeCheckbox = true;
			} else {
				storage.removeItem('jsEscapeCheckbox');
			}
		}
		permalink.hash = +checkbox.checked + encode(textarea.value);
	}

	// http://mathiasbynens.be/notes/oninput
	textarea.onkeyup = checkbox.onchange = update;
	textarea.oninput = function() {
		textarea.onkeyup = null;
		update();
	};


	if (storage) {
		storage.jsEscapeText && (textarea.value = storage.jsEscapeText);
		storage.jsEscapeCheckbox && (checkbox.checked = true);
		update();
	}

	window.onhashchange = function() {
		var hash = location.hash;
		hash.charAt(1) == '0' && (checkbox.checked = false);
		textarea.value = decodeURIComponent(hash.slice(2));
		update();
	};

	if (location.hash) {
		window.onhashchange();
	}


}(this, document, eval));

// Google Analytics
window._gaq = [['_setAccount', 'UA-6065217-60'], ['_trackPageview']];
(function(d, t) {
	var g = d.createElement(t),
	    s = d.getElementsByTagName(t)[0];
	g.src = '//www.google-analytics.com/ga.js';
	s.parentNode.insertBefore(g, s);
}(document, 'script'));