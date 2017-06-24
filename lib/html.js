const node = require('./node.js');
const text = require('./text.js');

const identity = (x) => x;

function paragraph(content, node) {
    content.data.unshift("\n");
    return content;
}

function bullet(content, node) {
  node.parent.listcount+=1;

  if ((!content.data.length) || (node.listlevel<0))
    return node;
    
  let r = "    ";
  if (node.listtype == 'UL') {
    const bullets = [
      "  * ",
      "  - ",
      "  o ",
    ];
    r = bullets[node.listlevel % bullets.length];
  }
  else if (node.listtype == 'OL') {
    r = ("  " + node.parent.listcount.toFixed() + ". ").slice(-4);
  }

  r = node.prefix.slice(0,-4) + r;
  content.data[0] = r + content.data[0].slice(r.length);
  
  return content;
}

function underline(chars) {
  return function(content, node) {  
      content.data.push(text.makeLine(chars, content.width, content.prefix));
      return content;
  }
}

function separator(chars) {
  return function(content, node) {  
      content.data.push(text.makeLine(chars, node.width, ""));
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

function indent(node) {
  node.prefix += "    ";
  return node;
}

function newline(node) {
  node.content.push(text.BlockFromString(""));
  return node;
}

function inclist(node) {
  node.listlevel += 1;
  return node;
}

function ordered(node) {
  node.listtype = 'OL';
  return node;
}

function unordered(node) {
  node.listtype = 'UL';
  return node;
}

wrap = (...fn) =>
  (conv) =>
    (...args) =>
      fn.reduceRight((value, func) => func(value), conv.apply(this, args));

exports.elements = {
  get: function(name) {
      return this._repository[name] || this._repository["*"];
  }
};
exports.elements._repository = (function() {
  result = {};
  
  // Default element handler
  result["*"] = {
    push: node.Ghost,
    pop: identity,
  }
  
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
                       
                       'blockquote', 'ul', 'ol', 'li']) {
      result[element] = {
        push: node.BlockNode,
        pop: identity,
      };
  }
  
  // misc content
  for(let element of ['body', 'p', 'div',
                      'table', 'tr', 'th', 'td', 'tbody', 'thead',
                    
                      'hr' ]) {
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
  result['blockquote'].push = wrap(indent,newline)(node.BlockNode);
  result['ul'].push = wrap(unordered,inclist,indent,newline)(node.BlockNode);
  result['ol'].push = wrap(ordered,inclist,indent,newline)(node.BlockNode);
  result['li'].pop = bullet;
  result['br'].push = node.BlockNode; // handle as an empty block to force flow break
  result['hr'].pop = separator('-');

  return result;
})();
