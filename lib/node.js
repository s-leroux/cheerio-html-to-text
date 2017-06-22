function identity(x) { return x; };

module.exports.makeNode = function(head, lambda) {
  lambda = lambda || identity;
  return lambda({
    content: [],
    parent: head,
    prefix: head.prefix,
    width: head.width,
  });
}


module.exports.makeRootNode = function(width) {
  return {
    content: [],
    parent: null,
    prefix: "",
    width: width,
  };
}

module.exports.popNode = function(head, lambda) {
  head.parent.content.push(lambda(head));
  return head.parent;
}
