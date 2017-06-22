const chai = require('chai');
chai.use(require('chai-string'));
const assert = chai.assert;

const util = require('util');
const _ = require('underscore');
const rewire = require('rewire');

const html = rewire('../../lib/html.js');
const text = require('../../lib/text.js');

describe("html method", function() {
  describe("underline()", function() {
    const filter = html.__get__("underline")('=');
    
    describe("", function() {
      const input = text.stringToBlock("Hello", { width: 80, prefix: "" });
      const result = filter(text.clone(input));

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
      const input = text.makeInlineText("Hello");
      const href = "http://xxx";
      const element = { element: { attribs: { href:href }}};
      
      const result = filter(text.clone(input), element);

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
          const input = text.makeInlineText(t);
          const element = { element: { attribs: { href:href }}};
          const result = filter(text.clone(input), element);

          assert.deepEqual(result, input);
        }
      });
    });    
    
    describe("without href", function() {
      const input = text.makeInlineText("Hello");
      const element = { element: { attribs: { }}};
      
      const result = filter(text.clone(input), element);
      
      console.log("%s", util.inspect(input));
      console.log("%s", util.inspect(result));

      it('should not change the text fragment', function() {
        assert.deepEqual(result, input);
      });
    });    
      
  });

});
