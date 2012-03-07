/*
    mesh.js
    HTML5 and CSS3 cross browser compatability framework

    Copyright (c)2010 Sourcey
    http://sourcey.com
    Distributed under The MIT License.
*/

var Mesh = (function($, window, document, undefined) {

    // Private constants.

    return {

        // Mesh.init
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

        // Tools namespace
        util: {},

        // Browser sniffing and support
        support: {},

        // Mesh module extender
        extend: function(module, methods) {
            if (methods == null)
                return;

            console.log(module, methods)
            Mesh[module] = Mesh[module] || {};

            for (var method in methods)
                if (methods.hasOwnProperty(method))
                    Mesh[module][method] = methods[method];
        }

    };
})(jQuery, this, this.document);