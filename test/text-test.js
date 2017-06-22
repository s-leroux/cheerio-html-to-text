const assert = require('chai').assert;
const cheerio = require('cheerio');
const rewire = require('rewire');

const text = rewire('../lib/text.js');

describe("text method", function() {
  describe("makeInlineText()", function() {
    it('should create an inline text object', function() {
      const result = text.makeInlineText();
      assert.isObject(result);
      assert.property(result, 'type');
      assert.equal(result.type, 'inline');
      assert.property(result, 'data');
      assert.isArray(result.data);
    });
  });

  describe("stringToBlock()", function() {
    it('should return a block of text', function() {
      const result = text.stringToBlock("abc def ghi jkl", { prefix: "", width: 80 });
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

      const result = text.stringToBlock(input, { prefix: "  ", width: 9 });
      assert.deepEqual(result.data, expected);
    });
        
    it('should end each line with a \n', function() {
      const input =       "abc def ghij klmn";
      const result = text.stringToBlock(input, { prefix: "  ", width: 9 });

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

      const result = text.stringToBlock(input, { prefix: "  ", width: 6 });
      assert.deepEqual(result.data, expected);
    });
  });

  describe("nodeToInlineText()", function() {
    it('join all inline texts', function() {
      const node = {
          content: [
            text.makeInlineText("abc "),
            text.makeInlineText("def"),
            text.makeInlineText(" ghi"),
            text.makeInlineText("jkl"),
          ],
      };
      const expected = [ "abc def ghijkl" ];
      
      const result = text.nodeToInlineText(node);
      assert.isObject(result);
      assert.property(result, 'type');
      assert.equal(result.type, 'inline');
      assert.property(result, 'data');
      assert.isArray(result.data);
      assert.deepEqual(result.data, expected);
    });        
  });

  describe("nodeToTextBlock()", function() {
    const node = { content: [
      { type: 'inline', data: ['abc '] },
      { type: 'inline', data: ['def'] },
      { type: 'block', data: ['bbbb\n'] },
      { type: 'inline', data: ['ghi'] },
    ]};
    const expected = [ "abc def\n",
                       "bbbb\n",
                       "ghi\n" ];

    it('should return an object with type and data properties', function() {
      const result = text.nodeToTextBlock(node);
      assert.isObject(result);
      assert.property(result, 'type');
      assert.property(result, 'data');
      assert.property(result, 'width');
    });

    it('should return a block of text', function() {
      const result = text.nodeToTextBlock(node);
      assert.equal(result.type, "block");
    });

    it('should catenate all inline/block text fragments', function() {
      const result = text.nodeToTextBlock(node);
      assert.deepEqual(result.data, expected);
    });

    it('should remove duplicate space in inline blocks only', function() {
      const node = { content: [
        { type: 'inline', data: ['abc  def'] },
        { type: 'block', data: ['bb  bb\n'] },
        { type: 'inline', data: ['ghi'] },
      ]};
      const result = text.nodeToTextBlock(node);
      assert.deepEqual(result.data, ["abc def\n","bb  bb\n","ghi\n"]);
    });

    it('should remove duplicate space over inline blocks limits', function() {
      const node = { content: [
        { type: 'inline', data: ['abc '] },
        { type: 'inline', data: [' def'] },
      ]};
      const result = text.nodeToTextBlock(node);
      assert.deepEqual(result.data, ["abc def\n"]);
    });

    it('should discard space-only inline text between block text', function() {
      const node = { content: [
        { type: 'block', data: ['abc\n'] },
        { type: 'inline', data: ['   '] },
        { type: 'block', data: ['def\n'] },
      ]};
      const result = text.nodeToTextBlock(node);
      assert.deepEqual(result.data, ["abc\n","def\n"]);
    });
    
      
  });

});
