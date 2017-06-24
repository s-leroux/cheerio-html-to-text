text = require('./text.js');
oop = require('./oop.js');


function identity(x) { return x; };


const Node = oop.constructor(function(head, fn){ // XXX Could (ab)use the prototype chain here
  this.content = [];
  this.parent = head;
  this.prefix = head.prefix;
  this.width = head.width;
  this.listlevel = head.listlevel;
  this.listtype = head.listtype;
  this.listcount = 0;

  if (fn) fn(this);
});
//exports.Node = Node;

exports.RootNode = oop.factory(Node.prototype, function(width) {
  this.content = [];
  this.parent = null;
  this.prefix = "";
  this.width = width;
  this.listlevel = -1;
  this.listtype = undefined;
  this.listcount = 0;
});

Node.prototype.pop = function(filter) {
  this.parent.content.push(filter(this.toText(), this));
  return this.parent;
}

Node.prototype.toString = function() {
  let result = "";
  for(let i of this.content) {
      result += i.toString();
  }
  
  return result;
}

/**
  Join inline content.
  
  Process the fragments regarless of their type, assuming the
  content is made only of inline text
 */
Node.prototype.toInlineText = function() {
  return text.Inline(this.toString());
}


/**
  Make a block content from a mix of block and inline content
  
  Block content is left as-it
  Inline content is reflowed to fit in the node block
  
  @param {text_fragment[]} content
 */
Node.prototype.toTextBlock = function() {
  const content = this.content;
  let inline = "";
  let data = [];
  let actualBlockWidth = 0;
  
  let pushBlock = (block) => {
    data = data.concat(block.data);
    actualBlockWidth = Math.max(actualBlockWidth, block.width);
  }
  
  let flushInline = () => {
    if (inline) {
      // ignore whitespace only inline text between blocks
      if (inline.replace(/\s+/,'')) {
        pushBlock(text.BlockFromString(inline, this));
      }
      inline = "";
    }
  }
  
  for(let c of content) {
    if (c.type == "inline") {
      inline += c.toString(c);
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

  return text.Block(data, actualBlockWidth);
}

exports.InlineNode = oop.extend(Node.prototype, Node.init);
exports.InlineNode.prototype.toText = Node.prototype.toInlineText;

exports.BlockNode = oop.extend(Node.prototype, Node.init);
exports.BlockNode.prototype.toText = Node.prototype.toTextBlock;

// A special node that discard its content.
// Usefult as handler for unknown elements
exports.Ghost = oop.extend(Node.prototype, Node.init);
exports.Ghost.prototype.toText = function() {
  return text.Inline("");
}
