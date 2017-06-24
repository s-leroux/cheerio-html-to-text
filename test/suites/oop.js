const chai = require('chai');
chai.use(require('chai-string'));
const assert = chai.assert;

const oop = require('../../lib/oop.js');

describe("oop methods", function() {
  describe("factory()", function() {
    const F = oop.factory({}, function() { this.v = 1 });
    F.prototype.m = function() {};
    
    it('should create a new object both from new and by call', function() {
      const f1 = F();
      const f2 = new F();
      
      assert.isObject(f1);
      assert.deepEqual(f1, f2);
    });
    
    it('should call the init function', function() {
      const f = F();
      assert.property(f, 'v');
    });
    
    it('should allow access to prototype methods', function() {
      const f = F();
      assert.property(f, 'm');
    });
  });

  describe("extend()", function() {
    const P0 = {};
    P0.m = function() { return this.v*1 };
    
    const P1 = oop.extend(P0);
    P1.m = function() { return this.v*10 };
    
    const P2 = oop.extend(P1);
    P2.m = function() { return this.v*100 };
    
    const F = oop.factory(P2, function() { this.v = 1 });
    const f = F();
    
    it('should properly route methods', function() {
      assert.equal(f.m(), 1*100);
    });
    
    it('should allow super to route to the base class methods', function() {
      assert.equal(f.super().m(), 1*10);
      assert.equal(f.super().super().m(), 1*1);
    });
  });
  
  describe("extend(proto,fn)", function() {
    it('should be a shortcut for factory(extend(), fn)', function() {
      const fn = function() { this.v = 1 };
      const BASE = function() {};
      const A = oop.extend(BASE.prototype, fn);
      const B = oop.factory(oop.extend(BASE.prototype), fn);
      assert.equal(A.__proto__, B.__proto__);
      assert.equal(A().v, B().v);
    });
    
    it('should add a prototype level while allowing base ctor invocation', function() {
      const A = oop.factory({}, function() { this.v = 1 });
      A.prototype.name="A";
      const X = oop.extend(A.prototype, A.init);
      X.prototype.name="X";
      const x = X();
      
      
      assert.equal(x.v, 1);
      assert.propertyVal(x.__proto__, 'name', 'X');
      assert.propertyVal(x.__proto__.__proto__, 'name', 'A');
      assert.propertyVal(X.prototype.__proto__, 'name', 'A');
    });
  });
  
  describe("method invocation", function() {
    const P0 = {};
    P0.m = function() { return this.v+=1 };
    
    const P1 = oop.extend(P0);
    P1.m = function() { return this.v+=10 };
    
    const P2 = oop.extend(P1);
    P2.m = function() { return this.v+=100 };
    
    const F = oop.factory(P2, function() { this.v = 1 });
    const f = F();
    
    it('should run in the context of the base object', function() {
      const before = f.v;
      f.m();
      const after = f.v;
      
      assert.equal(after, before+100);
    });
    
    it('through super() should run in the context of the base object', function() {
      const before = f.v;
      f.super().m();
      const after = f.v;
      
      assert.equal(after, before+10);
    });
    
    it('through super() should run in the context of the base object', function() {
      const before = f.v;
      f.super().super().m();
      const after = f.v;
      
      assert.equal(after, before+1);
    });
  });  
  
});
