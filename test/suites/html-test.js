const chai = require('chai');
chai.use(require('chai-string'));
const assert = chai.assert;

const util = require('util');
const _ = require('underscore');
const rewire = require('rewire');

const html = rewire('../../lib/html.js');
const text = require('../../lib/text.js');

describe("html method", function() {
  describe("h1()", function() {
    const filter = html.__get__("h1");
    
    describe("", function() {
      const input = text.stringToBlock("Hello", { width: 80, prefix: "" });
      const result = filter(text.clone(input));
      
      console.log("%s", util.inspect(input));
      console.log("%s", util.inspect(result));

      it('should only add one and only one line', function() {
        assert.equal(result.data.length, input.data.length+1);
      });
      it('should not alter the data', function() {
        assert.deepEqual(result.data.slice(0,-1), input.data);
      });
      it('should add an underline terminated by \\n', function() {
        assert.match(_.last(result.data), /[=]+\n/);
      });
    });    
      
  });

});
