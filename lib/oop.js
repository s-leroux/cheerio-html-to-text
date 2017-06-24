/*
  collection of oop helpers
*/
const _ = require('underscore');

/**
  Usage:
  D.prototype = oop.extend(C.prototype);
  D.prototype.xyz = function() { ... };
  
  As a shorthand, one might write:
  const D = extend(C.prototype, function() { ... });
 */
exports.extend = function(prototype, fn) {
  const new_proto = extend(prototype);

  return (fn) ? factory(new_proto, fn) : new_proto;
}

function extend(prototype) {
  const handler = {
    get: function(target, name) {
/*      if (target.hasOwnProperty(name))
        return target[name];
*/
      const prop = prototype[name];
      if (typeof prop !== "function")
        return prop;
      
      return prop.bind(target);
    }
  };
  
  const proto = Object.create(prototype);
  proto.super = function() { return new Proxy(this, handler) };
  
  return proto;
}

/**
  Like a constructor, but share actual prototype with another constructor.

  Usage:
  D = oop.factory(C.prototype, function(){
    this.value = 123;
  });
 */
exports.factory = factory;
function factory(prototype, fn) {
  const ctor = function() {
    if (!new.target) return new ctor(...arguments);

    fn.apply(this, arguments);
    
    return this;
  }
  
//  ctor.init = (self, ...args) => fn.apply(self, args);
  ctor.init = fn;
  ctor.prototype = prototype;
  
  return ctor;
}

/**
  Usage:
  C = oop.constructor(function(){
    this.value = 123;
  });
  
  then can call C() or new C()
 */
exports.constructor = function(fn) { return factory({}, fn); }
