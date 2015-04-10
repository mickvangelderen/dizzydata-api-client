var expect = require('./expect');
var dizzydataDate = require('../lib/dizzydata-date');

describe('lib/dizzydata-date.js', function() {

	describe('_pad2', function() {
		it('should pad a number to two digits with zeros', function() {
			expect(dizzydataDate._pad2(0)).to.equal('00');
			expect(dizzydataDate._pad2(1)).to.equal('01');
			expect(dizzydataDate._pad2(5)).to.equal('05');
			expect(dizzydataDate._pad2(10)).to.equal('10');
			expect(dizzydataDate._pad2(12)).to.equal('12');
			expect(dizzydataDate._pad2(99)).to.equal('99');
			expect(dizzydataDate._pad2(100)).to.equal('100');
			expect(dizzydataDate._pad2(-4)).to.equal('0-4');
			expect(dizzydataDate._pad2(-23)).to.equal('0-23');
			expect(dizzydataDate._pad2(-123)).to.equal('0-123');
		});
	});

	describe('to', function() {
		it('should convert a date object to a dizzydata date string', function() {
			/* my timezone is GMT +1
			 * new Date(Date.UTC(2014, 4, 12, 23)).getDate() returns 13
			 * but dizzydata dates are in UTC time so the conversion should use .getUTCDate()
			 * new Date(Date.UTC(2014, 4, 12, 23)).getDateUTC() returns 12
			 */
			var date = new Date(Date.UTC(2014, 4, 12, 23));
			expect(dizzydataDate.to(date)).to.equal('20140512');
		});
	});

	describe('from', function() {
		it('should convert a dizzydata date string to a date object', function() {
			var date = dizzydataDate.from('20140512');
			expect(date.getUTCFullYear()).to.equal(2014);
			expect(date.getUTCMonth()).to.equal(4);
			expect(date.getUTCDate()).to.equal(12);
		});
	});

});