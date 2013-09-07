/*
    Mesh.History.js
    Browser detector based on http://www.quirksmode.org/js/detect.html

    Copyright (c)2010 Sourcey
    http://sourcey.com
    Distributed under The MIT License.
*/


Mesh.Browser = {
	init: function() {
		this.browser = this.searchString(this.dataBrowser) || "Unknown";
		this.version = this.searchVersion(navigator.userAgent)
			|| this.searchVersion(navigator.appVersion) || 0;
		this.OS = this.searchString(this.dataOS) || "Unknown";
	},
	searchString: function(data) {
		for (var i=0;i<data.length;i++)	{
			var dataString = data[i].string;
			var dataProp = data[i].prop;
			this.versionSearchString = data[i].versionSearch || data[i].identity;
			if (dataString) {
				if (dataString.indexOf(data[i].subString) != -1)
					return data[i].identity;
			}
			else if (dataProp)
				return data[i].identity;
		}
	},
	searchVersion: function(dataString) {
		var index = dataString.indexOf(this.versionSearchString);
		if (index == -1) return;
		return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
	},
	dataBrowser: [
		{
			string: navigator.userAgent,
			subString: "Chrome",
			identity: "Chrome"
		},
		{ 	
		  string: navigator.userAgent,
			subString: "OmniWeb",
			versionSearch: "OmniWeb/",
			identity: "OmniWeb"
		},
		{
			string: navigator.vendor,
			subString: "Apple",
			identity: "Safari",
			versionSearch: "Version"
		},
		{
			prop: window.opera,
			identity: "Opera",
			versionSearch: "Version"
		},
		{
			string: navigator.vendor,
			subString: "iCab",
			identity: "iCab"
		},
		{
			string: navigator.vendor,
			subString: "KDE",
			identity: "Konqueror"
		},
		{
			string: navigator.userAgent,
			subString: "Firefox",
			identity: "Firefox"
		},
		{
			string: navigator.vendor,
			subString: "Camino",
			identity: "Camino"
		},
		{		// for newer Netscapes (6+)
			string: navigator.userAgent,
			subString: "Netscape",
			identity: "Netscape"
		},
		{
			string: navigator.userAgent,
			subString: "MSIE",
			identity: "Explorer",
			versionSearch: "MSIE"
		},
		{
			string: navigator.userAgent,
			subString: "Gecko",
			identity: "Mozilla",
			versionSearch: "rv"
		},
		{ 		// for older Netscapes (4-)
			string: navigator.userAgent,
			subString: "Mozilla",
			identity: "Netscape",
			versionSearch: "Mozilla"
		}
	],
	dataOS : [
		{
			string: navigator.platform,
			subString: "Win",
			identity: "Windows"
		},
		{
			string: navigator.platform,
			subString: "Mac",
			identity: "Mac"
		},
		{
       string: navigator.platform,
       subString: "iPhone",
       identity: "iPhone/iPod"
	  },
		{
       string: navigator.platform,
       subString: "iPad",
       identity: "iPad"
	  },
		{
			string: navigator.platform,
			subString: "Linux",
			identity: "Linux"
		}
	]
};


Mesh.Browser.Classify = {
	init: function() {
    if (!Mesh.Browser.browser)
        Mesh.Browser.init();
    var browser = Mesh.Browser.browser.toLowerCase();
    var extra;
    switch (browser) {
        case 'explorer':
            browser = 'ie'            
            switch (Mesh.Browser.version) {
                case 12: // future compatability
                case 11:
                case 10:
                    extra = 'lte10'
                    break;
                case 9:
                    extra = 'lte10 lte9'
                    break;
                case 8:
                    extra = 'lte10 lte9 lte8'
                    break;
                case 7:
                    extra = 'lte10 lte9 lte8 lte7'
                    break;                  
                default: 
                    extra = 'lte10 lte9 lte8 lte7 lte6'
                    break;      
            }
            break;
        case 'firefox':
            browser = 'ff'
            break;
    }
    classes = browser + ' ' + browser + Mesh.Browser.version;
    if (extra)
        classes += ' ' + extra;
    Mesh.Util.addClass(document.body, classes);
    //alert("Mesh.Browser.Class: " + classes)    
	}
}