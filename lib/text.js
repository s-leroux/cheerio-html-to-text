oop = require('./oop.js');

const Inline = oop.constructor(function(line){
  this.type = 'inline';
  this.data = (line) ? [line] : [];
});
exports.Inline = Inline;

/**
  Return a normalized content of an inline text
 */
Inline.prototype.getPhraseContent = function() {
  const str = " " + this.toString() + " ";
  
  return str.replace(/[\u0009\u0020\u000A\u000C\u000D]+/g, " ").slice(1,-1);
}


Inline.prototype.toString = function() {
  return this.data.join('');
}

Inline.prototype.clone = function() {
  return Inline(this.toString());
}


const AbstractBlock = {};

AbstractBlock.init = function(data, width) {
  if (typeof width === "undefined") {
    width = 0;
    for(let line of data) {
      // assume proper lines (i.e.: terminated by \n and not containing any other \n)
      width = Math.max(width, line.length-1);
    }
  }

  this.type = 'block';
  this.data = data;
  this.width = width;
};


/**
  Deep clone a text (inline or block)
  Mostly useful for testing purposes
 */
AbstractBlock.clone = function() {
  return new AbstractBlock.init(this.data.slice(), this.width);
}



/**
  Create a new text block from a string and conforming to the
  requirements of the given options
 */
exports.BlockFromString = oop.factory(AbstractBlock, function(str, options){
  let data, width;
  
  if (options) {
    const flow = reflow(str, options.width, options.prefix);
    data = flow.data;
    width = flow.width;
  }
  else {
    data = str.split('\n').map(x => x+'\n');
  }
  
  AbstractBlock.init.call(this, data, width);
});

exports.Block = oop.factory(AbstractBlock, AbstractBlock.init);

/*
  A text is either a text block or an inline text
  
  All texts are made of lines
  
  {
    type: {'block'|'inline'},
    width: nnn,  (only for blocks)
    data: [
      "line 1",
      "line 2",
    ],
  }
*/


/**
  Reflow a text object to honnor the given width and prefix.
  The result is always a text block.
 */
function reflow(str, width, prefix) {
  prefix = prefix || "";
  width = width || 80;
  
  const lines = [];
  let line = prefix;
  let wc = 0;
  let actualWidth = 0;
    
  function newLine() {
    lines.push(line.slice(0,-1)+'\n');
    actualWidth = Math.max(actualWidth, line.length-1);
    line = prefix;
    wc = 0;
  }
  
  const words = str.split(/[\u0009\u0020\u000A\u000C\u000D]+/);
  
  for(word of words) {
    if (word) { // we could have emty word if the string starts of ends with spaces
      if (wc && (line.length+word.length > width)) {
        newLine();
      }
      
      line += word;
      line += " ";
      ++wc;
    }
  }

  if (wc)
    newLine();
    
  return {
    type: 'block',
    width: actualWidth,
    data: lines,
  };
}





/**
  Build a line made of repeating characters.
  
  The line is terminater by \\n (not counting in the line width)
 */
exports.makeLine = makeLine;
function makeLine(chars, width, prefix) {
  prefix = prefix || '';
  
  let line = prefix;
  const count = Math.ceil((width-prefix.length)/chars.length);
  if (count > 0)
    line += chars.repeat(count);
    
  line = line.substr(0, width);
  return line+'\n';
}
