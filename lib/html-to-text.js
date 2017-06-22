const cheerio = require('cheerio');
const util = require('util');
const text = require('./text.js');
const _ = require('underscore');

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

function nodeToParagraph(content) {
    const result = text.nodeToTextBlock(content);
    result.data = "\n"+result.data;
    return result;
}

function makeRootNode(width) {
  return {
    content: [],
    parent: null,
    prefix: "",
    width: width,
  };
}

function makeNode(head, lambda) {
  lambda = lambda || identity;
  return lambda({
    content: [],
    parent: head,
    prefix: head.prefix,
    width: head.width,
  });
}

function popNode(head, lambda) {
  head.parent.content.push(lambda(head));
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
        pop: text.nodeToInlineText,
      }
  }
  
  // sectioning/heading content
  // https://www.w3.org/TR/html5/single-page.html#sectioning-content-0
  for(let element of ['article', 'aside', 'nav', 'section',
                       'h1', 'h2', 'h3', 'h4', 'h5', 'h6']) {
      result[element] = {
        push: makeNode,
        pop: text.nodeToTextBlock,
      };
  }
  
  // misc content
  for(let element of ['body', 'p', 'div',
                      'table', 'tr', 'th', 'td', 'tbody', 'thead']) {
      result[element] = {
        push: makeNode,
        pop: text.nodeToTextBlock,
      };
  }
  
  // special cases
  result['p'] = {
    push: makeNode,
    pop: nodeToParagraph,
  };

  return result;
})();

/**
  Convert an html fragment to its text equivalent
  
  @param {(string|cheerio_document)} data the fragment to convert
 */
exports.convert = function(data, options) {
  options = _.extendOwn({
      width: 80,
    },
    options
  );
//  console.log("data is %s", data);
  if ("string" == typeof data)
    data = cheerio.load(data);
  
  let head = makeRootNode(options.width);
  
  function enter(node) {
//    console.log("enter %s %s", node.name, util.inspect(head));

    if (node.type == 'tag')
      head = makeNode(head);
    else if (node.type == 'text')
      head.content.push(text.makeInlineText(node.data));
  }
  
  function leave(node) {
//    console.log("leave %s %s", node.name, util.inspect(head));
    if (node.type == 'tag') {
      head = popNode(head, element[node.name].pop);
    }
  }
  
  walk(data('body').get(0), enter, leave);
  
  return head.content[0].data.join('\n')+'\n';
}
