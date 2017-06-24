const chai = require('chai');
chai.use(require('chai-string'));
const assert = chai.assert;

const util = require('util');
const _ = require('underscore');
const rewire = require('rewire');

const html = rewire('../../lib/html.js');
const text = require('../../lib/text.js');

describe("utility method", function() {
  describe("wrap()", function() {
    const wrap = html.__get__("wrap");
    const sum = (x,y) => x + y;
    const inc = (x) => x+1;
    const dbl = (x) => x*2;
    
    it('should compose function calls', function() {
      assert.equal(wrap(dbl, inc)(sum)(3,4), 16);
      assert.equal(wrap(inc, dbl)(sum)(3,4), 15);
    });
  });
});

describe("html method", function() {
  describe("underline()", function() {
    const filter = html.__get__("underline")('=');
    
    describe("", function() {
      const input = text.BlockFromString("Hello");
      const result = filter(input.clone());
      
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

  describe("anchor()", function() {
    const filter = html.__get__("anchor");
    
    describe("when href is present", function() {
      const input = text.Inline("Hello");
      const href = "http://xxx";
      const element = { element: { attribs: { href:href }}};
      
      const result = filter(input.clone(), element);

      it('should only add one and only one fragment', function() {
        assert.equal(result.data.length, input.data.length+1);
      });
      it('should not alter the data', function() {
        assert.deepEqual(result.data.slice(0,-1), input.data);
      });
      it('should add the link', function() {
        assert.equal(_.last(result.data), '['+href+']');
      });
    });    
    
    describe("when href is equal to text", function() {
      it('should not change the text fragment', function() {
        const href = "http://xxx";
        for(let t of [href, " "+href, href+" "]) {
          const input = text.Inline(t);
          const element = { element: { attribs: { href:href }}};
          const result = filter(input.clone(), element);

          assert.deepEqual(result, input);
        }
      });
    });    
    
    describe("without href", function() {
      const input = text.Inline("Hello");
      const element = { element: { attribs: { }}};
      
      const result = filter(input.clone(), element);

      it('should not change the text fragment', function() {
        assert.deepEqual(result, input);
      });
    });    
      
  });

});
