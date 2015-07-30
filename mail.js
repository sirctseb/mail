var mail = {
	input: [],
	fillChar: '-',
	detroitPrefix: '482',
	numeric: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
	// TODO figure out how to use backspace without navigating back (should be 8)
	deleteCode: 8,
	enterCode: 13,
	cancelCode: 27,
	zipAPIKey: 'js-9KQAgn5a4bqHxzAYivYpN2WYoJlZCjgM47mlurvzDWgbvRaOn8dba9azTvzwOPiT',
	zipCache: {},
	apiRequest: null
};

var boot = function() {
	// handle visible character typing
	document.onkeypress = function(event) {
		if (mail.input.length < 5 && event.which >= 48 && event.which <= 58) {
			mail.input.push(event.which - 48);
			updateDisplay();
		} else if (event.which === 97) {
	 		lookupZipViaAPI(mail.input.join(''), function(response) {
				document.querySelector('#lookup-display').textContent = response.join(', ');
	 		});
	 	}
	};

	document.onkeydown = function(event) {
		if (event.which === mail.enterCode && mail.input.length > 1) {
			// TODO feedback that letter was sent to box
			mail.input = [];
			updateDisplay();
			moveLetter();
		} else if (event.which === mail.cancelCode) {
			mail.input = [];
			updateDisplay();
			moveLetter();
		} else if (event.keyCode === mail.deleteCode) {
			mail.input.pop();
			updateDisplay();
			event.preventDefault();
		}
	};
	var container = document.querySelector('#letter-container');
	var cycleLetters = function() {
		container.classList.add('notransition');
		container.style.left = '0';
		container.offsetHeight;
		container.classList.remove('notransition');
		container.appendChild(container.firstChild);
	};
	container.addEventListener('webkitTransitionEnd', cycleLetters, true);
};

var moveLetter = function() {
	var container = document.querySelector('#letter-container');
	container.style.left = '-7em';
};

// checks cache for zip entry and looks up via API if missed
var lookupZip = function(zip, onLookup) {
	if (zip.toString() in mail.zipCache) {
		onLookup(mail.zipCache[zip.toString()]);
	} else {
		// check via api
		var suffixes = ['01', '02', '03'];
		tryAPILookups(zip, suffixes, onLookup);
	}
};

var tryAPILookups = function(zip, suffixes, onLookup) {
	// check if we are out of suffixes
	if (suffixes.length === 0) {
		onLookup(null);
		return;
	}

	lookupZipViaAPI(zip.join('') + suffixes[0], function(result) {
		// if no result, try the next suffix
		if (result === null) {
			tryAPILookups(zip, suffixes.slice(1), onLookup);
		} else {
			mail.zipCache[zip.toString()] = result;
			onLookup(result);
		}
	});
};

var lookupZipViaAPI = function(zip, onLookup) {
	// abort another request that may be in process
	if (mail.apiRequest) {
		mail.apiRequest.abort();
	}

	var request = new XMLHttpRequest();
	mail.apiRequest = request;
	request.open('GET', 'https://www.zipcodeapi.com/rest/' + mail.zipAPIKey
		+ '/info.json/' + zip + '/radians');

	request.onreadystatechange = function() {
		if (request.readyState === 4) {
			// TODO error handling
			if (request.status === 200) {
				var obj = JSON.parse(request.responseText);
				onLookup([obj['city'], obj['state']]);
			} else if (request.status === 404) {
				onLookup(null);
			}
			mail.apiRequest = null;
		}
	};

	request.send();
}

var updateDisplay = function() {
	// set input display
	document.querySelector('#input-value').textContent = mail.input.join('');

	// show address lookup
	if (mail.input.length === 2) {
		document.querySelector('#suffix').textContent = '';
		document.querySelector('#placeholder').classList.remove('hidden');
		document.querySelector('#lookup-display').textContent = 'Detroit, MI';
	} else if (mail.input.length === 3) {
		document.querySelector('#suffix').textContent = '--';
		document.querySelector('#placeholder').classList.remove('hidden');
		document.querySelector('#placeholder').classList.add('hidden');
		lookupZip(mail.input, function(result) {
			if (result === null) {
				document.querySelector('#lookup-display').textContent = 'Invalid zip';
			} else {
				document.querySelector('#lookup-display').textContent = result.join(', ');
			}
		})
	} else if (mail.input.length === 4) {
		document.querySelector('#suffix').textContent = '-';
	} else if (mail.input.length === 5) {
		document.querySelector('#suffix').textContent = '';
	} else {
		document.querySelector('#suffix').textContent = '';
		document.querySelector('#placeholder').classList.add('hidden');
		document.querySelector('#lookup-display').textContent = '';
	}
};