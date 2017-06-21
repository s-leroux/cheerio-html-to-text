const cheerio = require('cheerio');
const util = require('util');

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
  Convert an html fragment to its text equivalent
  
  @param {(string|cheerio document)} data the fragment to convert
 */
exports.convert = function(data) {
  console.log("data is %s", data);
  if ("string" == typeof data)
    data = cheerio.load(data);
  
  
  let head = { content: [], parent: null };
  
  function enter(node) {
    console.log("enter %s %s", node.name, util.inspect(head));

    if (node.type == 'tag')
      head = { content: [], parent: head };
    else if (node.type == 'text')
      head.content.push(node.data);
  }
  
  function leave(node) {
    console.log("leave %s %s", node.name, util.inspect(head));
    if (node.type == 'tag') {
      const current = head;
      head = head.parent;
      
      const text = current.content.join('');
      head.content.push(text);
    }
  }
  
  walk(data('body').get(0), enter, leave);
  
  return head.content[0];
}
