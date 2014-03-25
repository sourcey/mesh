/*
    Mesh.History.js
    Browser detector based on http://www.quirksmode.org/js/detect.html

    Copyright (c)2010 Sourcey
    http://sourcey.com
    Distributed under The MIT License.
*/


Mesh.Browser = {
	init: function() {
		this.browser = this.searchString(this.dataBrowser) || "Unknown";
		this.version = this.searchVersion(navigator.userAgent)
			|| this.searchVersion(navigator.appVersion) || 0;
		this.OS = this.searchString(this.dataOS) || "Unknown";
	},
	searchString: function(data) {
		for (var i=0;i<data.length;i++)	{
			var dataString = data[i].string;
			var dataProp = data[i].prop;
			this.versionSearchString = data[i].versionSearch || data[i].identity;
			if (dataString) {
				if (dataString.indexOf(data[i].subString) != -1)
					return data[i].identity;
			}
			else if (dataProp)
				return data[i].identity;
		}
	},
	searchVersion: function(dataString) {
		var index = dataString.indexOf(this.versionSearchString);
		if (index == -1) return;
		return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
	},
	dataBrowser: [
		{
			string: navigator.userAgent,
			subString: "Chrome",
			identity: "Chrome"
		},
		{ 	
		  string: navigator.userAgent,
			subString: "OmniWeb",
			versionSearch: "OmniWeb/",
			identity: "OmniWeb"
		},
		{
			string: navigator.vendor,
			subString: "Apple",
			identity: "Safari",
			versionSearch: "Version"
		},
		{
			prop: window.opera,
			identity: "Opera",
			versionSearch: "Version"
		},
		{
			string: navigator.vendor,
			subString: "iCab",
			identity: "iCab"
		},
		{
			string: navigator.vendor,
			subString: "KDE",
			identity: "Konqueror"
		},
		{
			string: navigator.userAgent,
			subString: "Firefox",
			identity: "Firefox"
		},
		{
			string: navigator.vendor,
			subString: "Camino",
			identity: "Camino"
		},
		{		// for newer Netscapes (6+)
			string: navigator.userAgent,
			subString: "Netscape",
			identity: "Netscape"
		},
		{
			string: navigator.userAgent,
			subString: "MSIE",
			identity: "Explorer",
			versionSearch: "MSIE"
		},
		{
			string: navigator.userAgent,
			subString: "Gecko",
			identity: "Mozilla",
			versionSearch: "rv"
		},
		{ 		// for older Netscapes (4-)
			string: navigator.userAgent,
			subString: "Mozilla",
			identity: "Netscape",
			versionSearch: "Mozilla"
		}
	],
	dataOS : [
		{
			string: navigator.platform,
			subString: "Win",
			identity: "Windows"
		},
		{
			string: navigator.platform,
			subString: "Mac",
			identity: "Mac"
		},
		{
       string: navigator.platform,
       subString: "iPhone",
       identity: "iPhone/iPod"
	  },
		{
       string: navigator.platform,
       subString: "iPad",
       identity: "iPad"
	  },
		{
			string: navigator.platform,
			subString: "Linux",
			identity: "Linux"
		}
	]
};


Mesh.Browser.Classify = {
	init: function() {
    if (!Mesh.Browser.browser)
        Mesh.Browser.init();
    var browser = Mesh.Browser.browser.toLowerCase();
    var extra;
    switch (browser) {
        case 'explorer':
            browser = 'ie'            
            switch (Mesh.Browser.version) {
                case 12: // future compatability
                case 11:
                case 10:
                    extra = 'lte10'
                    break;
                case 9:
                    extra = 'lte10 lte9'
                    break;
                case 8:
                    extra = 'lte10 lte9 lte8'
                    break;
                case 7:
                    extra = 'lte10 lte9 lte8 lte7'
                    break;                  
                default: 
                    extra = 'lte10 lte9 lte8 lte7 lte6'
                    break;      
            }
            break;
        case 'firefox':
            browser = 'ff'
            break;
    }
    classes = browser + ' ' + browser + Mesh.Browser.version;
    if (extra)
        classes += ' ' + extra;
    Mesh.Util.addClass(document.body, classes);
    //alert("Mesh.Browser.Class: " + classes)    
	}
}
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
/*
    mesh.cookie.js
    JavaScript Cookie Manager

    Copyright (c)2010 Sourcey
    http://sourcey.com
    Distributed under The MIT License.
*/


Mesh.Cookies = {

    // Default cookie path
    path: '/',
    
    // Default cookie domain
    domain: null,

    // Set a cookie    
    // (String, String, Number[, String, String])   
    set: function(name, value, days, secure, path, domain) {      
        var cookie = name + "=" + escape(value) + "; ";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 86400000));
            var expires = date.toGMTString();
            cookie += "expires=" + expires + "; ";
        }
        path = typeof path == 'string' ? 
            path : this.path;
        cookie += "path=" + path + "; ";
        if (domain || this.domain) {
            domain = typeof domain == 'string' ? 
                domain : this.domain;
            cookie += "domain=" + domain + "; ";
        }
        if (secure)
            cookie += "secure; ";
        
        console.log('Set Cookie:', cookie, value)
        document.cookie = cookie;
    },

    // get a cookie
    get: function(name) { // (String)
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') 
                c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) 
                return unescape(c.substring(nameEQ.length, c.length));
        }
        return null;
    },

    getAll: function() {
        return document.cookie.split(';');
    },

    // Delete a cookie
    del: function(name) { // (String)
        this.set(name, "", -1);
    },

    // Clear all cookies
    clearAll: function() {
        var cookies = document.cookie.split(";");
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i];
            var eqPos = cookie.indexOf("=");
            var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            this.del(name);
        }
    },

    // Delete cookies with name matching regex pattern
    delMatching: function(regex) { // (String)
        var cookies = document.cookie.split(";");
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i];
            var eqPos = cookie.indexOf("=");
            var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            var match = name.match(regex);
            if (match && match.length)
                this.del(name);
        }
    }
};
/*
    mesh.forms.js
    Degradable HTML5 and CSS3 forms

    Copyright (c)2010 Sourcey
    http://sourcey.com
    Distributed under The MIT License.
*/


// Check support for native HTML5 form validation
Mesh.support.formValidation = (function() {
    var field = document.createElement('input');
    return (Mesh.Util.isHostMethod(field,"validity") && Mesh.Util.isHostMethod(field,"checkValidity"));
})();

// Check support for HTML5 form placeholders
Mesh.support.placeholder = (function(){
    return Mesh.Util.testAttribute('input', 'placeholder');
})();

// Check support for HTML5 form autofocus
Mesh.support.autofocus = (function(){
    return Mesh.Util.testAttribute('input', 'autofocus');
})();


// Initialize form validation for all forms with the 'validate' class
Mesh.loaders.validation = function() {
    var forms = [];
    var formsCollection = document.getElementsByTagName("form");
    for (var i=0;i<formsCollection.length;i++) {
      if (Mesh.Util.hasClass(formsCollection[i], 'validate'))
        forms.push(formsCollection[i]);
    }
    if (forms.length)
        Mesh.forms.validation.setup(forms);
};


// Initialize autofocus for unsupported browsers
Mesh.loaders.autofocus = function() {
    if (Mesh.support.autofocus)
        return;
        
    var forms = document.getElementsByTagName("form");
    for (var i=0;i<forms.length;i++) {
        var els = forms[i].elements;
        for (var x = 0; x < els.length; x++) {
          if (els[x].hasAttribute('autofocus')) {
            //console.log('Mesh Loading: Autofocus: ', els[x])
            els[x].focus();
          }
        } 
    }
};


// Modified version of the Feb 24 2013 release of Ryan Seddon's h5f.js
// See https://github.com/ryanseddon/H5F for original implementation.
Mesh.forms = Mesh.forms || {}
Mesh.forms.forceValidation = false; // Set true to override native validation.
Mesh.forms.validation = (function(d){
    
    var //field = d.createElement("input"),
        emailPatt = /^[a-zA-Z0-9.!#$%&'*+-\/=?\^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
        urlPatt = /[a-z][\-\.+a-z]*:\/\//i,
        nodes = /^(input|select|textarea)$/i,
        isSubmit, bypassSubmit, usrPatt, curEvt, args,
        // Methods
        setup, validation, validity, checkField, bypassChecks, checkValidity, setCustomValidity, support, pattern, placeholder, range, required, valueMissing
        //, listen, Mesh.Util.unbind, Mesh.Util.preventActions, Mesh.Util.getTarget, Mesh.Util.addClass, Mesh.Util.removeClass, Mesh.Util.isHostMethod;
    
    setup = function(form, settings) {        
        var isCollection = !form.nodeType || false;
        
        var opts = {
            validClass : "valid",
            invalidClass : "error",
            requiredClass : "required",
            placeholderClass : "placeholder"
        };

        if (typeof settings === "object") {
            for (var i in opts) {
                if (typeof settings[i] === "undefined") { settings[i] = opts[i]; }
            }
        }
        
        args = settings || opts;
        
        if (isCollection) {
            for(var k=0,len=form.length;k<len;k++) {
                validation(form[k]);
            }
        } else {
            validation(form);
        }
    };
    
    validation = function(form) {
        var f = form.elements,
            flen = f.length,
            isRequired,
            noValidate = !!(form.attributes["novalidate"]);
        
        Mesh.bind(form,"invalid",checkField,true);
        Mesh.bind(form,"blur",checkField,true);
        Mesh.bind(form,"input",checkField,true);
        Mesh.bind(form,"keyup",checkField,true);
        Mesh.bind(form,"focus",checkField,true);
        Mesh.bind(form,"change",checkField,true);
        Mesh.bind(form,"click",bypassChecks,true);
        
        Mesh.bind(form,"submit",function(e){
            isSubmit = true;
            if (!bypassSubmit) {
                if (!noValidate && !form.checkValidity()) {
                    Mesh.Util.preventActions(e);
                }
            }
        },false);
        
        if (!Mesh.support.formValidation || Mesh.forms.forceValidation) {
            // XXX: Added checks here so we don't override native functions
            // while forcing validation. 
            // Overriding native functions has unexpected results.
            if (typeof elem.checkValidity == "undefined")
                form.checkValidity = function() { return checkValidity(form); };
            
            while(flen--) {
                isRequired = !!(f[flen].attributes["required"]);
                // Firefox includes fieldsets inside elements nodelist so we filter it out.
                if (f[flen].nodeName.toLowerCase() !== "fieldset") {
                    validity(f[flen]); // Add validity object to field
                }
            }
        }
    };
    
    validity = function(el) {
        var elem = el,
            missing = valueMissing(elem),
            attrs = {
                type: elem.getAttribute("type"),
                pattern: elem.getAttribute("pattern"),
                placeholder: elem.getAttribute("placeholder")
            },
            isType = /^(email|url)$/i,
            evt = /^(input|keyup)$/i,
            fType = ((isType.test(attrs.type)) ? attrs.type : ((attrs.pattern) ? attrs.pattern : false)),
            patt = pattern(elem,fType),
            step = range(elem,"step"),
            min = range(elem,"min"),
            max = range(elem,"max"),
            customError = !( elem.validationMessage === "" || elem.validationMessage === undefined );
        
        // XXX: Added checks here so we don't override native functions
        // while forcing validation.
        // Overriding native functions has unexpected results.
        if (typeof elem.checkValidity == "undefined")
            elem.checkValidity = function() { return checkValidity.call(this,elem); };          
        if (typeof elem.checkValidity == "undefined")
            elem.setCustomValidity = function(msg) { setCustomValidity.call(elem,msg); };
        
        elem.validity = {
            valueMissing: missing,
            patternMismatch: patt,
            rangeUnderflow: min,
            rangeOverflow: max,
            stepMismatch: step,
            customError: customError,
            valid: (!missing && !patt && !step && !min && !max && !customError)
        };
            
        if (attrs.placeholder && !evt.test(curEvt)) { placeholder(elem); }
    };
    
    checkField = function(e) {
            
        var el = Mesh.Util.getTarget(e) || e, // checkValidity method passes element not event
            //events = /^(input|keyup|focusin|focus|change)$/i,
            events = /^(keyup|focusin|focus|change)$/i, // XXX: Allow update field on input
            ignoredTypes = /^(submit|image|button|reset)$/i,
            specialTypes = /^(checkbox|radio)$/i,
            checkForm = true;
        
        if (nodes.test(el.nodeName) && !(ignoredTypes.test(el.type) || ignoredTypes.test(el.nodeName))) {
            curEvt = e.type;
            
            if (!Mesh.support.formValidation || Mesh.forms.forceValidation) {
                validity(el);
            }
        
            if (el.validity.valid && (el.value !== "" || specialTypes.test(el.type)) || (el.value !== el.getAttribute("placeholder") && el.validity.valid)) {
                Mesh.Util.removeClass(el,[args.invalidClass,args.requiredClass]);
                Mesh.Util.addClass(el,args.validClass);
            } else if (!events.test(curEvt)) {        
                if (el.validity.valueMissing) {
                    Mesh.Util.removeClass(el,[args.invalidClass,args.validClass]);
                    Mesh.Util.addClass(el,args.requiredClass);
                } else if (!el.validity.valid) {
                    Mesh.Util.removeClass(el,[args.validClass,args.requiredClass]);
                    Mesh.Util.addClass(el,args.invalidClass);
                }
            } else if (el.validity.valueMissing) {
                Mesh.Util.removeClass(el,[args.requiredClass,args.invalidClass,args.validClass]);
            }
            if (curEvt === "input" && checkForm) {
                // If input is triggered remove the keyup event
                Mesh.unbind(el.form,"keyup",checkField,true);
                checkForm = false;
            }
        }
    };
    
    checkValidity = function(el) {
        var f, ff, isRequired, hasPattern, invalid = false;
        
        if (el.nodeName.toLowerCase() === "form") {
            f = el.elements;
            
            for(var i = 0,len = f.length;i < len;i++) {
                ff = f[i];
                
                isRequired = !!(ff.attributes["required"]);
                hasPattern = !!(ff.attributes["pattern"]);
                
                if (ff.nodeName.toLowerCase() !== "fieldset" && (isRequired || hasPattern && isRequired)) {
                    checkField(ff);
                    if (!ff.validity.valid && !invalid) {
                        if (isSubmit) { // If it's not a submit event the field shouldn't be focused
                            ff.focus();
                        }
                        invalid = true;
                    }
                }
            }
            return !invalid;
        } else {
            checkField(el);
            return el.validity.valid;
        }
    };
    
    setCustomValidity = function(msg) {
        var el = this;
            
        el.validationMessage = msg;
    };
    
    bypassChecks = function(e) {
        // handle formnovalidate attribute
        var el = Mesh.Util.getTarget(e);

        if (el.attributes["formnovalidate"] && el.type === "submit") {
            bypassSubmit = true;
        }
    };

    // Create helper methods to emulate attributes in older browsers
    pattern = function(el, type) {
        if (type === "email") {
            return !emailPatt.test(el.value);
        } else if (type === "url") {
            return !urlPatt.test(el.value);
        } else if (!type) {
            return false;
        } else {
            var placeholder = el.getAttribute("placeholder"),
                val = el.value;
            
            usrPatt = new RegExp('^(?:' + type + ')$');
            
            if (val === placeholder) {
                return true;
            } else if (val === "") {
                return false;
            } else {
                return !usrPatt.test(el.value);
            }
        }
    };
        
    placeholder = function(el) {
        var attrs = { placeholder: el.getAttribute("placeholder") },
            focus = /^(focus|focusin|submit)$/i,
            node = /^(input|textarea)$/i,
            ignoredType = /^password$/i,
            isNative = !!Mesh.support.placeholder; //!!("placeholder" in field);
        
        if (!isNative && node.test(el.nodeName) && !ignoredType.test(el.type)) {
            if (el.value === "" && !focus.test(curEvt)) {
                el.value = attrs.placeholder;
                Mesh.bind(el.form,'submit', function () {
                  curEvt = 'submit';
                  placeholder(el);
                }, true);
                Mesh.Util.addClass(el,args.placeholderClass);
            } else if (el.value === attrs.placeholder && focus.test(curEvt)) {
                el.value = "";
                Mesh.Util.removeClass(el,args.placeholderClass);
            }
        }
    };
    
    range = function(el, type) {
        // Emulate min, max and step
        var min = parseInt(el.getAttribute("min"),10) || 0,
            max = parseInt(el.getAttribute("max"),10) || false,
            step = parseInt(el.getAttribute("step"),10) || 1,
            val = parseInt(el.value,10),
            mismatch = (val-min)%step;
        
        if (!valueMissing(el) && !isNaN(val)) {
            if (type === "step") {
                return (el.getAttribute("step")) ? (mismatch !== 0) : false;
            } else if (type === "min") {
                return (el.getAttribute("min")) ? (val < min) : false;
            } else if (type === "max") {
                return (el.getAttribute("max")) ? (val > max) : false;
            }
        } else if (el.getAttribute("type") === "number") {
            return true;
        } else {
            return false;
        }
    };
    
    required = function(el) {
        var required = !!(el.attributes["required"]);
        
        return (required) ? valueMissing(el) : false;
    };
    
    valueMissing = function(el) {
        var placeholder = el.getAttribute("placeholder"),
            isRequired = !!(el.attributes["required"]);
        return !!(isRequired && (el.value === "" || el.value === placeholder));
    };
        
    // Since all methods are only used internally no need to expose globally
    return {
        setup: setup,
        checkField: checkField
    }

}(document));


/*
(function(d){

    var emailPatt = /^[a-zA-Z0-9.!#$%&'*+-\/=?\^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
        urlPatt = /[a-z][\-\.+a-z]*:\/\//i,
        nodes = /^(input|select|textarea)$/i,
        inputTypes = /^(email|url)$/i,
        validityEventTypes = /^(input|keyup)$/i,
        checkEvents = /^(input|keyup|focusin|focus)$/i,
        ignoredCheckTypes = /^(submit|image|button|reset)$/i,
        isSubmit, usrPatt, curEvt, args, custMsg = "",

    // Methods
    setup, validation, validity, checkField, checkValidity, setCustomValidity, pattern, placeholder, range, required, valueMissing; 
    //support, , Mesh.bind, Mesh.unbind, Mesh.Util.Mesh.Util.preventActions, Mesh.Util.Mesh.Util.getTarget, Mesh.Util.Mesh.Util.addClass, Mesh.Util.Mesh.Util.removeClass,  Mesh.Util.hasClass, Mesh.Util.isHostMethod;

    //
    // Public Methods
    //
    setup = function(form, options) {
        var isCollection = !form.nodeType || false;

        var defaults = {
            validClass : "valid",
            invalidClass : "error",
            requiredClass : "required",
            placeholderClass : "placeholder"//,
            //caseInsensitiveClass : "insensitive"
        };

        if (typeof options == "object") {
            for (var i in defaults) {
                if (typeof options[i] == "undefined") {
                    options[i] = defaults[i];
                }
            }
        }

        if (typeof options === "object") {
            for (var i in opts) {
                if (typeof options[i] === "undefined") { options[i] = opts[i]; }
            }
        }
        
        args = options || defaults;

        if (isCollection) {
            for (var k=0, len=form.length; k<len; k++) {
                validation(form[k]);
            }
        } else {
            validation(form);
        }
    };

    //
    // Private Methods
    //
    validation = function(form) {
        var f = form.elements,
        flen = f.length,
        isRequired,
        noValidate = !!(form.attributes["novalidate"]);

        //console.log('Mesh.forms.validation: ', form);

        //Mesh.bind(form,"invalid",checkField,true);
        //Mesh.bind(form,"blur",checkField,true);
        //Mesh.bind(form,"input",checkField,true);
        //Mesh.bind(form,"keyup",checkField,true);
        //Mesh.bind(form,"focus",checkField,true);
        
        Mesh.bind(form,"invalid",checkField,true);
        Mesh.bind(form,"blur",checkField,true);
        Mesh.bind(form,"input",checkField,true);
        Mesh.bind(form,"keyup",checkField,true);
        Mesh.bind(form,"focus",checkField,true);
        Mesh.bind(form,"change",checkField,true);
        Mesh.bind(form,"click",bypassChecks,true);

        // Some browsers do not prevent form submission even
        // if checkValidity returns false. 
        // Fix this is unwanted bahaviour.
        Mesh.bind(form,"submit",function(e) {
            isSubmit = true;
            if (!noValidate && !form.checkValidity()) {
                Mesh.Util.Mesh.Util.preventActions(e);
            }
        }, false);

        // Apply custom validation if it is not supported 
        // natively by the browser.
        if (!Mesh.support.formValidation) {

            //console.log('Mesh.forms.validation: Native validation not supported.');

            form.checkValidity = function() { return checkValidity(form); };

            while (flen--) {
                isRequired = !!(f[flen].attributes["required"]);
                // Firefox includes fieldsets inside elements nodelist so we
                // filter it out.
                if (f[flen].nodeName !== "FIELDSET" &&
                    f[flen].nodeName !== "fieldset") {
                    validity(f[flen]); // Add validity object to field
                }
            }
        }
    };

    //
    // * @modified by dcarbone
    // * Instead of testing the value against a single regex (EITHER html5 OR pattern)
    // * 	the patterns are now put into a len = 2 array, with arr[0] being an HTML5 standard OR ""
    // * 	and arr[1] being the custom regex from the PATTERN attribute OR ""
    // *
    // * This enables us to have IE users validate against both the HTML5 standard AND their own.
    // *
    // * Also added in TEXT as a possible regex option, just for a little bit of continuity.
    // 
    validity = function(el) {
        var elem = el,
            missing = valueMissing(elem),
            attrs = {
                type: elem.getAttribute("type"),
                pattern: elem.getAttribute("pattern"),
                placeholder: elem.getAttribute("placeholder")
            },
            //fTests = new Array(((inputTypes.test(attrs.type)) ? attrs.type : ""), ((attrs.pattern) ? attrs.pattern : "")),
            //fTests = [(inputTypes.test(attrs.type)) ? attrs.type : "", (attrs.pattern) ? attrs.pattern : ""],
            patt = pattern(elem,fTests),
            step = range(elem,"step"),
            min = range(elem,"min"),
            max = range(elem,"max"),
            customError = (custMsg !== "");

        // setCustomValidity, checkValidity and validationMessage may be overridden
        // by the outside application, so we only set them if currently undefined.
        if (typeof elem.checkValidity == "undefined") {
            elem.checkValidity = function() { return checkValidity.call(this,elem); };
        }
        if (typeof elem.setCustomValidity == "undefined") {
            elem.setCustomValidity = function(msg) { setCustomValidity.call(elem,msg); };
        }
        if (typeof elem.validationMessage == "undefined") {
            elem.validationMessage = custMsg;
        }

        elem.validity = {
            valueMissing: missing,
            patternMismatch: patt,
            rangeUnderflow: min,
            rangeOverflow: max,
            stepMismatch: step,
            customError: customError,
            valid: (!missing && !patt && !step && !min && !max && !customError)
        };

        //console.log('Mesh.forms.validation: Check validity: ', elem.validity, elem.validationMessage)
        //console.log('Mesh.forms.validation: Check validationMessage: ', validationMessage)
        //console.log('Mesh.forms.validation: Validity: ', elem.name, elem.validity)

        if (attrs.placeholder && !validityEventTypes.test(curEvt)) {
            placeholder(elem);
        }
    };

    checkField = function (e) {
        var el = Mesh.Util.Mesh.Util.getTarget(e); // || e, // checkValidity method passes element not event
        checkForm = true;

        console.log('Mesh.forms.validation: Check field: Test: ', el, e) //.name, el.type

        if (nodes.test(el.nodeName) && !(ignoredCheckTypes.test(el.type) || ignoredCheckTypes.test(el.nodeName))) {
            curEvt = e.type;
            if (!Mesh.support.formValidation) {
                validity(el);
            }

            console.log('Mesh.forms.validation: Check Field: Result: ', el.name, curEvt, checkEvents) //, el.validationMessage, el.validity

            if (el.validity.valid == true || el.value == el.getAttribute("placeholder")) {
              console.log('Mesh.forms.validation: Check Field: Result: 1')
                Mesh.Util.Mesh.Util.removeClass(el,[args.invalidClass,args.requiredClass]);
                Mesh.Util.Mesh.Util.addClass(el,args.validClass);
            } 
            else if (checkEvents.test(curEvt)) {
              console.log('Mesh.forms.validation: Check Field: Result: 2')
                if (el.validity.valueMissing) {
                    Mesh.Util.Mesh.Util.removeClass(el,[args.invalidClass,args.validClass]);
                    Mesh.Util.Mesh.Util.addClass(el,args.requiredClass);
                }
                else if (!el.validity.valid) {
                    Mesh.Util.Mesh.Util.removeClass(el,[args.validClass,args.requiredClass]);
                    Mesh.Util.Mesh.Util.addClass(el,args.invalidClass);
                }
            }
            else if (el.validity.valueMissing) {
              console.log('Mesh.forms.validation: Check Field: Result: 3')
                Mesh.Util.Mesh.Util.removeClass(el,[args.requiredClass,args.invalidClass,args.validClass]);
            }
            if (curEvt === "input" && checkForm) {
              console.log('Mesh.forms.validation: Check Field: Result: 4')
                // If input is triggered remove the keyup event
                //Mesh.unbind(el.form,"keyup",checkField,true);
                checkForm = false;
            }
        }
    };

    checkValidity = function (el) {
        var f, ff, isRequired, hasPattern, invalid = false;

        if (el.nodeName === "FORM") {
            f = el.elements;

            //console.log('Mesh.forms.validation: Checking custom form validity', el);

            for(var i = 0,len = f.length;i < len;i++) {
                ff = f[i];

                isRequired = !!(ff.attributes["required"]);
                hasPattern = !!(ff.attributes["pattern"]);

                if (ff.nodeName !== "FIELDSET" && (isRequired || hasPattern && isRequired)) {
                    checkField(ff);
                    if (!ff.validity.valid && !invalid) {
                        if (isSubmit) { // If it's not a submit event the field shouldn't be focused
                            ff.focus();
                        }
                        invalid = true;
                    }
                }
            }
            return !invalid;
        } else {
            //console.log('Mesh.forms.validation: Checking custom field validity', el);

            checkField(el);
            return el.validity.valid;
        }
    };

    setCustomValidity = function(msg) {
        var el = this;
        custMsg = msg;

        el.validationMessage = custMsg;
    };

    //**
    // * @modified by dcarbone
    // * updated to accept new tests array
    // * Tests arr[0] (HTML5 standard) first.
    // *
    // * IF HTML5regex.test == FALSE THEN
    // * patternregex.test happens.
    //
    // Create helper methods to emulate attributes in older browsers
    pattern = function(el, tests) {
        if (tests[0] == "" && tests[1] == "") return false;

        var ret = null;

        switch(tests[0]) {
            case "email" :
                ret = !emailPatt.test(el.value);
                break;
            case "url" :
                ret = !urlPatt.test(el.value);
                break;
            default :
                ret = null;
        }

        var i = (Mesh.Util.hasClass(el, args.caseInsensitiveClass) ? "i" : "");

        if ((ret == false || ret == null) && tests[1] != "") {
            usrPatt = new RegExp('^(?:' + tests[1] + ')$', i);
            if (el.value == placeholder) {
                ret = true;
            } else if (el.value == "") {
                ret = false;
            } else {
                ret = !usrPatt.test(el.value);
            }
        }
        return ret;
    };

    placeholder = function(el) {
        var attrs = {
            placeholder: el.getAttribute("placeholder")
        },
        focus = /^(focus|focusin|submit)$/i,
        node = /^(input|textarea)$/i,
        ignoredType = /^password$/i,
        isNative = !!Mesh.support.placeholder;

        if (!isNative && node.test(el.nodeName) && !ignoredType.test(el.type)) {
            if (el.value === "" && !focus.test(curEvt)) {
                el.value = attrs.placeholder;
                Mesh.bind(el.form,'submit', function () {
                    curEvt = 'submit';
                    placeholder(el);
                }, true);
                Mesh.Util.Mesh.Util.addClass(el,args.placeholderClass);
                // //console.log('Mesh.forms.validation: Show placeholder');
            } else if (el.value === attrs.placeholder && focus.test(curEvt)) {
                el.value = "";
                Mesh.Util.Mesh.Util.removeClass(el,args.placeholderClass);
                // //console.log('Mesh.forms.validation: Hide placeholder');
            }
        }
    };

    range = function(el,type) {
        // Emulate min, max and step
        var min = parseInt(el.getAttribute("min"),10) || 0,
        max = parseInt(el.getAttribute("max"),10) || false,
        step = parseInt(el.getAttribute("step"),10) || 1,
        val = parseInt(el.value,10),
        mismatch = (val-min)%step;

        ////console.log('Mesh.forms.validation: Range: ', min, max, val, type)

        if (!valueMissing(el) && !isNaN(val)) {
            ////console.log('Mesh.forms.validation: Range: Value: ', type)

            switch(type) {
                case "step" :
                    return (el.getAttribute("step")) ? (mismatch !== 0) : false;
                    break;
                case "min" :
                    return (el.getAttribute("min")) ? (val < min) : false;
                    break;
                case "max" :
                    return (el.getAttribute("max")) ? (val > max) : false;
                    break;
            }
        } else if (el.getAttribute("type") == "number") {
            return true;
        } else {
            return false;
        }
    };

    required = function(el) {
        var required = !!(el.attributes["required"]);
        return (required) ? valueMissing(el) : false;
    };

    valueMissing = function(el) {
        var placeholder = el.getAttribute("placeholder"),
        isRequired = !!(el.attributes["required"]);
        return !!(isRequired && (el.value === "" || el.value == placeholder));
    };

    return {
        setup: setup,
        checkField: checkField
    }

})(document);
*/
/*
    mesh.fullscreen.js
    Polyfill for HTML5 fullscreen API  

    Copyright (c)2010 Sourcey
    http://sourcey.com
    Distributed under The MIT License.
*/


Mesh.support.fullscreen = false; // guilty until proven otherwise!


// Credit https://github.com/toji/game-shim  
(function(window, document) {
        
    // document.fullscreenEnabled
    if (!document.hasOwnProperty("fullscreenEnabled")) {
        getter = (function() {            
            // These are the functions that match the spec, 
            // and should be preferred
            if ("webkitIsFullScreen" in document) {
                Mesh.support.fullscreen = true;
                return function() { return document.webkitFullscreenEnabled; };
            }
            if ("mozFullScreenEnabled" in document) {
                Mesh.support.fullscreen = true;
                return function() { return document.mozFullScreenEnabled; };
            }

            return function() { return false; }; // not supported, never fullscreen
        })();
        
        Object.defineProperty(document, "fullscreenEnabled", {
            enumerable: true, configurable: false, writeable: false,
            get: getter
        });
    }

    // document.fullscreenElement
    if (!document.hasOwnProperty("fullscreenElement")) {
        getter = (function() {
            // These are the functions that match the spec, and should be preferred
            var i=0, name=["webkitCurrentFullScreenElement", "webkitFullscreenElement", "mozFullScreenElement"];
            for (; i<name.length; i++)
            {
                if (name[i] in document)
                {
                    return function() { return document[name[i]]; };
                }
            }
            return function() { return null; }; // not supported
        })();
        
        Object.defineProperty(document, "fullscreenElement", {
            enumerable: true, configurable: false, writeable: false,
            get: getter
        });
    }

    // Document event: fullscreenchange
    function fullscreenchange(oldEvent) {
        var newEvent = document.createEvent("CustomEvent");
        newEvent.initCustomEvent("fullscreenchange", true, false, null);
        // TODO: Any need for variable copy?
        document.dispatchEvent(newEvent);
    }
    document.addEventListener("webkitfullscreenchange", fullscreenchange, false);
    document.addEventListener("mozfullscreenchange", fullscreenchange, false);

    // Document event: fullscreenerror
    function fullscreenerror(oldEvent) {
        var newEvent = document.createEvent("CustomEvent");
        newEvent.initCustomEvent("fullscreenerror", true, false, null);
        // TODO: Any need for variable copy?
        document.dispatchEvent(newEvent);
    }
    document.addEventListener("webkitfullscreenerror", fullscreenerror, false);
    document.addEventListener("mozfullscreenerror", fullscreenerror, false);

    // element.requestFullScreen    
    var elementPrototype = (window.HTMLElement || window.Element)["prototype"];
    if (!elementPrototype.requestFullScreen) {
        elementPrototype.requestFullScreen = (function() {
            if (elementPrototype.webkitRequestFullScreen) {
                return function() {
                    this.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
                };
            }

            if (elementPrototype.mozRequestFullScreen) {
                return function() {
                    this.mozRequestFullScreen();
                };
            }
            
            return function(){ };
        })();
    }

    // document.cancelFullScreen
    if (!document.cancelFullScreen) {
        document.cancelFullScreen = (function() {
            return  document.webkitCancelFullScreen ||
                    document.mozCancelFullScreen ||
                    function(){};
        })();
    }
    
})(window, document);
/*
    Mesh.Geo.js
    
    HTML5 geolocation implementation
    Depends on JQuery for AJAX reverse lookup methods

    Copyright (c)2010 Sourcey
    http://sourcey.com
    Distributed under The MIT License.
*/


// Check support for HTML5 geolocation API 
Mesh.support.geolocation = (function() {
    return navigator.geolocation != 'undefined'
})();


Mesh.Geo = Mesh.Class.extend({
    init: function() {
        this.watchID = 0;
        this.history = []     // Array of obtained coordinates
        this.coords = null    // Last received coordinates JSON encoded by positionToJSON        
        this.error = null;    // Error object { code:*, message:* }  
        this.active = false;  // Returns true if geo tracking is active
        
        if (!Mesh.support.geolocation)
            setError(2, 
              'Geo location is not supported by your browser. ' + 
              'Please install the latest Chrome, Safari or Firefox browser.');
    },
    
    includes: Mesh.Mixin.Events,

    // Starts tracking and geolocation callbacks
    startTracking: function() {
        if (this.active) {
            console.log('GeoLocation: Already tracking');
            return;
        }        

        //
        // Begin listening for geolocation data in the API is avilable
        var self = this;
        if (navigator.geolocation) {
            if (this.watchID)
                navigator.geolocation.clearWatch(this.watchID);
            navigator.geolocation.getCurrentPosition(function(position) {
                self.active = true;
                self.onPosition(position);
                self.watchID = navigator.geolocation.watchPosition(function(position) {
                    // XXX: Chrome and maybe others will send duplicates of the
                    // last getCurrentPosition position inside the first
                    // watchPosition callback. Drop these duplicate positions.
                    if (self.history.length &&
                        self.history[self.history.length - 1].longitude == position.coords.longitude &&
                        self.history[self.history.length - 1].latitude == position.coords.latitude) {
                        console.log('GeoLocation: Dropping Duplicate Position');
                        return;
                    }
                    self.onPosition(position);
                })
            },
            function(error) {
                console.log('GeoLocation: Error: ', error);
                var message = ''
                switch(error.code) {
                    case error.TIMEOUT:
                        message = 'Geo location timed out.'
                        break;
                    case error.POSITION_UNAVAILABLE:
                        message = 'Geo location is currently unavailable.'
                        break;
                    case error.PERMISSION_DENIED:
                        message = 'Geo location permission denied by the remote party.'
                        break;
                    case error.UNKNOWN_ERROR:
                        message = 'Geo location is unavailable on this device.'
                        break;
                }
                self.setError(error.code, message);
            }//,
            // http://stackoverflow.com/questions/3397585/navigator-geolocation
            // -getcurrentposition-sometimes-works-sometimes-doesnt
            //{timeout:10000}
            //{
            //  maximumAge:Infinity,
            //  timeout:10000
            //}
            );
        }
    },

    // Starts tracking with test data
    startTestTracking: function(locations) {
        if (this.active) {
            console.log('GeoLocation: Already tracking');
            return;
        }
        
        console.log('GeoLocation: Start Test Tracking', this);

        // Sample data
        if (typeof locations != 'object') {
            locations = []
            locations.push([ -27.470933, 153.023502 ])
            locations.push([ -27.460933, 153.013502 ])
            locations.push([ -27.450933, 153.033502 ])
            locations.push([ -27.440933, 153.043502 ])
            locations.push([ -27.430933, 153.053502 ])
        }

        var self = this;
        var func = function(){
            if (locations.length) {
                var pos = locations.pop();
                self.coords = {
                    latitude: pos[0],
                    longitude: pos[1],
                    accuracy: 0,
                    altitude: 0,
                    altitudeAccuracy: 0,
                    timestamp: Math.round((new Date()).getTime() / 1000)
                };
                self.history.push(self.coords);
                console.log('GeoLocation: Test Tracking Timeout: ', self.coords);
                self.trigger('coords', self.coords);
            } else {
                console.log('GeoLocation: Test Tracking Ended');
                clearInterval(interval);
            }
        }
        this.active = true;
        var interval = setInterval(func, 3000);
        func();
    },

    // Stops tracking and geolocation callbacks
    // Does not clear local event delegates
    stopTracking: function() {
        this.error = null;
        this.active = false;
        this.history = [];
        
        // Clear the current geolocation callback
        if (navigator.geolocation && this.watchID)
            navigator.geolocation.clearWatch(this.watchID);
    },

    onPosition: function(position) {
        if (!this.active) {
            console.log('GeoLocation: Skipping Position: ', position, this.active);
            return;
        }

        var self = this;
        this.position = position;
        this.coords = self.positionToJSON(position);
        this.history.push(this.coords);
        console.log('GeoLocation: Position: ', position, this.coords);
        self.trigger('position', position);
        self.trigger('coords', this.coords);
    },

    setError: function(code, message) {
        this.error = {
            code: code,
            message: message
        };
        this.trigger('error', this.error);
    },

    positionToJSON: function(position) {
        if (!position) return {}
        return {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            timestamp: position.timestamp
            //heading: loc.coords.heading,
            //speed: loc.coords.speed
            //address: p.address,
        }
    },

    // Loads not-so-accurate fallback coordinates from google
    askGoogle: function(callback) {
        $.getScript('http://www.google.com/jsapi', function(data, textStatus) {
            if (textStatus == 'success') {
                callback({
                    latitude: google.loader.ClientLocation.latitude,
                    longitude: google.loader.ClientLocation.longitude
                },
                null);
            }
            else {
                callback(null, {
                    message: 'The server is unavailable' ,
                    code: 2
                });
            }
        });
    },
    
    // Reverse lookup the address for the current geo position
    getAddress: function(callback) {
        if (!this.coords ||
            !this.coords.latitude ||
            !this.coords.longitude) 
            throw 'Cannot get country without geolocation';
              
        return this.reverseLookup(this.coords.latitude, this.coords.longitude, callback);
    },
    
    // Do a reverse lookup for the given coordinates
    // Chain this method JQuery AJAX callbacks to handle response:
    // reverseLookup()
    //    .success(function(data) { alert("second success"); })
    //    .error(function() { alert("error"); })
    //    .complete(function() { alert("complete"); });
    reverseLookup: function(lat, lng, callback) {
        return $.getJSON("http://nominatim.openstreetmap.org/reverse?format=json&lat=" + lat + "&lon=" + lng + "&zoom=18&addressdetails=1")
            .success(function(data) { 
                if (callback)
                    callback(data, null);
            })
            .error(function() {
                if (callback)
                    callback(null, {
                        message: 'The server is unavailable' ,
                        code: 2
                    });
            })
    }
});




    /*
    //console.log('GPSMap: Reverse Lookup:', lng, lat);
        
    // Bind an event
    on: function(event, fn) {
        if (typeof this.delegates[event] == 'undefined')
            this.delegates[event] = [];
        if (typeof fn != 'undefined' && fn.constructor == Function)
            this.delegates[event].push(fn);
    },

    // Unbind an event
    off: function(event, fn) {
        if (typeof this.delegates[event] != 'undefined') {
            for (var i = 0; i < this.delegates[event].length; i++) {
                if (this.delegates[event][i] == fn) {
                    this.delegates[event].splice(i, 1);
                }
            }
        }
    },

    // trigger events to delegates
    trigger: function() {
        //console.log('triggering: ', arguments);
        var event = arguments[0];
        var args = Array.prototype.slice.call(arguments, 1);
        if (typeof this.delegates[event] != 'undefined') {
            for (var i = 0; i < this.delegates[event].length; i++) {
                //console.log('triggering: Function: ', this.delegates[event][i]);
                if (this.delegates[event][i].constructor == Function)
                    this.delegates[event][i].apply(this, args);
            }
        }
    },
    */
/*
    mesh.grid.js
    Javascript shivs for CSS table uncompliant browsers

    Copyright (c)2010 Sourcey
    http://sourcey.com
    Distributed under The MIT License.
*/

Mesh.support.cssTables = (function(){
    var elem = $('<div>',{
        css : {
            display: 'table',
            position: 'absolute',
            visibility: 'hidden'
        }
    }).appendTo(document.body || document.documentElement),
        support = ('table') === elem.css('display');
        elem.remove();
        return support;
})();


Mesh.extend('grid', {
//Mesh.grid = {
    init: function() {
        Mesh.grid.refresh();
        $(window).resize(function() {
            Mesh.grid.refresh();
        });
    },

    refresh: function() {

        if (Mesh.support.cssTables) {
            // Enable CSS fallback class for old browsers?
            return;
        }

        // Set the corrent container height.
        var layoutHeight = $('#container').height();
        if (!layoutHeight) return;
        //console.log('Layout Height', layoutHeight)

        // Ensure that all full height elements are just that.
        // This is only necessary for crappy browsers which don't
        // support CSS display: table properties.
        // NOTE: ystretch may be used on any element, not only table
        // propeties.
        $('.grid .column, .yfill, .ystretch').each(function() { //.grid .page,
            var element = $(this);
            //var oldHeight = element.height();

            // 0 height fixes slow downsizing in FF, test other browsers.
            // May need to remove element or create a placeholder?
            element.height(0);
            var newHeight = Math.min(
                layoutHeight,
                element.parent().height());
            //console.log('Element Starting Height', newHeight)
            if (element.siblings().length > 0) {
                element.siblings().each(function() {
                    var sibling = $(this);
                    newHeight -= sibling.height();
                });
            }
            //if (newHeight > layoutHeight) {
                //console.log('Defaulting to layout height')
                //newHeight = layoutHeight
            //}
            //console.log('Sidebar Height', $('.sidebar').height())
            //console.log('Element Height', oldHeight, newHeight)
            element.height(newHeight);
        });
    }

});
/*
    Mesh.History.js
    AJAX history for HTML4 & HTML5

    Copyright (c)2010 Sourcey
    http://sourcey.com
    Distributed under The MIT License.
*/


// Check support for HTML5 history API 
Mesh.support.pushState = (function() {
    return !!(window.history && history.pushState);
})();

// Check support for onhashchange event
Mesh.support.hashChange = (function() {
    return !!('onhashchange' in window);
})();


// The History API provides reliable cross borwser back and forward 
// button support using the HTML5 history API and fallback methods
// for older browsers. 
//
// The outside application must provide URL's encoded like so for 
// HTML5 complient clients: 
//    http://example.com/level1/level2/level3
// And for fallback legacy hashbang: 
//    http://example.com/#/level1/level2/level3
Mesh.History = {
  api: null, 
  
  init: function() {
      this.delegates = []
      if (!this.api) {
          if (Mesh.support.pushState)
            this.api = Mesh.History.HTML5;
          else if (Mesh.support.hashChange)
            this.api = Mesh.History.Hash;
          else
            this.api = Mesh.History.Legacy;    
      }  
      this.api.init()
  },
    
  path: window.location.pathname,
  
  onChange: function(fn) {
      this.delegates.push(fn);
  },
  
  triggerChange: function(path, event) {
      if (this.path == path) {
          console.log('Mesh.History: Page Change: Skipping:', path)
          return;
      }
      for (var i = 0; i < this.delegates.length; i++) {
          console.log('Mesh.History: Page Change: ', path, event)
          if (this.delegates[i].constructor == Function) {
              this.delegates[i].apply(this, arguments);
          }
      }
  }
}


// History API for browsers supporting HTML5 onpopstate event
Mesh.History.HTML5 = {
    name: 'HTML5',

    init: function() {
        console.log('Mesh.History.HTML5: init')
        
        // HTML5 History popState event
        var initialURL = location.href;
        window.onpopstate = function(event) {
            console.log('Mesh.History.HTML5: ', document.location, event)
            // Skip the initial unwanted popstate event on page load
            if (location.href == initialURL) {
                initialURL = null;
                console.log('Mesh.History.HTML5: Skip initial popstate')
                return;
            }
            initialURL = null;            
            Mesh.History.triggerChange(Mesh.History.HTML5.path(), event)
        };
    },
    
    path: function() {
        return window.location.pathname;
    }
}


// History API for browsers supporting onhashchange event
Mesh.History.Hash = {
    name: 'Hash',
    
    init: function() {
        console.log('Mesh.History.Hash: init')

        // Catch URL hash changes to update page
        // This enables the back button on supported browsers
        // TODO: Back button will be broken on upsupported browsers
        window.onhashchange = function(event) {
            var paths = Mesh.History.Hash.path();
            if (paths)
                Mesh.History.triggerChange(paths, event);
        };
    },
    
    // Returns the path from a hash formed
    // like so: #/level1/level2/level3
    path: function() {
        try {
            return '/' + window.location.href.split('#/', 2)[1];
        } catch (e) {}
        return undefined;
    }
}


// History API for legacy browsers and IE
Mesh.History.Legacy = {
    name: 'Legacy',
    
    init: function() {
        console.log('Mesh.History.Legacy: init')
    
        // Catch URL hash changes to update page
        // This enables the back button on supported browsers
        // TODO: Back button will be broken on upsupported browsers        
        var hash = window.location.hash;
        window.setInterval(function () {
           if (window.location.hash != hash) {
              hash = window.location.hash;
              var path = Mesh.History.Hash.path();
              if (path)
                  Mesh.History.triggerChange(path, event);
           }
        }, 100);
    }
}


// Initialize history API
//Mesh.loaders.history = function() {
//    Mesh.History.init();
//};
/*
    mesh.js
    HTML5 and CSS3 cross browser compatability framework

    Copyright (c)2010 Sourcey
    http://sourcey.com
    Distributed under The MIT License.
*/

var Mesh = { //(function(window, document) { //, undefined, $, 

    //return {

        // Initialize modules
        init: function() {
            var a,
            j = this.loaders;

            for (a in j) {
                j.hasOwnProperty(a) && j[a]();
            }
        },

        // Load methods are stored here
        // extend('loaders', func...
        loaders: {},

        /*
        // Mesh module extender
        extend: function(module, methods) {
            if (methods == null)
                return;

            console.log(module, methods)
            Mesh[module] = Mesh[module] || {};

            for (var method in methods)
                if (methods.hasOwnProperty(method))
                    Mesh[module][method] = methods[method];
        },
        */

        // Browser support and compatability checking methods
        support: {},

}
//)(this, this.document); //jQuery, 



//Mesh.Util = {}


// Tools & utilities namespace
// extend('util', func...
Mesh.Util = {
           
    extend: function (dest) { // (Object[, Object, ...]) ->
      var sources = Array.prototype.slice.call(arguments, 1),
          i, j, len, src;

      for (j = 0, len = sources.length; j < len; j++) {
        src = sources[j] || {};
        for (i in src) {
          if (src.hasOwnProperty(i)) {
            dest[i] = src[i];
          }
        }
      }
      return dest;
    },

    // Console logging for compatable browsers
    log: function() {
        if (typeof console != 'undefined')
            console.log(arguments)
            //console.log.apply(this, arguments)
    },

    isHostMethod: function(o, m) {
      var t = typeof o[m], reFeaturedMethod = new RegExp('^function|object$', 'i');
      return !!((reFeaturedMethod.test(t) && o[m]) || t === 'unknown');
    },            

    preventActions: function(e) {
      e = e || window.event;              
      if (e.stopPropagation && e.preventDefault) {
          e.stopPropagation();
          e.preventDefault();
      } else {
          e.cancelBubble = true;
          e.returnValue = false;
      }
    },

    getTarget: function(e) {
        e = e || window.event;
        return e.target || e.srcElement;
    },

    // Bind a browser event to the given node
    bind: function(node, type, fn, capture) {
        if (Mesh.Util.isHostMethod(window, "addEventListener")) {
            // FF & Other Browsers
            node.addEventListener(type, fn, capture );
        } 
        else if (Mesh.Util.isHostMethod(window, "attachEvent") && typeof window.event !== "undefined") {
            // Internet Explorer
            if (type == "blur") {
                type = "focusout";
            } else if (type == "focus") {
                type = "focusin";
            }
            node.attachEvent("on" + type, fn);
        }
    },

    // Unbind a browser event from the given node
    unbind: function(node, type, fn, capture) {
        if (Mesh.Util.isHostMethod(window, "removeEventListener")) {
            // FF & Other Browsers
            node.removeEventListener(type, fn, capture);
        } 
        else if (Mesh.Util.isHostMethod(window, "detachEvent") && typeof window.event !== "undefined") {
            // Internet Explorer
            node.detachEvent("on" + type, fn);
        }
    },
    
    
    addClass: function (e,c) {
        var re;
        if (!e.className) {
            e.className = c;
        }
        else {
            re = new RegExp('(^|\\s)' + c + '(\\s|$)');
            if (!re.test(e.className)) { e.className += ' ' + c; }
        }
    },

    removeClass: function (e,c) {
        var re, m, arr = (typeof c === "object") ? c.length : 1, len = arr;
        if (e.className) {
            if (e.className === c) {
                e.className = '';
            } else {
                while(arr--) {
                    re = new RegExp('(^|\\s)' + ((len > 1) ? c[arr] : c) + '(\\s|$)');
                    m = e.className.match(re);
                    if (m && m.length === 3) { e.className = e.className.replace(re, (m[1] && m[2])?' ':''); }
                }
            }
        }
    },
    
    testAttribute: function(element, attribute) {
       var field = document.createElement(element);
       return attribute in field;
    },
    
    hasClass: function(e,c) {
        var ret = false;
        if (!e.className) return false;
        else {
            var classes = e.className.split(" ");
            for (x in classes) {
                if (classes[x] == c) {
                    ret = true;
                    break;
                }
            }
        }
        return ret;
    }
};

// Shortcuts for most used utility functions
Mesh.extend = Mesh.Util.extend;
Mesh.bind = Mesh.Util.bind;
Mesh.unbind = Mesh.Util.unbind;