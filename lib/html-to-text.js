const cheerio = require('cheerio');
const util = require('util');
const text = require('./text.js');
const html = require('./html.js');
const node = require('./node.js');
const _ = require('underscore');

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

const elements = html.elements;

/**
  Convert an html fragment to its text equivalent
  
  @param {(string|cheerio_document)} data the fragment to convert
 */
exports.convert = function(data, options) {
  options = _.extendOwn({
      width: 80,
    }, options);
//  console.log("data is %s", data);
  if ("string" == typeof data)
    data = cheerio.load(data);
  
  let head = node.RootNode(options.width);
  
  function enter(element) {
    if (element.type == 'tag') {
      head = elements.get(element.name).push(head);
      head.element = element;
    }
    else if (element.type == 'text')
      head.content.push(text.Inline(element.data));
  }
  
  function leave(element) {
    if (element.type == 'tag') {
      head = head.pop(elements.get(element.name).pop);
    }
  }
  
  walk(data('body').get(0), enter, leave);
  
  return head.content[0].data.join('');
}
