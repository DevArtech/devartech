(function(){

    var doc = document.documentElement;
    var w   = window;

    var curScroll;
    var prevScroll = w.scrollY || doc.scrollTop;
    var curDirection = 0;
    var prevDirection = 0;

    var header = document.getElementById('site-header');
    var toggled;
    var threshold = 200;

    var checkScroll = function() {
        curScroll = w.scrollY || doc.scrollTop;
        if(curScroll > prevScroll) {
            // scrolled down
            curDirection = 2;
        }
        else {
            //scrolled up
            curDirection = 1;
        }

        if(curDirection !== prevDirection) {
            toggled = toggleHeader();
        }

        prevScroll = curScroll;
        if(toggled) {
            prevDirection = curDirection;
        }
    };

    var toggleHeader = function() { 
        toggled = true;
        if(curDirection === 2 && curScroll > threshold) {
            header.classList.add('hide');
        }
        else if (curDirection === 1) {
            header.classList.remove('hide');
        }
        else {
            toggled = false;
        }
        return toggled;
    };

    window.addEventListener('scroll', checkScroll);

})();

$(window).load(function () {
    var in_view = new Waypoint.Inview({
        element: $('.res')[0],
        enter: function() {
            $('.res').addClass('start');
        },
    });

    var in_view = new Waypoint.Inview({
        element: $('.waitTillLoad1')[0],
        enter: function() {
            $('.waitTillLoad1').addClass('start');
        },
    });

    var in_view = new Waypoint.Inview({
        element: $('.aboutMe')[0],
        enter: function() {
            $('.aboutMe').addClass('start');
        },
    });

    var in_view = new Waypoint.Inview({
        element: $('.who')[0],
        enter: function() {
            $('.who').addClass('start');
        },
    });

    var in_view = new Waypoint.Inview({
        element: $('.waitTillLoad2')[0],
        enter: function() {
            $('.waitTillLoad2').addClass('start');
        },
    });

    var in_view = new Waypoint.Inview({
        element: $('.accordion')[0],
        enter: function() {
            $('.accordion').addClass('start');
        },
    });

    var in_view = new Waypoint.Inview({
        element: $('.icon')[0],
        enter: function() {
            $('.icon').addClass('start');
        },
    });

    var in_view = new Waypoint.Inview({
        element: $('.waitTillLoad3')[0],
        enter: function() {
            $('.waitTillLoad3').addClass('start');
        },
    });

    var in_view = new Waypoint.Inview({
        element: $('.quote')[0],
        enter: function() {
            $('.quote').addClass('start');
        },
    });

    var in_view = new Waypoint.Inview({
        element: $('.waitTillLoad4')[0],
        enter: function() {
            $('.waitTillLoad4').addClass('start');
        },
    });

    var in_view = new Waypoint.Inview({
        element: $('.ghR')[0],
        enter: function() {
            $('.ghR').addClass('start');
        },
    });

    var in_view = new Waypoint.Inview({
        element: $('.calendar')[0],
        enter: function() {
            $('.calendar').addClass('start');
        },
    });

    var in_view = new Waypoint.Inview({
        element: $('.left5')[0],
        enter: function() {
            $('.left5').addClass('start');
        },
    });

    var in_view = new Waypoint.Inview({
        element: $('.middle5')[0],
        enter: function() {
            $('.middle5').addClass('start');
        },
    });

    var in_view = new Waypoint.Inview({
        element: $('.right5')[0],
        enter: function() {
            $('.right5').addClass('start');
        },
    });

    var in_view = new Waypoint.Inview({
        element: $('.waitTillLoad5')[0],
        enter: function() {
            $('.waitTillLoad5').addClass('start');
        },
    });

    var in_view = new Waypoint.Inview({
        element: $('.itemText1')[0],
        enter: function() {
            $('.itemText1').addClass('start');
        },
    });

    var in_view = new Waypoint.Inview({
        element: $('.itemText2')[0],
        enter: function() {
            $('.itemText2').addClass('start');
        },
    });

    var in_view = new Waypoint.Inview({
        element: $('.itemText3')[0],
        enter: function() {
            $('.itemText3').addClass('start');
        },
    });

    var in_view = new Waypoint.Inview({
        element: $('.waitTillLoad6')[0],
        enter: function() {
            $('.waitTillLoad6').addClass('start');
        },
    });
});
