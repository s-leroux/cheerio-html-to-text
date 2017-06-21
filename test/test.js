const assert = require('chai').assert;
const cheerio = require('cheerio');


describe("module loading", function() {
  it('should load the module', function() {
    const module = require('../index.js');
  });
});


describe("library", function() {
  const htt = require('../index.js');

  describe("convert()", function() {
    const html = "<html><body><div>hello</div></body></html>";

    it('should return a string', function() {
      const a = htt.convert(html);
      assert.isString(a);
    });

    it('should produce the same result given string or cheerio object', function() {
      const a = htt.convert(html);
      const b = htt.convert(cheerio.load(html));
      assert.isDefined(a);
      assert.equal(a,b);
    });

    it('should properly join inline elements', function() {
      const html = "<span>Hello <i>world</i><strong>!</strong></span>";
      const a = htt.convert(html);
      assert.equal(a, "Hello world!");
    });

    it('should handle text-only fragments', function() {
      const html = "Hello world!";
      const a = htt.convert(html);
      assert.equal(a, "Hello world!");
    });

    it('should replace multiple spaces by single ones', function() {
      // XXX EXCEPTION in 'pre' elements
      const html = "Hello world!";
      const a = htt.convert(html);
      assert.equal(a, "Hello world!");
    });

    it('should wrap paragraphes between \\n', function() {
      const html = "<p>Hello</p><p>world!</p>";
      const a = htt.convert(html);
      assert.equal(a, "\nHello\n\nworld!\n");
    });

  });

});
