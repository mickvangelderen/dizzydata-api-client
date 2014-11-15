module.exports = { to: to, from: from, _pad2: _pad2 };

function to(dateObject) {
	return dateObject.getUTCFullYear() + _pad2(dateObject.getUTCMonth() + 1) + _pad2(dateObject.getUTCDate());
}

function from(dizzydataDateString) {
	var match = /(\d{4})(\d{2})(\d{2})/.exec(dizzydataDateString);
	if (!match) { throw Error('Invalid Argument'); }
	return new Date(Date.UTC(match[1], match[2] - 1, match[3]));
}

function _pad2(number) {
	return (number < 10 ? '0' : '') + number;
}