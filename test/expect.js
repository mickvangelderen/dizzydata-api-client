var chai = require('chai');

chai.config.includeStack = true;
Error.stackTraceLimit = 3;

module.exports = chai.expect;