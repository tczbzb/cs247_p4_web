//motion controls package
CONTROLS.init = function() {
	kinect.sessionPersist()
	.modal.make('../../../knctModal.css')			//kickstarting the modal
	.notif.make();									//kickstarting the notifications
	
	PHYSICS = CONTENT.PHYSICS;

	//adding notifications on connection status
	kinect.addEventListener('openedSocket', function() { this.notif.push( "CONNECTED" ) });
	kinect.addEventListener('closedSocket', function() { this.notif.push( "DISCONNECTED" ) });

	//adding notifications on player detection/loss
	kinect.addEventListener('playerFound', function( count ) { this.notif.push( "PLAYER FOUND. Total : " + count[ 0 ] ); this.scanForHead(); });
	kinect.addEventListener('playerLost', function( count ) { this.notif.push( "PLAYER LOST. Total : " + count[ 0 ] ) });

	//setup and once per message
	kinect.setUp({
		players 	: 2,
		relative	: true,
		meters	 	: false,
		sensitivity	: 1.15,						
		joints		: [ 'HAND_RIGHT', 'HEAD', 'HAND_LEFT' ],
		gestures	: [ 'ESCAPE', 'FOOT_LEAN', 'JUMP' ]
		
	})
	.onMessage( function( e ) {
		//	coords[ X ] 		-->	X player coordinates
		//	coords[ X ][ Y ]	-->	Y joint specified
		//
		//	for example, coords[ 0 ][ 2 ] --> First player's HAND_LEFT
		//
		//	[ 0 ] - HAND_RIGHT, [ 1 ] - HEAD, [ 2 ] - HAND_LEFT 
		
		//sanity check: do we have valid values at all?
		if( !this.coords[ 0 ][ 2 ] )
			return false;
		
		var len = this.sk_len;
		
		//perform action for all players
		while( len-- )
		{
			//	slightly increasing the hands z-axis values ( when extended = -100 )
			//	to take into consideration a bit the players mass
			this.coords[ len ][ 0 ].z += 5;
			this.coords[ len ][ 2 ].z += 5;
			
			//	setting the hands values between 0 to 100 with a 30-something gain to prevent
			//	"gorrila arm" effect. While the data that comes for the Socket is correct, we do not want
			//	the player to hand to fully extend his arm to the right/left to reach the max value
			this.coords[ len ][ 0 ].x = kinect.threshold( ( this.coords[ len ][ 0 ].x + 30 ), 0, 100 );
			this.coords[ len ][ 2 ].x = kinect.threshold( ( this.coords[ len ][ 2 ].x + 35 ), 0, 100 );
		}
		
		//control the plucks
		PHYSICS.move( this.coords );
		return false;
	});

	
	kinect.addEventListener( 'gestureFootLean', function( index ) {
		if( !kinect.cursor.status )
			return false;
			
		if( index[ 0 ] !== 0  || index[ 1 ] !== "right" )
			return false;
			
		var q = kinect.cursor,
			evObj = document.createEvent( 'MouseEvents' );
		
		if( index[ 2 ] == "front_on" )
		{
			evObj.initEvent( 'kinectPushStart', true, true );

			if( q.overlapEl )
			{
				q.overlapEl.dispatchEvent( evObj );
				q.pushedEl = q.overlapEl;
			}
		}
		else if( index[ 2 ] == "stable" )
		{
			evObj.initEvent( 'kinectPushEnd', true, true );
			if( q.pushedEl )
				q.pushedEl.dispatchEvent( evObj );
			else if( q.overlapEl )
				q.overlapEl.dispatchEvent( evObj );
		}	
		
		return false;
	});
	
	// escape
	kinect.addEventListener( 'gestureEscape', function( count ) {
		if( count[ 0 ] !== 0 )
			return false;
			
		if( count[ 1 ] === true )
			kinect.notif.push( "ESCAPE..." );
		return false;
	})
	.addEventListener( 'escapeInterval', function( args ) {
		if( CONTROLS.game_is_active )
			GAME.state.GAME_OVER();
		else
			history.back();
	});
	

	var cursor = kinect.cursor.make()				//building the cursor
				.useSmoothing( 2 )					//add a bit of smoothing
				.useBothHands( true )				//use both hands to control it
				.activate();						//activate the cursor

	var regions = CONTENT.UI.regions,
		rLen = regions.length;
		
	while( rLen-- )
		cursor.addRegion( document.getElementById( regions[ rLen ] ), 5 );	// adding hotstops buttons / actions to the regions object
	
	rLen = regions = null;
};