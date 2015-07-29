var mail = {
	input: [],
	fillChar: '-',
	detroitPrefix: '482',
	numeric: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
	// TODO figure out how to use backspace without navigating back (should be 8)
	deleteCode: 59,
	enterCode: 13,
	cancelCode: 27
};

var boot = function() {
	// handle visible character typing
	document.onkeypress = function(event) {
		console.log(event.which);
		if (mail.input.length < 5 && event.which >= 48 && event.which <= 58) {
			mail.input.push(event.which - 48);
			updateDisplay();
		} else if (mail.input.length > 0 && event.which === mail.deleteCode) {
			mail.input.pop();
			updateDisplay();
		}
	};

	document.onkeydown = function(event) {
		console.log(event.which);
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

var updateDisplay = function() {
	// set input display
	document.querySelector('#input-value').textContent = mail.input.join('');

	console.log(document.querySelector('#placeholder').classList);
	// show address lookup
	if (mail.input.length === 2) {
		document.querySelector('#placeholder').classList.remove('hidden');
		document.querySelector('#lookup-display').textContent = 'Detroit, MI';
	} else if (mail.input.length > 2) {
		// TODO assumes it will have no other classes
		document.querySelector('#placeholder').classList.add('hidden');
		// TODO perform zip lookup and display
		document.querySelector('#lookup-display').textContent = 'Other city, state';
	} else {
		// TODO assumes it will have no other classes
		document.querySelector('#placeholder').classList.add('hidden');
		document.querySelector('#lookup-display').textContent = '';
	}
};