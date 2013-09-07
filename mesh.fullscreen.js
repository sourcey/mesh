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