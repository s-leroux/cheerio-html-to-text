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
    lines.push(line.slice(0,-1));
    actualWidth = Math.max(actualWidth, line.length-1);
    line = prefix;
    wc = 0;
  }
  
  const words = str.split(/[\u0009\u0020\u000A\u000C\u000D]+/);
  
  for(word of words) {
    if (wc && (line.length+word.length > width)) {
      newLine();
    }
    
    line += word;
    line += " ";
    ++wc;
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
  Transform a string to a text block suitable for the given node
 */
exports.stringToBlock = stringToBlock;
function stringToBlock(str, node) {
  return reflow(str, node.width, node.prefix);
};

/**
  Join inline content.
  
  Process the fragments regarless of their type, assuming the
  content is made only of inline text
 */
exports.nodeToInlineText = function(node) {
  const content = node.content;
  let result = "";
  
  for(c of content) {
      result += c.data.join('');
  }
  
  return makeInlineText(result);
}

/**
  Create a new empty inline text
 */
exports.makeInlineText = makeInlineText;
function makeInlineText(line) {
  return {
    type: 'inline',
    data: (line) ? [line] : [],
  };
}

function inlineTextToString(text) {
  return text.data.join('');
}


/**
  Make a block content from a mix of block and inline content
  
  Block content is left as-it
  Inline content is reflowed to fit in the node block
  
  @param {text_fragment[]} content
 */
exports.nodeToTextBlock = nodeToTextBlock;
function nodeToTextBlock(node) {
  const content = node.content;
  let inline = "";
  let text = [];
  let actualBlockWidth = 0;
  
  function pushBlock(block) {
    text = text.concat(block.data);
    actualBlockWidth = Math.max(actualBlockWidth, block.width);
  }
  
  function flushInline() {
    if (inline) {
      // ignore whitespace only inline text between blocks
      if (inline.replace(/\s+/,'')) {
        pushBlock(stringToBlock(inline, node));
      }
      inline = "";
    }
  }
  
  for(c of content) {
    if (c.type == "inline") {
      inline += inlineTextToString(c);
    }
    else { // Block
        // flush previous inline content
        flushInline();
        
        // then add Block
        pushBlock(c);
    }
  }
  // flush last inline content
  flushInline();

  return { type: 'block', data: text, width: actualBlockWidth };
}
