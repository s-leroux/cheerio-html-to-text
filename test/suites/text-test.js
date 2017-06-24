const chai = require('chai');
chai.use(require('chai-string'));
const assert = chai.assert;

const util = require('util');
const rewire = require('rewire');

const text = rewire('../../lib/text.js');
const node = rewire('../../lib/node.js');

describe("text object", function() {
  describe("Inline", function() {

    describe("constructor", function() {    
      it('should be properly initialize object', function() {
        const result = new text.Inline();
        assert.isObject(result);
        assert.property(result, 'type');
        assert.equal(result.type, 'inline');
        assert.property(result, 'data');
        assert.deepEqual(result.data, []);
      });
      
      it('should be properly initialize object w/param', function() {
        const result = new text.Inline('hello');
        assert.isObject(result);
        assert.property(result, 'type');
        assert.equal(result.type, 'inline');
        assert.property(result, 'data');
        assert.deepEqual(result.data, ['hello']);
      });
    });

    describe("toString()", function() {
      const str = 'hello';
      const obj = new text.Inline(str);

      it('should return a string representation', function() {
        const result = obj.toString();
        assert.isString(result);
        assert.equal(result, str);
      });
    });
    
  });


  describe("BlockFromString", function() {

    describe("constructor", function() {    
      
      it('should return a block of text', function() {
        const result = text.BlockFromString("abc def ghi jkl", { prefix: "", width: 80 });
        assert.isObject(result);
        assert.property(result, 'type');
        assert.equal(result.type, 'block');
        assert.property(result, 'width');
        assert.property(result, 'data');
        assert.isArray(result.data);
      });
          
      it('should honnor prefix and width', function() {
                        
        const expected =[ /* 012345678|0123456789 */
                            "  abc def\n",
                            "  ghij\n",
                            "  klmn\n",
                        ];
        const input =       "abc def ghij klmn";

        const result = text.BlockFromString(input, { prefix: "  ", width: 9 });
        assert.deepEqual(result.data, expected);
      });
          
      it('should end each line with a \\n', function() {
        const input =       "abc def ghij klmn";
        const result = text.BlockFromString(input, { prefix: "  ", width: 9 });

        for(let line of result.data)
          assert.match(line, /\n$/);
      });
      
      it('should handle overlength words properly', function() {
        const expected =[ /* 012345|7890123456789 */
                            "  abc\n",
                            "  defghij\n",
                            "  klmn\n",
                        ];
        const input =       "abc defghij klmn";

        const result = text.BlockFromString(input, { prefix: "  ", width: 6 });
        assert.deepEqual(result.data, expected);
      });
          
      it('should ignore extra spaces at the start of the text', function() {
        let input = "abc def ghij klmn";
        const reference = text.BlockFromString(input, { prefix: "  ", width: 9 });

        for(let i = 0; i < 3; ++i) {
          input = " "+input;
          const result = text.BlockFromString(input, { prefix: "  ", width: 9 });
          assert.deepEqual(result, reference);
        }
      });
          
      it('should ignore extra spaces at the end of the text', function() {
        let input = "abc def ghij klmn";
        const reference = text.BlockFromString(input, { prefix: "  ", width: 9 });

        for(let i = 0; i < 3; ++i) {
          input = input+" ";
          const result = text.BlockFromString(input, { prefix: "  ", width: 9 });
          assert.deepEqual(result, reference);
        }
      });

    });
    
  });
});


describe("node object", function() {
  describe("RootNode", function() {
    it('should honor width option', function() {
      const n = node.RootNode(15);
      assert.equal(n.width, 15);
    });
  });
  describe("Node", function() {
    const n = node.RootNode(80);
    n.content = [
          text.Inline("abc "),
          text.Inline("def"),
          text.Inline(" ghi"),
          text.Inline("jkl"),
        ];
    const str = "abc def ghijkl";

    describe("toString()", function() {
      it('should return the text content', function() {
        const result = n.toString();
        assert.isString(result);
        assert.equal(result, str);
      });        
    });
        
    describe("toInlineText()", function() {
      it('should join all inline texts', function() {
        const result = n.toInlineText();
        assert.isObject(result);
        assert.property(result, 'type');
        assert.equal(result.type, 'inline');
        assert.property(result, 'data');
        assert.isArray(result.data);
        assert.deepEqual(result.data, [str]);
      });        
    });




    describe("toTextBlock()", function() {
      const n = node.RootNode(80);
      n.content = [
            text.Inline("abc "),
            text.Inline("def"),
            text.BlockFromString("bbbb"),
            text.Inline("ghi"),
          ];
      const expected = [ "abc def\n",
                         "bbbb\n",
                         "ghi\n" ];

      it('should return an object with type and data properties', function() {
        const result = n.toTextBlock();
        assert.isObject(result);
        assert.property(result, 'type');
        assert.property(result, 'data');
        assert.property(result, 'width');
      });

      it('should return a block of text', function() {
        const result = n.toTextBlock();
        assert.equal(result.type, "block");
      });

      it('should catenate all inline/block text fragments', function() {
        const result = n.toTextBlock();
        assert.deepEqual(result.data, expected);
      });

      it('should remove duplicate space in inline blocks only', function() {
        const n = node.RootNode(80);
        n.content = [
              text.Inline("abc  def"),
              text.Block(["bb  bb\n"]),
              text.Inline("ghi"),
            ];
        const result = n.toTextBlock();
        assert.deepEqual(result.data, ["abc def\n","bb  bb\n","ghi\n"]);
      });

      it('should remove duplicate space over inline blocks limits', function() {
        const n = node.RootNode(80);
        n.content = [
              text.Inline("abc "),
              text.Inline(" def"),
            ];
        const result = n.toTextBlock();
        assert.deepEqual(result.data, ["abc def\n"]);
      });

      it('should discard space-only inline text between block text', function() {
        const n = node.RootNode(80);
        n.content = [
              text.BlockFromString("abc"),
              text.Inline("   "),
              text.BlockFromString("def"),
            ];
        const result = n.toTextBlock();
        assert.deepEqual(result.data, ["abc\n","def\n"]);
      });
      




  });
});

describe("text method", function() {
  describe("makeLine()", function() {
    it('should return a string ending with \\n', function() {
      const result = text.makeLine("*");
      assert.isString(result);
      assert.endsWith(result, '\n');
    });

    it('should honnor width while creating lines', function() {
      for(let prefix of [undefined, "", " ", "   "]) {
        for(let width of [0, 1, 10, 100]) {
          const result = text.makeLine("*", width, prefix);
          assert.equal(result.length-1, width);
        }
      }
    });

    it('should not overflow when repeating multiple characters', function() {
      for(let prefix of [undefined, "", " ", "   "]) {
        for(let width of [0, 1, 10, 100]) {
          const result = text.makeLine("012", width, prefix);
          assert.equal(result.length-1, width);
        }
      }
    });


    it('should honnor prefix', function() {
      for(let prefix of ["", " ", "   "]) {
        for(let width of [10, 100]) {
          const result = text.makeLine("*", width, prefix);
          assert.startsWith(result, prefix);
        }
      }
    });

  });

  describe("stringToBlock()", function() {

  });

      
  });

});
