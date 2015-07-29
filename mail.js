var mail = {
	input: [],
	fillChar: '-',
	detroitPrefix: '482',
	numeric: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
	// TODO figure out how to use backspace without navigating back (should be 8)
	deleteCode: 59,
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
		} else if (mail.input.length > 0 && event.which === mail.deleteCode) {
			mail.input.pop();
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
		} else if (event.which === mail.cancelCode) {
			mail.input = [];
			updateDisplay();
		}
	};
};

// checks cache for zip entry and looks up via API if missed
var lookupZip = function(zip, onLookup) {
	if (zip.toString() in mail.zipCache) {
		onLookup(mail.zipCache[zip.toString()]);
	} else {
		// check via api
		var suffixes = ['01', '02', '03'];
		var result = lookupZipViaAPI(zip.join('') + '98', function(result) {
			mail.zipCache[zip.toString()] = result;
			onLookup(result);
		});
	}
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
			} else if (request.status === 400) {
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
			document.querySelector('#lookup-display').textContent = result.join(', ');
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