const node = require('./node.js');
const text = require('./text.js');

function paragraph(content) {
    content.data.unshift("\n");
    return content;
}

function underline(chars) {
  return function(content) {  
      content.data.push(text.makeLine(chars, content.width, content.prefix));
      return content;
  }
}

function nodeHandler(filter) {
    return function(node) {
        return filter(text.nodeToTextBlock(node));
    }
}

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
        push: node.makeNode,
        pop: text.nodeToInlineText,
      }
  }
  
  // sectioning/heading content
  // https://www.w3.org/TR/html5/single-page.html#sectioning-content-0
  for(let element of ['article', 'aside', 'nav', 'section',
                       'h1', 'h2', 'h3', 'h4', 'h5', 'h6']) {
      result[element] = {
        push: node.makeNode,
        pop: text.nodeToTextBlock,
      };
  }
  
  // misc content
  for(let element of ['body', 'p', 'div',
                      'table', 'tr', 'th', 'td', 'tbody', 'thead']) {
      result[element] = {
        push: node.makeNode,
        pop: text.nodeToTextBlock,
      };
  }
  
  // special cases
  result['p'].pop = nodeHandler(paragraph);
  result['h1'].pop = nodeHandler(underline('='));
  result['h2'].pop = nodeHandler(underline('-'));

  return result;
})();
