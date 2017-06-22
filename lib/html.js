const node = require('./node.js');
const text = require('./text.js');

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
  console.log("[%s][%s]",href,text.getPhraseContent(content));
  if (href && (href != text.getPhraseContent(content))) {
      // anchor link
      content.data.push("["+href+"]");
  }
  return content;
}

function wrap(converter, filter) {
    return function(node) {
        return filter(converter(node), node);
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
  result['p'].pop = wrap(text.nodeToTextBlock, paragraph);
  result['h1'].pop = wrap(text.nodeToTextBlock, underline('='));
  result['h2'].pop = wrap(text.nodeToTextBlock, underline('-'));
  result['a'].pop = wrap(text.nodeToInlineText, anchor);

  return result;
})();
