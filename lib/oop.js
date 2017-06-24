/*
  collection of oop helpers
*/
const _ = require('underscore');

/**
  Usage:
  D.prototype = oop.extend(C.prototype);
  D.prototype.xyz = function() { ... };
 */
exports.extend = function(prototype) {
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
  Usage:
  C = oop.constructor(function(){
    this.value = 123;
  });
  
  then can call C() or new C()
 */
exports.constructor = function(fn) {
  const ctor = function() {
    if (!new.target) return new ctor(...arguments);

    fn.apply(this, arguments);
    
    return this;
  }
  
  ctor.init = (self, ...args) => fn.apply(self, args);
  
  return ctor;
}

/**
  Like a constructor, but share actual prototype with another constructor.

  Usage:
  D = oop.factory(C, function(){
    this.value = 123;
  });
 */
exports.factory = function(prototype, fn) {
  const ctor = exports.constructor(fn);
  ctor.prototype = prototype;
  
  return ctor;
}
