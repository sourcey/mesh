/*
    mesh.class.js
    Reusable OOP class pattern for Javascript.

    Copyright (c)2010 Sourcey
    http://sourcey.com
    Distributed under The MIT License.
*/


Mesh.Class = function () {};
Mesh.Class.extend = function (props) {

	// The extended class with the new prototype
	var NewClass = function () {

		// Call the constructor
		if (this.init)
        this.init.apply(this, arguments);

		// call all constructor hooks
		if (this._initHooks)
        this.callInitHooks();
	};

	// Instantiate class without calling constructor
	var F = function () {};
	F.prototype = this.prototype;

	var proto = new F();
	proto.constructor = NewClass;
	NewClass.prototype = proto;

	// Inherit parent's statics
	for (var i in this) {
      if (this.hasOwnProperty(i) && i !== 'prototype') {
          NewClass[i] = this[i];
      }
	}

	// Mix static properties into the class
	if (props.statics) {
      Mesh.extend(NewClass, props.statics);
      delete props.statics;
	}

	// Mix includes into the prototype
	if (props.includes) {
      Mesh.Util.extend.apply(null, [proto].concat(props.includes));
      delete props.includes;
	}

	// Merge options
	if (props.options && proto.options) {
      props.options = Mesh.extend({}, proto.options, props.options);
	}

	// Mix given properties into the prototype
	Mesh.extend(proto, props);

	proto._initHooks = [];
	var parent = this;
	
	// Add method for calling all hooks
	proto.callInitHooks = function () {
		if (this._initHooksCalled) 
        return;
		
		if (parent.prototype.callInitHooks)
        parent.prototype.callInitHooks.call(this);
        
		this._initHooksCalled = true;
		
		for (var i = 0, len = proto._initHooks.length; i < len; i++)
        proto._initHooks[i].call(this);
	};

	return NewClass;
};


// method for adding properties to prototype
Mesh.Class.include = function (props) {
    Mesh.extend(this.prototype, props);
};

// merge new default options to the Class
Mesh.Class.mergeOptions = function (options) {
    Mesh.extend(this.prototype.options, options);
};

// add a constructor hook
Mesh.Class.addInitHook = function (fn) { // (Function) || (String, args...)
    var args = Array.prototype.slice.call(arguments, 1);

    var init = typeof fn === 'function' ? fn : function () {
        this[fn].apply(this, args);
    };

    this.prototype._initHooks = this.prototype._initHooks || [];
    this.prototype._initHooks.push(init);
};


//
// Mesh.Mixin.Events is used to add custom events functionality to Mesh classes.
//
Mesh.Mixin = {};
Mesh.Mixin.Events = {

	addEvent: function (event, fn, context) { // (String, Function[, Object])    
      if (typeof this.delegates === 'undefined')
          this.delegates = {}
      if (typeof this.delegates[event] === 'undefined')
          this.delegates[event] = [];
      if (typeof fn !== 'undefined' && fn.constructor === Function)
          this.delegates[event].push({
              fn: fn,
              context: context || this
          });

      return this;
	},

	hasEvent: function (event) { // (String) -> Boolean
      return typeof this.delegates !== 'undefined'
        && typeof this.delegates[event] !== 'undefined' 
        && this.delegates[event].length > 0
	},

	removeEvent: function (event, fn, context) { // (String[, Function, Object])
      if (this.hasEvent(event)) {
          for (var i = 0; i < this.delegates[event].length; i++) {
              if ((!fn || this.delegates[event][i].fn === fn) &&
                  (!context || this.delegates[event][i].context === context)) {
                  this.delegates[event].splice(i, 1);
              }
          }
      }

      return this;
	},

	triggerEvent: function (event)	{ // (String[, ...])
      if (this.hasEvent(event)) {
          if (typeof this.delegates[event] !== 'undefined') {
              for (var i = 0; i < this.delegates[event].length; i++) {
                  this.delegates[event][i].fn.apply(this, Array.prototype.slice.call(arguments, 1));
              }
          }
      }

      return this;
	}
};

Mesh.Mixin.Events.on = Mesh.Mixin.Events.addEvent;
Mesh.Mixin.Events.off = Mesh.Mixin.Events.removeEvent;
Mesh.Mixin.Events.trigger = Mesh.Mixin.Events.triggerEvent;