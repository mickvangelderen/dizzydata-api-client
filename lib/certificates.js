var fs = require('fs');
var path = require('path');

var filenames = [
	'comodorsacertificationauthority.crt',
	'comodorsadomainvalidationsecureserverca.crt'
];

module.exports = filenames.map(function(filename) {
	return fs.readFileSync(path.join(__dirname, '../certificates', filename));
});