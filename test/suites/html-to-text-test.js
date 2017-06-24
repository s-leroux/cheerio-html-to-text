const assert = require('chai').assert;
const cheerio = require('cheerio');


describe("module loading", function() {
  it('should load the module', function() {
    const module = require('../../index.js');
  });
});


describe("library", function() {
  const htt = require('../../index.js');

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
      assert.equal(a, "Hello world!\n");
    });

    it('should handle text-only fragments', function() {
      const html = "Hello world!";
      const a = htt.convert(html);
      assert.equal(a, "Hello world!\n");
    });

    it('should replace multiple spaces by single ones', function() {
      // XXX EXCEPTION in 'pre' elements
      const html = "Hello world!";
      const a = htt.convert(html);
      assert.equal(a, "Hello world!\n");
    });

    it('should prefix paragraphes with extra \\n', function() {
      const html = "<p>Hello</p><p>world!</p>";
      const a = htt.convert(html);
      assert.equal(a, "\nHello\n\nworld!\n");
    });

    it('should catenate phrase elements in paragraph', function() {
      const html = "<p><span>Hello </span><b>world<em>!</em></b></p>";
      const a = htt.convert(html);
      assert.equal(a, "\nHello world!\n");
    });

    it('should wrap paragraphes', function() {
      const html = "<p>Hello 0123456789 0123456789 0123456789</p>";
      const a = htt.convert(html, {width: 10});
      assert.equal(a, "\nHello\n0123456789\n0123456789\n0123456789\n");
    });

    describe("unordered lists", function() {
      const html = "<ul><li>Hello</li><li>world<p>!</p></li></ul>";
      const a = htt.convert(html, {width: 80});
      console.log(a);
      const data = a.split('\n');
    
      it('should start with an empty line', function() {
        assert.equal(data[0], "");
      });      

      it('should be indented', function() {
        assert.equal(data[1], "  * Hello");
        assert.equal(data[2], "  * world");
        assert.equal(data[3], "");
        assert.equal(data[4], "    !");
      });    

      it('can be nested', function() {
        const html = "<ul><li>A</li>"+
                     "    <li>B<ul>"+
                     "         <li>B.A</li>"+
                     "         <li>B.B</li>"+
                     "    </ul></li>"+
                     "</ul>";
        const a = htt.convert(html, {width: 80});
        console.log(a);
        const data = a.split('\n');
        assert.equal(data[1], "  * A");
        assert.equal(data[2], "  * B");
        assert.equal(data[4], "      - B.A");
        assert.equal(data[5], "      - B.B");
      });    
    });

    describe("ordered lists", function() {
      const html = "<ol><li>Hello</li><li>world<p>!</p></li></ol>";
      const a = htt.convert(html, {width: 80});
      console.log(a);
      const data = a.split('\n');
    
      it('should start with an empty line', function() {
        assert.equal(data[0], "");
      });      

      it('should be indented', function() {
        assert.equal(data[1], " 1. Hello");
        assert.equal(data[2], " 2. world");
        assert.equal(data[3], "");
        assert.equal(data[4], "    !");
      });    
    });

    describe("br", function() {
      const html = "<p>Hello<br>world</p>";
      const a = htt.convert(html, {width: 80});
      console.log(a);
    
      it('should break phrase content', function() {
        assert.equal(a, "\nHello\nworld\n");
      });      
    });

    describe("hr", function() {
      const html = "<blockquote>Hello<hr>world</blockquote>";
      const a = htt.convert(html, {width: 80});
      console.log(a);
      const data = a.split('\n');
    
      it('should add a full-width separator', function() {
        assert.equal(data[1], "    Hello");
        assert.equal(data[2], "-".repeat(80));
        assert.equal(data[3], "    world");
      });      
    });

    describe("unknown elements", function() {
      const html = "<p>Hello <xxx>great</xxx> world</p>";
      const a = htt.convert(html, {width: 80});
      console.log(a);
    
      it('should be ignored', function() {
        assert.equal(a, "\nHello world\n");
      });      
    });
    
  });

});
