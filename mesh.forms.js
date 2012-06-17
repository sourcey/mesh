/*
    mesh.forms.js
    Degradable HTML5 and CSS3 forms

    Copyright (c)2010 Sourcey
    http://sourcey.com
    Distributed under The MIT License.
*/

Mesh.extend('util', {
    
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
    },

    addClass: function (e,c) {
        var re;
        if (!e.className) {
            e.className = c;
        }
        else {
            re = new RegExp("("+c+")" , "i");
            if (!re.test(e.className)) {
                e.className += ' ' + c;
            }
        }
    },

    removeClass: function (e,c) {
        var re, m, arr = (typeof c === "object") ? c.length : 1, len = arr;
        if (e.className) {
            if (e.className == c) {
                e.className = '';
            }
            else {
                while(arr--) {
                    re = new RegExp('(^|\\s)' + ((len > 1) ? c[arr] : c) + '(\\s|$)');
                    m = e.className.match(re);
                    if (m && m.length == 3) {
                        e.className = e.className.replace(re, (m[1] && m[2])?' ':'');
                    }
                }
            }
        }
    }
});


Mesh.support.formValidation = (function() {
    var field = document.createElement('input');
    //return 'validity' in field && 'checkValidity' in field;
    return (Mesh.util.isHostMethod(field,"validity") && Mesh.util.isHostMethod(field,"checkValidity")); // false; //
})();

Mesh.support.placeholder = (function(){
    return 'placeholder' in document.createElement('input');
})();

Mesh.support.autofocus = (function(){
    return 'autofocus' in document.createElement('input');
})();


// Mesh.loaders.validation
Mesh.loaders.validation = function() {
    var forms = [];
    $('form.validate').each(function() {
        forms.push(this);
    })
    //Mesh.log('Mesh Loading: Validation: ', forms.length)
    if (forms)
        Mesh.forms.validation.setup(forms);
};


// Mesh.loaders.autofocus
Mesh.loaders.autofocus = function() {
    //Mesh.log('Mesh Loading: Autofocus: ', Mesh.support.autofocus)
    if (Mesh.support.autofocus || !$(':input[autofocus]').length) {
        return;
    }

    $(':input[autofocus]:visible:first').focus();
};


// Modified version of the January 13 2012 release of Ryan Seddon's h5f.js
Mesh.forms = Mesh.forms || {}
Mesh.forms.validation = (function(d){

    var emailPatt = /^[a-zA-Z0-9.!#$%&'*+-\/=?\^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
        urlPatt = /[a-z][\-\.+a-z]*:\/\//i,
        nodes = /^(input|select|textarea)$/i,
        inputTypes = /^(email|url)$/i,
        validityEventTypes = /^(input|keyup)$/i,
        checkEvents = /^(input|keyup|focusin|focus)$/i,
        ignoredCheckTypes = /^(submit|image|button|reset)$/i,
        isSubmit, usrPatt, curEvt, args, custMsg = "",

    // Methods
    setup, validation, validity, checkField, checkValidity, setCustomValidity, pattern, placeholder, range, required, valueMissing; //support, , Mesh.bind, Mesh.unbind, Mesh.util.preventActions, Mesh.util.getTarget, Mesh.util.addClass, Mesh.util.removeClass, Mesh.util.hasClass, Mesh.util.isHostMethod;

    //
    // Public Methods
    //
    setup = function(form, settings) {
        var isCollection = !form.nodeType || false;

        var defaults = {
            validClass : "valid",
            invalidClass : "error",
            requiredClass : "required",
            placeholderClass : "placeholder",
            caseInsensitiveClass : "insensitive"
        };

        if (typeof settings == "object") {
            for (var i in defaults) {
                if (typeof settings[i] == "undefined") {
                    settings[i] = defaults[i];
                }
            }
        }

        args = settings || defaults;

        if (isCollection) {
            for (var k=0,len=form.length;k<len;k++) {
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

        //Mesh.log('Mesh.forms.validation: ', form);

        Mesh.bind(form,"invalid",checkField,true);
        Mesh.bind(form,"blur",checkField,true);
        Mesh.bind(form,"input",checkField,true);
        Mesh.bind(form,"keyup",checkField,true);
        Mesh.bind(form,"focus",checkField,true);

        // Some browsers do not prevent for submission even if checkValidity
        // returns false. This is unwanted bahaviour.
        Mesh.bind(form,"submit",function(e) {
            isSubmit = true;
            if (!noValidate && !form.checkValidity()) {
                Mesh.util.preventActions(e);
            }
        }, false);

        // Apply custom validation if it is not supported natively by the browser.
        if (!Mesh.support.formValidation) {

            //Mesh.log('Mesh.forms.validation: Native validation not supported.');

            form.checkValidity = function() {
                return checkValidity(form);
            };

            while (flen--) {
                isRequired = !!(f[flen].attributes["required"]);
                // Firefox includes fieldsets inside elements nodelist so we
                // filter it out.
                if(f[flen].nodeName !== "FIELDSET") {
                    validity(f[flen]); // Add validity object to field
                }
            }
        }
    };

    /**
     * @modified by dcarbone
     * Instead of testing the value against a single regex (EITHER html5 OR pattern)
     * 	the patterns are now put into a len = 2 array, with arr[0] being an HTML5 standard OR ""
     * 	and arr[1] being the custom regex from the PATTERN attribute OR ""
     *
     * This enables us to have IE users validate against both the HTML5 standard AND their own.
     *
     * Also added in TEXT as a possible regex option, just for a little bit of continuity.
     */
    validity = function(el) {
        var elem = el,
            missing = valueMissing(elem),
            attrs = {
                type: elem.getAttribute("type"),
                pattern: elem.getAttribute("pattern"),
                placeholder: elem.getAttribute("placeholder")
            },
            //fTests = new Array(((inputTypes.test(attrs.type)) ? attrs.type : ""), ((attrs.pattern) ? attrs.pattern : "")),
            fTests = [(inputTypes.test(attrs.type)) ? attrs.type : "", (attrs.pattern) ? attrs.pattern : ""],
            patt = pattern(elem,fTests),
            step = range(elem,"step"),
            min = range(elem,"min"),
            max = range(elem,"max"),
            customError = (custMsg !== "");

        // setCustomValidity, checkValidity and validationMessage may be overridden
        // by the outside application, so we only set them if currently undefined.
        //if (typeof elem.checkValidity == "undefined") {
            elem.checkValidity = function() { return checkValidity.call(this,elem); };
        //}
        if (typeof elem.setCustomValidity == "undefined") {
            elem.setCustomValidity = function(msg) { setCustomValidity.call(elem,msg); };
        }
        //if (typeof elem.validationMessage == "undefined") {
            elem.validationMessage = custMsg;
        //}

        elem.validity = {
            valueMissing: missing,
            patternMismatch: patt,
            rangeUnderflow: min,
            rangeOverflow: max,
            stepMismatch: step,
            customError: customError,
            valid: (!missing && !patt && !step && !min && !max && !customError)
        };

        ////Mesh.log('Mesh.forms.validation: Check validity: ', elem.validity, elem.validationMessage)
        ////Mesh.log('Mesh.forms.validation: Check validationMessage: ', validationMessage)
        //Mesh.log('Mesh.forms.validation: Validity: ', elem.name, elem.validity)

        if (attrs.placeholder && !validityEventTypes.test(curEvt)) {
            placeholder(elem);
        }
    };

    checkField = function (e) {
        var el = Mesh.util.getTarget(e) || e, // checkValidity method passes element not event
        checkForm = true;

        //Mesh.log('Mesh.forms.validation: Test check field: ', el.nodeName, el.type)

        if (nodes.test(el.nodeName) && !(ignoredCheckTypes.test(el.type) || ignoredCheckTypes.test(el.nodeName))) {
            curEvt = e.type;
            if (!Mesh.support.formValidation) {
                validity(el);
            }

            //Mesh.log('Mesh.forms.validation: Check Field: ', el.name, curEvt, el.validity.valid)

            if (el.validity.valid == true || el.value == el.getAttribute("placeholder")) {
                Mesh.util.removeClass(el,[args.invalidClass,args.requiredClass]);
                Mesh.util.addClass(el,args.validClass);
            } 
            else if (checkEvents.test(curEvt)) {
                if (el.validity.valueMissing) {
                    Mesh.util.removeClass(el,[args.invalidClass,args.validClass]);
                    Mesh.util.addClass(el,args.requiredClass);
                }
                else if (!el.validity.valid) {
                    Mesh.util.removeClass(el,[args.validClass,args.requiredClass]);
                    Mesh.util.addClass(el,args.invalidClass);
                }
            }
            else if (el.validity.valueMissing) {
                Mesh.util.removeClass(el,[args.requiredClass,args.invalidClass,args.validClass]);
            }
            if (curEvt === "input" && checkForm) {
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

            //Mesh.log('Mesh.forms.validation: Checking custom form validity', el);

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
            //Mesh.log('Mesh.forms.validation: Checking custom field validity', el);

            checkField(el);
            return el.validity.valid;
        }
    };

    setCustomValidity = function(msg) {
        var el = this;
        custMsg = msg;

        el.validationMessage = custMsg;
    };

    /**
     * @modified by dcarbone
     * updated to accept new tests array
     * Tests arr[0] (HTML5 standard) first.
     *
     * IF HTML5regex.test == FALSE THEN
     * patternregex.test happens.
     */
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
            } else if(el.value == "") {
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
                Mesh.util.addClass(el,args.placeholderClass);
                // //Mesh.log('Mesh.forms.validation: Show placeholder');
            } else if(el.value === attrs.placeholder && focus.test(curEvt)) {
                el.value = "";
                Mesh.util.removeClass(el,args.placeholderClass);
                // //Mesh.log('Mesh.forms.validation: Hide placeholder');
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

        ////Mesh.log('Mesh.forms.validation: Range: ', min, max, val, type)

        if (!valueMissing(el) && !isNaN(val)) {
            ////Mesh.log('Mesh.forms.validation: Range: Value: ', type)

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
        } else if(el.getAttribute("type") == "number") {
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