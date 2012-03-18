
var controls = function(){
    var Public = {},
        _      = {}; //privates

    _.user     = {
		animateTilt : function(){},
		animateZoom : function(){}
	};
    _.state    = null; // global state

    _.controlConfig = [{domId: "tilt-up",
                        direction : 1,
                        callback  : "startTilting"},
                       {domId: "tilt-down",
                        direction : -1,
                        callback  : "startTilting"}/*,
                       {domId: "zoom-in",
                        direction : 1,
                        callback  : "startZooming"},
                       {domId: "zoom-out",
                        direction : -1,
                        callback  : "startZooming"}*/];
    _.controls = [];


    _.calculateDirection = function(evt) {
        var absY = evt.clientY;

        var zoomControl = $("#zoomControls");
        var height = parseInt(zoomControl.css("height"), 10);
        var offsetY = zoomControl.offset().top; var relY    = absY - offsetY;
        var direction = Math.min(2, (1-relY/(height/2)));
        return direction; 
    };
	
	/****************************
	* #### KINECT CODE
	*
	* Zoom and tilt
	*****************************/
	//both hands extended position
	kinect.addEventListener('gestureCrank_ON', function( args ) {
		window.bothHands = true;	//save it globally ( should not add properties to the window object but works swiftly )
		_.user.animateHeading(0);
		return false;
	})
	.addEventListener('gestureCrank_OFF', function( args ) {
		window.bothHands = false;
		return false;
	})
	//runs once per joints socket message
	.onMessage( function( args ) {
		//if both hands are extended
		if( window.bothHands )
		{
			var hands_dist = this.coords[ 0 ][ 3 ];
			/*** ZOOM ***/
			//and their y-axis (room height) distance is small
			if(  Math.abs( hands_dist.y ) < 8 && Math.abs( hands_dist.x ) > 3 )
			{
				_.user.animateTilt( 0 );	//default tilt
				//and they are close together in the x-axis (room width)
				if( hands_dist.x < -32 )
				{	//zoom in
					_.user.animateZoom( hands_dist.x * ( 0.01 * 1.3 ));
				}
				//else if they are far from one another
				else if( hands_dist.x > -28 )
				{	//zoom out
					_.user.animateZoom( ( 50 + hands_dist.x ) * ( 0.01 * 2.5 ) );
				}
				else //no zoom
					_.user.animateZoom( 0 );
			}
			/*** TILT ***/
			//else if they hands are really close in the X axis
			else if( Math.abs( hands_dist.x ) < 14 )
			{	//but not in the Y axis
				_.user.animateZoom( 0 );	//default zoom
				if( Math.abs( hands_dist.y ) > 30 )
				{
					_.user.animateTilt( -0.456 );
				}
				else if( Math.abs( hands_dist.y ) < 27 )
				{
					_.user.animateTilt( 0.476 );
				}
				else
					_.user.animateTilt( 0 );
			}
			/*** DEFAULT (none) ***/
			else
			{
				_.user.animateTilt( 0 );
				_.user.animateZoom( 0 );
			}
		}
		else
		{
			_.user.animateTilt( 0 );
			_.user.animateZoom( 0 );
		}
	});
	/************** END OF KINECT ******************/
	
	
    //TODO: allthis is very ugly.. needs cleanup and refactoring to be more
    //generic
    _.startZooming = function(evt) {
        var direction = _.calculateDirection(evt);
        _.highlightZoom(direction);
		console.log( direction );
        _.user.animateZoom(direction);
        if (_.state)
            _.state.pressed = true;
    };
    _.startTilting = function(evt) {
        var direction = _.calculateDirection(evt);
        _.highlightTilt(direction);
		
        _.user.animateTilt(direction);
        if (_.state)
            _.state.pressed = true;
    };
    _.highlightZoom = function(direction) {
        if(direction === undefined) {
            $("#zoom-out").removeClass("highlight");
            $("#zoom-in").removeClass("highlight");
            return;
        }
        if(direction <= 0) {
            $("#zoom-out").addClass("highlight");
            $("#zoom-in").removeClass("highlight");
        } else {
            $("#zoom-in").addClass("highlight");
            $("#zoom-out").removeClass("highlight");
        }
    };
    _.highlightTilt = function(direction) {
        if(direction === undefined) {
            $("#tilt-up").removeClass("highlight");
            $("#tilt-down").removeClass("highlight");
            return;
        }
        if(direction <= 0) {
            $("#tilt-down").addClass("highlight");
            $("#tilt-up").removeClass("highlight");
        } else {
            $("#tilt-up").addClass("highlight");
            $("#tilt-down").removeClass("highlight");
        }
    };

    _.stopZooming = function() {
        $(document).unbind("mouseup", _.stopZooming);
        $(document).unbind("mousemove", _.startZooming);
        _.highlightZoom();
        _.user.animateZoom(0);
        if (_.state)
            _.state.pressed = false;
    };

    _.stopTilting = function() {
        $(document).unbind("mouseup", _.stopTilting);
        $(document).unbind("mousemove", _.startTilting);
        _.highlightTilt();
        _.user.animateTilt(0);
        if (_.state)
            _.state.pressed = false;
    };

    _.createSoftZoom = function(user) {
        var zoomControl = $("#zoomControls");
        zoomControl.bind("mousedown", function(evt) {
            _.startZooming(evt);
            $(document).bind("mousemove", _.startZooming);
            $(document).bind("mouseup", _.stopZooming);
        });
        zoomControl.bind("mousemove", function(evt) {
            if (_.state && !_.state.pressed) {
                var direction = _.calculateDirection(evt);
                _.highlightZoom(direction);
            }
        });
        zoomControl.bind("mouseout", function(evt) {
            _.highlightZoom();
        });
    };
    _.createSoftTilt = function(user) {
        var tiltControl = $("#tiltControls");
        tiltControl.bind("mousedown", function(evt) {
            _.startTilting(evt);
            $(document).bind("mousemove", _.startTilting);
            $(document).bind("mouseup", _.stopTilting);
        });
        tiltControl.bind("mousemove", function(evt) {
            if (_.state && !_.state.pressed) {
                var direction = _.calculateDirection(evt);
                _.highlightTilt(direction);
            }
        });
		
        tiltControl.bind("mousemove", function(evt) {
            if (_.state && !_.state.pressed) {
                var direction = _.calculateDirection(evt);
                _.highlightTilt(direction);
            }
        });
		
        tiltControl.bind("mouseout", function(evt) {
            _.highlightTilt();
        });
    };
    Public.initialize = function(user,globalState) {
        //TODO: create the divs here
        _.user = user;
        _.state = globalState;
        _.createSoftZoom(user);
        _.createSoftTilt(user);
        RotatePanControl.initialize(user,globalState);
        $("#centerEarthButton").bind("click", function(evt) {
            _.user.resetPosition();
        });
    };

    return Public;
}();
