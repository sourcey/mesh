/*
    mesh.js
    HTML5 and CSS3 cross browser compatability framework

    Copyright (c)2010 Sourcey
    http://sourcey.com
    Distributed under The MIT License.
*/

var Mesh = (function($, window, document, undefined) {

    return {

        // Initialize modules
        init: function() {
            var a
            j = this.loaders;

            for (a in j) {
                j.hasOwnProperty(a) && j[a]();
            }
        },

        // Load methods are stored here
        // extend('loaders', func...
        loaders: {},

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

        // Browser sniffing and support
        support: {},

        // Console logging for compatable browsers
        log: function() {
            if (typeof console != 'undefined')
                console.log.apply(this, arguments)
        },

        // Tools & utilities namespace
        util: {
            
            isHostMethod: function(o, m) {
                var t = typeof o[m], reFeaturedMethod = new RegExp('^function|object$', 'i');
                return !!((reFeaturedMethod.test(t) && o[m]) || t == 'unknown');
            },            

            preventActions: function(evt) {
                evt = evt || window.event;

                if (evt.stopPropagation && evt.preventDefault) {
                    evt.stopPropagation();
                    evt.preventDefault();
                } else {
                    evt.cancelBubble = true;
                    evt.returnValue = false;
                }
            },

            getTarget: function(evt) {
                evt = evt || window.event;
                return evt.target || evt.srcElement;
            }
        },

        // Bind a browser event to the given node
        bind: function(node, type, fn, capture) {
            if (Mesh.util.isHostMethod(window, "addEventListener")) {
                // FF & Other Browsers
                node.addEventListener(type, fn, capture );
            } 
            else if (Mesh.util.isHostMethod(window, "attachEvent") && typeof window.event !== "undefined") {
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
            if (Mesh.util.isHostMethod(window,"removeEventListener")) {
                // FF & Other Browsers
                node.removeEventListener(type, fn, capture);
            } 
            else if (Mesh.util.isHostMethod(window,"detachEvent") && typeof window.event !== "undefined") {
                // Internet Explorer
                node.detachEvent("on" + type, fn);
            }
        }
    };
})(jQuery, this, this.document);