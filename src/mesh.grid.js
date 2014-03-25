/*
    mesh.grid.js
    Javascript shivs for CSS table uncompliant browsers

    Copyright (c)2010 Sourcey
    http://sourcey.com
    Distributed under The MIT License.
*/

Mesh.support.cssTables = (function(){
    var elem = $('<div>',{
        css : {
            display: 'table',
            position: 'absolute',
            visibility: 'hidden'
        }
    }).appendTo(document.body || document.documentElement),
        support = ('table') === elem.css('display');
        elem.remove();
        return support;
})();


Mesh.extend('grid', {
//Mesh.grid = {
    init: function() {
        Mesh.grid.refresh();
        $(window).resize(function() {
            Mesh.grid.refresh();
        });
    },

    refresh: function() {

        if (Mesh.support.cssTables) {
            // Enable CSS fallback class for old browsers?
            return;
        }

        // Set the corrent container height.
        var layoutHeight = $('#container').height();
        if (!layoutHeight) return;
        //console.log('Layout Height', layoutHeight)

        // Ensure that all full height elements are just that.
        // This is only necessary for crappy browsers which don't
        // support CSS display: table properties.
        // NOTE: ystretch may be used on any element, not only table
        // propeties.
        $('.grid .column, .yfill, .ystretch').each(function() { //.grid .page,
            var element = $(this);
            //var oldHeight = element.height();

            // 0 height fixes slow downsizing in FF, test other browsers.
            // May need to remove element or create a placeholder?
            element.height(0);
            var newHeight = Math.min(
                layoutHeight,
                element.parent().height());
            //console.log('Element Starting Height', newHeight)
            if (element.siblings().length > 0) {
                element.siblings().each(function() {
                    var sibling = $(this);
                    newHeight -= sibling.height();
                });
            }
            //if (newHeight > layoutHeight) {
                //console.log('Defaulting to layout height')
                //newHeight = layoutHeight
            //}
            //console.log('Sidebar Height', $('.sidebar').height())
            //console.log('Element Height', oldHeight, newHeight)
            element.height(newHeight);
        });
    }

});