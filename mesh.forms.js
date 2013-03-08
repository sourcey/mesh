/*
    mesh.forms.js
    Degradable HTML5 and CSS3 forms

    Copyright (c)2010 Sourcey
    http://sourcey.com
    Distributed under The MIT License.
*/


Mesh.extend('util', {
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
});


// Check support for native HTML5 form validation
Mesh.support.formValidation = (function() {
    var field = document.createElement('input');
    return (Mesh.util.isHostMethod(field,"validity") && Mesh.util.isHostMethod(field,"checkValidity"));
})();

// Check support for HTML5 form placeholders
Mesh.support.placeholder = (function(){
    return Mesh.util.testAttribute('input', 'placeholder');
})();

// Check support for HTML5 form autofocus
Mesh.support.autofocus = (function(){
    return Mesh.util.testAttribute('input', 'autofocus');
})();


// Initialize form validation for all forms with the 'validate' class
Mesh.loaders.validation = function() {
    var forms = [];
    var formsCollection = document.getElementsByTagName("form");
    for (var i=0;i<formsCollection.length;i++) {
      if (Mesh.util.hasClass(formsCollection[i], 'validate'))
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
        //, listen, Mesh.util.unbind, Mesh.util.preventActions, Mesh.util.getTarget, Mesh.util.addClass, Mesh.util.removeClass, Mesh.util.isHostMethod;
    
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
                    Mesh.util.preventActions(e);
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
            
        var el = Mesh.util.getTarget(e) || e, // checkValidity method passes element not event
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
                Mesh.util.removeClass(el,[args.invalidClass,args.requiredClass]);
                Mesh.util.addClass(el,args.validClass);
            } else if (!events.test(curEvt)) {        
                if (el.validity.valueMissing) {
                    Mesh.util.removeClass(el,[args.invalidClass,args.validClass]);
                    Mesh.util.addClass(el,args.requiredClass);
                } else if (!el.validity.valid) {
                    Mesh.util.removeClass(el,[args.validClass,args.requiredClass]);
                    Mesh.util.addClass(el,args.invalidClass);
                }
            } else if (el.validity.valueMissing) {
                Mesh.util.removeClass(el,[args.requiredClass,args.invalidClass,args.validClass]);
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
        var el = Mesh.util.getTarget(e);

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
                Mesh.util.addClass(el,args.placeholderClass);
            } else if (el.value === attrs.placeholder && focus.test(curEvt)) {
                el.value = "";
                Mesh.util.removeClass(el,args.placeholderClass);
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
    //support, , Mesh.bind, Mesh.unbind, Mesh.util.Mesh.util.preventActions, Mesh.util.Mesh.util.getTarget, Mesh.util.Mesh.util.addClass, Mesh.util.Mesh.util.removeClass,  Mesh.util.hasClass, Mesh.util.isHostMethod;

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
                Mesh.util.Mesh.util.preventActions(e);
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
        var el = Mesh.util.Mesh.util.getTarget(e); // || e, // checkValidity method passes element not event
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
                Mesh.util.Mesh.util.removeClass(el,[args.invalidClass,args.requiredClass]);
                Mesh.util.Mesh.util.addClass(el,args.validClass);
            } 
            else if (checkEvents.test(curEvt)) {
              console.log('Mesh.forms.validation: Check Field: Result: 2')
                if (el.validity.valueMissing) {
                    Mesh.util.Mesh.util.removeClass(el,[args.invalidClass,args.validClass]);
                    Mesh.util.Mesh.util.addClass(el,args.requiredClass);
                }
                else if (!el.validity.valid) {
                    Mesh.util.Mesh.util.removeClass(el,[args.validClass,args.requiredClass]);
                    Mesh.util.Mesh.util.addClass(el,args.invalidClass);
                }
            }
            else if (el.validity.valueMissing) {
              console.log('Mesh.forms.validation: Check Field: Result: 3')
                Mesh.util.Mesh.util.removeClass(el,[args.requiredClass,args.invalidClass,args.validClass]);
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

        var i = (Mesh.util.hasClass(el, args.caseInsensitiveClass) ? "i" : "");

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
                Mesh.util.Mesh.util.addClass(el,args.placeholderClass);
                // //console.log('Mesh.forms.validation: Show placeholder');
            } else if (el.value === attrs.placeholder && focus.test(curEvt)) {
                el.value = "";
                Mesh.util.Mesh.util.removeClass(el,args.placeholderClass);
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