var RotatePanControl = function() {
    var Public = {},
        _      = {};//privates
        _.user = {
			animatePan : function(){}
		};
        _.state = null; // global state
        _.panning = false;
        _.heading = false;
        _.northRadius  = 33; // width/2 of control - offset(2px) from border and half northsize 
        _.center  = {x:40, y:40}; //center of control minus northsize/2
        _.maxRadius = 40;
        _.maxPanRadius = 28;
        _.targetAngle  = 0;

    _.deg2rad = function(degrees) {
        return Math.round(Math.PI / 180 * degrees * 100) / 100;
    };

    _.getAngleData = function(centerPoint, referencePoint) {
        var dx =  referencePoint.x - centerPoint.x,
            dy = -referencePoint.y + centerPoint.y,
            angle;
        angle = Math.round(((Math.PI / 2) - Math.atan(dy / (dx === 0 ? 0.0000001 : dx)))* 180 / Math.PI);
        angle = referencePoint.x < centerPoint.x ? 180 + angle : referencePoint.y < centerPoint.y ? angle : 360 + angle;
        return {
            angle : _.deg2rad(Math.floor(angle % 360)),
            radius : Math.round(Math.sqrt(dx * dx + dy * dy))
        };
    };
    _.setHeading = function(angle, onlyGFXFlag) {        
        if(!onlyGFXFlag) {
            var currentHeading = _.user.getHeading(),
                difference = angle - currentHeading;
            _.targetAngle = angle;
                 if (difference < -Math.PI) difference += 2*Math.PI;
            else if (difference >  Math.PI) difference -= 2*Math.PI;
            if (difference > 0) {
                _.user.animateHeading(1);
            } else {
                _.user.animateHeading(-1);
            }
        } else { 
            var position = {x: 0, y:0};
            position.x = _.northRadius * Math.cos(angle) + _.center.x - 4; //minus half northsize size
            position.y = _.northRadius * Math.sin(angle) + _.center.y - 2; //minus half northsize size
            var north            = $("#rotateControls #north");
            north.css("left", position.y + "px");
            north.css("bottom", position.x + "px");
        }
        var difference = Math.abs(_.targetAngle - _.user.getHeading());
        if(difference < Math.PI/16 || difference > 31*Math.PI/16) {
            _.user.animateHeading(0);
            return;
        }
    };

    _.checkHeading = function() {
        var currentHeading = _.user.getHeading();
        _.setHeading(currentHeading, true);
        window.setTimeout(_.checkHeading, 200);
    };

	/****************************
	* #### KINECT CODE
	*
	* Hand control
	*****************************/
    _.setPanning = function( use_panning ) {
		if( use_panning === 0 )
		{
			_.user.animatePan( 0, 0 );
			return false;
		}
		
        var direction = { x: 0, y: 0 },
			coords = kinect.coords[ 0 ][ 0 ],
			z_index = 64 - ( 0.09 * -coords.z ) ;

	    //trial and error play on Nokia's accepted values
		direction.x = ( coords.x - 50 ) * 2 / z_index + 0.15;
		direction.y = ( coords.y - 50 ) * -2 / z_index - 0.30;

        _.user.animatePan( direction.x, direction.y );
		return false;
    };
	
	//runs once per joints socket message
	kinect.onMessage( function(args) {
		var hand = this.coords[ 0 ][ 0 ];	//control-hand coords
		//if the hand is not extended enough - or if both hands are extended do not move
		if( ( hand.z > -25 ) || window.bothHands )
		{
			_.setPanning( 0 );
			return false;
		}
		
		if( window.bothHands || this.coords[ 0 ][ 0 ].z < -60 )	//silence turning
		{
			_.user.animateHeading( 0 );
			_.heading = false;
		}
		
		_.setPanning( 1 );
		_.panning = true;
		
		if( _.state )
			_.state.pressed = true;
			
		return false;
	})
	//turning the map (left - right with shoulder movement)
	//args : 0 = player index,  1 = direction (left / right)
	.addEventListener( 'gestureBodyTurning', function( args ) {
		//if both hands are extended OR the control-hand is "far" extended don't turn the map
		if( window.bothHands || this.coords[ 0 ][ 0 ].z < -55 )
		{
			_.user.animateHeading( 0 );
			_.heading = false;
			return false;
		}
		
		//else turn the map based on the direction given
		if( args[ 1 ] === 'left' )
			_.user.animateHeading( -1 );
		else if( args[ 1 ] === 'right' ) 
			_.user.animateHeading( 1 );
		else
		{
			_.heading = false;
			_.user.animateHeading( 0 );
			return false;
		}
		
		_.heading = true;
		return false;
	});
	/************** END OF KINECT ******************/
	
	
    _.highlightPanControls = function (angle){
        if(!!angle && angle >= 13*Math.PI/8 || angle < 3*Math.PI/8) { //move up 
            $("#move-up").addClass("hightlight");
        } else {
            $("#move-up").removeClass("hightlight");
        }
        if (!!angle && angle >= Math.PI/8 && angle < 7*Math.PI/8 ) { //move right
            $("#move-right").addClass("hightlight");
        } else {
            $("#move-right").removeClass("hightlight");
        }
        if (!!angle && angle >= 5*Math.PI/8 && angle < 11*Math.PI/8 ) { //move down
            $("#move-down").addClass("hightlight");
        } else {
            $("#move-down").removeClass("hightlight");
        }
        if (!!angle && angle >= 9*Math.PI/8 && angle < 15*Math.PI/8 ) { //move left
            $("#move-left").addClass("hightlight");
        } else {
            $("#move-left").removeClass("hightlight");
        }
    };
    
    Public.initialize = function(user,globalState) {
        _.user = user;
        _.state = globalState;
        var rotateControls = $("#rotateControls");
        _.setHeading(_.user.getHeading());
        _.checkHeading(); 

        rotateControls.bind("mousedown", function(evt) {

            var angleData = _.getAngleData({x:40, y:40}, {x:evt.layerX, y:evt.layerY}); 
            if(angleData.radius >= _.maxPanRadius && angleData.radius <= _.maxRadius) {
                _.setHeading(angleData.angle);
                _.heading = true;
                if (_.state)
                    _.state.pressed = true;
            } else if (angleData.radius < _.maxPanRadius) {
			
				//console.log( evt.layerX+ "      " + evt.layerY );
                _.setPanning(evt.layerX, evt.layerY);
                _.panning = true;
                if (_.state)
                    _.state.pressed = true;
            }
        });
		

		
		
        rotateControls.bind("mousemove", function(evt) {
            if ((_.state && !_.state.pressed) || _.panning || _.heading) {
                var angle = _.getAngleData({x:40, y:40}, {x:evt.layerX, y:evt.layerY}).angle; 
                if(_.heading) {
                    _.setHeading(angle);
                } else if(_.panning) {
                    _.setPanning(evt.layerX, evt.layerY);
                    _.highlightPanControls(angle);
                }
            }
        });
        rotateControls.bind("mouseout", function(evt) {
            var angle = _.getAngleData({x:40, y:40}, {x:evt.layerX, y:evt.layerY}).angle; 
            _.highlightPanControls();
        });

        $("#north").bind("mousemove", false) ;// function(evt) {
        $("#north").bind("mousedown", function(evt){
            var angleData = _.getAngleData({x:40, y:40}, {x:evt.layerX, y:evt.layerY}); 
            _.heading = true;
            if (_.state)
                _.state.pressed = true;
        });

        $(document).bind("mouseup", function(evt) {
            if(_.panning) {
                _.panning = false;
                _.user.animatePan(0,0);
                _.highlightPanControls();
            }
            if(_.heading) {
                _.heading = false;
                _.user.animateHeading(0);
            }
            if (_.state)
                _.state.pressed = false;
        });
    };

    return Public;
}();
