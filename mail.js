var mail = {
	input: [],
	fillChar: '-',
	detroitPrefix: '482',
	numeric: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
	// TODO figure out how to use backspace without navigating back
	deleteCode: 59
};

var boot = function() {
	document.onkeypress = function(event) {
		console.log(event.which);
		if (mail.input.length < 5 && mail.numeric.indexOf(event.which - 48) !== -1) {
			mail.input.push(event.which - 48);
			updateDisplay();
		} else if (mail.input.length > 0 && event.which === mail.deleteCode) {
			mail.input.pop();
			updateDisplay();
		}
	};
};

var updateDisplay = function() {
	document.querySelector('#input-display').textContent = mail.input.join('');
};