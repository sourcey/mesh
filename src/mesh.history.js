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
      //if (window.location.pathname == path) {
      //    console.log('Mesh.History: Page Change: Skipping same path:', path)
      //    return;
      //}
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
            //if (window.location.href == initialURL) {
            //    initialURL = null;
            //    console.log('Mesh.History.HTML5: Skip initial popstate')
            //    return;
            //}
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