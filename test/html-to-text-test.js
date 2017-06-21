const assert = require('chai').assert;
const rewire = require('rewire');

describe("Text manipulation method", function() {
  const htt = rewire('../lib/html-to-text.js');
  
  describe("reflow()", function() {
    const reflow = htt.__get__('reflow');
    
    it('should honnor offset and width', function() {
                     /* 012345678|0123456789 */
      const expected = "  abc def\n"+
                       "  ghij\n"+
                       "  klmn\n";
      const text =     "abc def ghij klmn";

      const result = reflow(text, { offset: 2, width: 9 });
      assert.equal(result, expected);
    });
    
    it('should handle overlength words properly', function() {
                     /* 012345|7890123456789 */
      const expected = "  abc\n"+
                       "  defghij\n"+
                       "  klmn\n";
      const text =     "abc defghij klmn";

      const result = reflow(text, { offset: 2, width: 6 });
      assert.equal(result, expected);
    });
  });
  
  describe("clearInlineSpaces()", function() {
    const clearInlineSpaces = htt.__get__('clearInlineSpaces');
    
    it('should remove multiple embedded spaces', function() {
      const result = clearInlineSpaces("abc  def   ghi jkl");
      assert.equal(result, "abc def ghi jkl");
    });
    
    it('should keep unique spaces at the start', function() {
      let str = " abc";
      for(let i = 0; i < 3; ++i) {
       assert.equal(clearInlineSpaces(str), " abc");
       str = " "+str;
      }
    });
    
    it('should keep unique spaces at the end', function() {
      let str = "abc ";
      for(let i = 0; i < 3; ++i) {
       assert.equal(clearInlineSpaces(str), "abc ");
       str = str+" ";
      }
    });
    
    it('should preserve nbsp', function() {
      const result = clearInlineSpaces("abc \u00A0 def");
      assert.equal(result, "abc \u00A0 def");
    });
    
  });

  
  
  describe("joinInline()", function() {
    const joinInline = htt.__get__('joinInline');
    const content = { content: [
      { type: 'inline', data: 'abc ' },
      { type: 'inline', data: ' def' },
    ]};
    const expected = "abc  def";

    it('should return an object with type and data properties', function() {
      const result = joinInline(content);
      assert.isObject(result);
      assert.property(result, 'type');
      assert.property(result, 'data');
    });

    it('should return an inline text', function() {
      const result = joinInline(content);
      assert.equal(result.type, 'inline');
    });

    it('should blindly join string', function() {
      const result = joinInline(content);
      assert.equal(result.data, expected);
    });

  });
  
  describe("makeBlock()", function() {
    const makeBlock = htt.__get__('makeBlock');
    const content = { content: [
      { type: 'inline', data: 'abc ' },
      { type: 'inline', data: 'def' },
      { type: 'block', data: 'bbbb\n' },
      { type: 'inline', data: 'ghi' },
    ]};
    const expected = "abc def\nbbbb\nghi\n";

    it('should return an object with type and data properties', function() {
      const result = makeBlock(content);
      assert.isObject(result);
      assert.property(result, 'type');
      assert.property(result, 'data');
    });

    it('should return a block of text', function() {
      const result = makeBlock(content);
      assert.equal(result.type, "block");
    });

    it('should catenate all inline/block text fragments', function() {
      const result = makeBlock(content);
      assert.equal(result.data, expected);
    });

    it('should end each block with a \\n', function() {
      const result = makeBlock(content);
      assert.equal(result.data.slice(-1), "\n");
    });

    it('should remove duplicate space in inline blocks only', function() {
      const content = { content: [
        { type: 'inline', data: 'abc  def' },
        { type: 'block', data: 'bb  bb\n' },
        { type: 'inline', data: 'ghi' },
      ]};
      const result = makeBlock(content);
      assert.equal(result.data, "abc def\nbb  bb\nghi\n");
    });

    it('should remove duplicate space over inline blocks limits', function() {
      const content = { content: [
        { type: 'inline', data: 'abc ' },
        { type: 'inline', data: ' def' },
      ]};
      const result = makeBlock(content);
      assert.equal(result.data, "abc def\n");
    });

    it('should discard space-only inline text between block text', function() {
      const content = { content: [
        { type: 'block', data: 'abc\n' },
        { type: 'inline', data: '   ' },
        { type: 'block', data: 'def\n' },
      ]};
      const result = makeBlock(content);
      assert.equal(result.data, "abc\ndef\n");
    });

  });

});
