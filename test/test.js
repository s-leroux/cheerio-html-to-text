var assert = require('assert');

console.log(__dirname);

describe("module loading", function() {
  it('shoud load the module', function() {
    var module = require('../index.js');
  });
});
