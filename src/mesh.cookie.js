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