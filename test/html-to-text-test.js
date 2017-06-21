const assert = require('chai').assert;
const rewire = require('rewire');

describe("Text manipulation method", function() {
  const htt = rewire('../lib/html-to-text.js');
  
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
    const content = [
      { type: 'inline', data: 'abc ' },
      { type: 'inline', data: ' def' },
    ];
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
    const content = [
      { type: 'inline', data: 'abc ' },
      { type: 'inline', data: 'def' },
      { type: 'block', data: 'bbbb' },
      { type: 'inline', data: 'ghi' },
    ];
    const expected = "abc def\nbbbb\nghi";

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

    it('should join blocks using \\n', function() {
      const content = [
        { type: 'block', data: 'abc' },
        { type: 'block', data: 'def' },
        { type: 'inline', data: 'ghi' },
      ];
      const result = makeBlock(content);
      assert.equal(result.data, "abc\ndef\nghi");
    });

    it('should catenate all inline/block text fragments', function() {
      const result = makeBlock(content);
      assert.equal(result.data, expected);
    });

    it('should remove duplicate space in inline blocks only', function() {
      const content = [
        { type: 'inline', data: 'abc  def' },
        { type: 'block', data: 'bb  bb' },
        { type: 'inline', data: 'ghi' },
      ];
      const result = makeBlock(content);
      assert.equal(result.data, "abc def\nbb  bb\nghi");
    });

    it('should remove duplicate space over inline blocks limits', function() {
      const content = [
        { type: 'inline', data: 'abc ' },
        { type: 'inline', data: ' def' },
      ];
      const result = makeBlock(content);
      assert.equal(result.data, "abc def");
    });

    it('should discard space-only inline text between block text', function() {
      const content = [
        { type: 'block', data: 'abc' },
        { type: 'inline', data: '   ' },
        { type: 'block', data: 'def' },
      ];
      const result = makeBlock(content);
      assert.equal(result.data, "abc\ndef");
    });

  });

});
