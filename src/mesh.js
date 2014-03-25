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