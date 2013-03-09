/*
    Mesh.Geo.js
    HTML5 geolocation implementation

    Copyright (c)2010 Sourcey
    http://sourcey.com
    Distributed under The MIT License.
*/


// Check support for HTML5 geolocation API 
Mesh.support.geolocation = (function() {
    return navigator.geolocation != 'undefined'
})();


Mesh.Geo = {
    init: function() {
        this.watchID = 0;        
        this.delegates = {}   // Event delegates
        this.history = []     // Array of obtained coordinates
        this.coords = null    // Last received coordinates JSON encoded by positionToJSON        
        this.error = null;    // Error object { code:*, message:* }  
        this.active = false;  // Returns true if geo tracking is active
        
        if (!Mesh.support.geolocation)
            setError(2, 
              'Geo location is not supported by your browser. ' + 
              'Please install the latest Chrome, Safari or Firefox browser.');
    },

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
        
        console.log('GeoLocation: Start Test Tracking');

        // Sample data
        if (typeof locations != 'object') {
            locations = []
            locations.push([ 153.023502, -27.470933 ])
            locations.push([ 153.023502, -27.460933 ])
            locations.push([ 153.023502, -27.450933 ])
            locations.push([ 153.023502, -27.440933 ])
            locations.push([ 153.023502, -27.430933 ])
        }

        var self = this;
        var func = function(){
            if (locations.length) {
                var pos = locations.pop();
                coords = {
                    longitude: pos[0],
                    latitude: pos[1],
                    accuracy: 0,
                    altitude: 0,
                    altitudeAccuracy: 0,
                    timestamp: Math.round((new Date()).getTime() / 1000)
                };
                self.history.push(coords);
                console.log('GeoLocation: Test Tracking Timeout: ', coords);
                self.dispatch('coords', coords);
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

    onPosition: function(position) {
        if (!this.active) {
            console.log('GeoLocation: Skipping Position: ', position, this.active);
            return;
        }

        var self = this;
        //setTimeout(function () {
        this.position = position;
        this.coords = self.positionToJSON(position);
        this.history.push(this.coords);
        console.log('GeoLocation: Position: ', position, this.coords);
        self.dispatch('position', position);
        self.dispatch('coords', this.coords);
        //}, 0);
    },

    setError: function(code, message) {
        this.error = {
            code: code,
            message: message
        };
        this.dispatch('error', this.error);
    },

    positionToJSON: function(position) {
        if (!position) return {}
        return {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            timestamp: position.timestamp
        //heading: loc.coords.heading,
        //speed: loc.coords.speed
        //address: p.address,
        }
    },

    // Loads not-so-accurate coordinates from google as a fallback.
    askGoogle: function(callback) {
        $.getScript('http://www.google.com/jsapi', function(data, textStatus, jqxhr) {
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

    // Dispatch events to delegates
    dispatch: function() {
        //console.log('Dispatching: ', arguments);
        var event = arguments[0];
        var args = Array.prototype.slice.call(arguments, 1);
        if (typeof this.delegates[event] != 'undefined') {
            for (var i = 0; i < this.delegates[event].length; i++) {
                //console.log('Dispatching: Function: ', this.delegates[event][i]);
                if (this.delegates[event][i].constructor == Function)
                    this.delegates[event][i].apply(this, args);
            }
        }
    }
};


// Initialize geolocation API
//Mesh.loaders.geo = function() {
//    Mesh.Geo.init();
//};