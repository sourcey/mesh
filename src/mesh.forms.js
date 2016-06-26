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
    for (var i = 0; i < formsCollection.length; i++) {
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
    for (var i = 0; i < forms.length; i++) {
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
Mesh.forms.forceValidation = true; //false; // Set true to override native validation.
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
            for (var i = 0; i < form.length; i++) {
            // for(var k = 0, len = form.length; k < len; k++) {
                validation(form[i]);
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
            // If checkValidity is undefined we use our polyfill.
            if (typeof form.checkValidity == "undefined")
                form.checkValidity = function() { return checkValidity(form); };

            while(flen--) {
                isRequired = !!(f[flen].attributes["required"]);
                // Firefox includes fieldsets inside elements nodelist so we filter them out.
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

        // If checkValidity is undefined we use our polyfill.
        if (typeof elem.checkValidity == "undefined") {
            elem.checkValidity = function() { return checkValidity.call(this, elem); };
            elem.setCustomValidity = function(msg) { setCustomValidity.call(elem, msg); };
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
                console.log('valid')
                Mesh.Util.removeClass(el,[args.invalidClass,args.requiredClass]);
                Mesh.Util.addClass(el,args.validClass);
            } else if (!events.test(curEvt)) {
                if (el.validity.valueMissing) {
                    console.log('invalid missing')
                    Mesh.Util.removeClass(el,[args.invalidClass,args.validClass]);
                    Mesh.Util.addClass(el,args.requiredClass);
                } else if (!el.validity.valid) {
                    console.log('invalid')
                    Mesh.Util.removeClass(el,[args.validClass,args.requiredClass]);
                    Mesh.Util.addClass(el,args.invalidClass);
                }
            } else if (el.validity.valueMissing) {
                console.log('missing')
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
