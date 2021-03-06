(function(window, document) {

	var textareas = document.getElementsByTagName('textarea'),
	    unicode = textareas[0],
	    base64 = textareas[1],
	    permalink = document.getElementById('permalink'),
	    regexBase64 = /^(?:[A-Za-z0-9+\/]{4})*(?:[A-Za-z0-9+\/]{2}==|[A-Za-z0-9+\/]{3}=)?$/,
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
	    stringFromCharCode = String.fromCharCode;

	function encode(string) {
		// URL-encode some more characters to avoid issues when using permalink URLs in Markdown
		return encodeURIComponent(string).replace(/['()_*]/g, function(character) {
			return '%' + character.charCodeAt().toString(16);
		});
	}

	// https://github.com/bestiejs/punycode.js/issues/10#issuecomment-7364216
	function base64encode(string) {
		return btoa(unescape(encodeURIComponent(string)));
	}

	function base64decode(string) {
		return decodeURIComponent(escape(atob(string)));
	}

	function convert(inputElement, regex, fn, outputElement) {
		var value = inputElement.value,
		    result = '';
		if (regex.test(value)) {
			outputElement.value = result = fn(value);
			inputElement.className = outputElement.className = '';
		} else {
			outputElement.value = 'ERROR: invalid input';
			inputElement.className = outputElement.className = 'invalid';
		}
		return inputElement == unicode ? value : result;
	}

	function update() {
		var unicodeString,
		    result,
		    tmp;
		if (this == base64) {
			// convert from base64 to Unicode
			tmp = base64.value;
			if (regexBase64.test(tmp)) {
				base64.className = unicode.className = '';
				result = base64decode(base64.value);
				unicode.value = unicodeString = result;
			} else {
				unicode.value = 'ERROR: invalid input';
				base64.className = unicode.className = 'invalid';
				unicodeString = '';
			}
		} else { // convert from Unicode to base64
			base64.className = unicode.className = '';
			unicodeString = unicode.value;
			result = base64encode(unicodeString);
			base64.value = result;
		}
		permalink.hash = encode(unicodeString);
		storage && (storage.base64 = unicodeString);
	};

	// http://mathiasbynens.be/notes/oninput
	unicode.onkeyup = base64.onkeyup = update;
	unicode.oninput = base64.oninput = function() {
		unicode.onkeyup = base64.onkeyup = null;
		update.call(this);
	};

	if (storage) {
		storage.base64 && (unicode.value = storage.base64);
		update();
	}

	window.onhashchange = function() {
		unicode.value = decodeURIComponent(location.hash.slice(1));
		update();
	};

	if (location.hash) {
		window.onhashchange();
	}

}(this, document));

// Google Analytics
window._gaq = [['_setAccount', 'UA-6065217-60'], ['_trackPageview']];
(function(d, t) {
	var g = d.createElement(t),
	    s = d.getElementsByTagName(t)[0];
	g.src = '//www.google-analytics.com/ga.js';
	s.parentNode.insertBefore(g, s);
}(document, 'script'));