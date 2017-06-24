const node = require('./node.js');
const text = require('./text.js');

const identity = (x) => x;

function paragraph(content, node) {
    content.data.unshift("\n");
    return content;
}

function underline(chars) {
  return function(content, node) {  
      content.data.push(text.makeLine(chars, content.width, content.prefix));
      return content;
  }
}

function anchor(content, node) {
  const href = node.element && node.element.attribs.href;
  if (href && (href != content.getPhraseContent())) {
      // anchor link
      content.data.push("["+href+"]");
  }
  return content;
}

wrap = (...fn) =>
  (conv) =>
    (...args) =>
      fn.reduceRight((value, func) => func(value), conv.apply(this, args));

exports.elements = (function() {
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
        push: node.InlineNode,
        pop: identity,
      }
  }
  
  // sectioning/heading content
  // https://www.w3.org/TR/html5/single-page.html#sectioning-content-0
  for(let element of ['article', 'aside', 'nav', 'section',
                       'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                       
                       'blockquote']) {
      result[element] = {
        push: node.BlockNode,
        pop: identity,
      };
  }
  
  // misc content
  for(let element of ['body', 'p', 'div',
                      'table', 'tr', 'th', 'td', 'tbody', 'thead']) {
      result[element] = {
        push: node.BlockNode,
        pop: identity,
      };
  }
  
  // special cases
  result['p'].pop = paragraph;
  result['h1'].pop = underline('=');
  result['h2'].pop = underline('-');
  result['a'].pop = anchor;
  result['blockquote'].push = wrap(anchor, node.BlockNode);

  return result;
})();
