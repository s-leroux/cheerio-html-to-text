const cheerio = require('cheerio');
const util = require('util');

function identity(x) { return x; };

/**
  Tree traversal of a cheerio DOM
 */
function walk(root, enter, leave) {
  enter(root);
  if (root.type == 'tag')
    for (child of root.children) {
      walk(child, enter, leave);
    }
  leave(root);
}

/**
  Remove multiple spaces
 */
function clearInlineSpaces(str) {
  // See https://www.w3.org/TR/css-syntax-3/#whitespace
  // U+000D CARRIAGE RETURN and U+000C FORM FEED shouldn't be present
  // but it doesn't hurt to handle them
  return str.replace(/[\u0009\u0020\u000A\u000C\u000D]+/g, ' ');
}

/**
  Join inline content
  
  Process the fragments regarless of their type, assuming the
  contant is made only of inline text
 */
function joinInline(content) {
  let result = "";
  for(c of content) {
      result += c.data;
  }
  
  return { type:'inline', data:result };
}

/**
  Make a block content from a mix of block and inline content
  
  Block content is let as-it
  Inline content is joined then multiple spaces are removed
  
  @param {text_fragment[]} content
  @param {function} converter
    Function used to convert from inline to block. Defaults to identity.
  
 */
function makeBlock(content, converter) {
  converter = converter || clearInlineSpaces;
  let inline = "";
  let result = "";
  
  function flushInline() {
    if (inline) {
      // ignore whitespace only inline text between blocks
      if (inline.replace(/\s+/,'')) {
        if (result)
          result += '\n';
        result += converter(inline);
      }
      inline = "";
    }
  }
  
  for(c of content) {
    if (c.type == "inline") {
      inline += c.data;
    }
    else { // Block
        // flush previous inline content
        flushInline();
        
        // then add Block
        if (result)
          result += '\n';
        result += c.data;
    }
  }
  // flush last inline content
  flushInline();

  return { type: 'block', data: result };
}

function makeParagraph(content) {
    const result = makeBlock(content);
    result.data = "\n"+result.data;
    return result;
}

function makeRootNode() {
  return {
    content: [],
    parent: null,
  };
}

function makeNode(head, lambda) {
  lambda = lambda || identity;
  return lambda({
    content: [],
    parent: head,
  });
}

function popNode(head, lambda) {
  head.parent.content.push(lambda(head.content));
  return head.parent;
}

const element = (function() {
  result = {};
  
  // phrase content
  // https://www.w3.org/TR/html5/single-page.html#phrasing-content-1
  for(let element of ['a', 'abbr', 'area',  'audio', 'b', 'bdi', 'bdo', 'br',
                      'button', 'canvas', 'cite', 'code', 'data', 'datalist',
                      'del', 'dfn', 'em', 'embed', 'i', 'iframe', 'img',
                      'input', 'ins', 'kbd', 'keygen', 'label', 'map', 'mark',
                      'math', 'meter', 'noscript', 'object', 'output',
                      'progress', 'q', 'ruby', 's', 'samp', 'script',
                      'select', 'small', 'span', 'strong', 'sub', 'sup',
                      'svg', 'template', 'textarea', 'time', 'u', 'var',
                      'video', 'wbr']) {
      result[element] = {
        push: makeNode,
        pop: joinInline,
      }
  }
  
  // sectioning/heading content
  // https://www.w3.org/TR/html5/single-page.html#sectioning-content-0
  for(let element of ['article', 'aside', 'nav', 'section',
                       'h1', 'h2', 'h3', 'h4', 'h5', 'h6']) {
      result[element] = {
        push: makeNode,
        pop: makeBlock,
      };
  }
  
  // misc content
  for(let element of ['body', 'p', 'div',
                      'table', 'tr', 'th', 'td', 'tbody', 'thead']) {
      result[element] = {
        push: makeNode,
        pop: makeBlock,
      };
  }
  
  // special cases
  result['p'] = {
    push: makeNode,
    pop: makeParagraph,
  };

  return result;
})();

/**
  Convert an html fragment to its text equivalent
  
  @param {(string|cheerio_document)} data the fragment to convert
 */
exports.convert = function(data) {
//  console.log("data is %s", data);
  if ("string" == typeof data)
    data = cheerio.load(data);
  
  let head = makeRootNode();
  
  function enter(node) {
//    console.log("enter %s %s", node.name, util.inspect(head));

    if (node.type == 'tag')
      head = makeNode(head);
    else if (node.type == 'text')
      head.content.push({ type:'inline', data: node.data });
  }
  
  function leave(node) {
//    console.log("leave %s %s", node.name, util.inspect(head));
    if (node.type == 'tag') {
      head = popNode(head, element[node.name].pop);
    }
  }
  
  walk(data('body').get(0), enter, leave);
  
  return head.content[0].data;
}
