(function( GAME, CONTENT ) {
	var CONTROLS = GAME.controls,
		PHYSICS = CONTENT.PHYSICS,
		UI = CONTENT.UI,
		HUD = CONTENT.HUD,
		
		score_to_victory = GAME.score_to_victory;
	
	GAME.state = {
		 GAME_OVER : function( e ) {
			CONTROLS.game_is_active = false;
			
			kinect.cursor.activate();
			UI.showHUB();
		},
		
		NEW_GAME : function( e ) {
			//stopping movement
			CONTROLS.game_is_active = true;
			//stopping the cursor
			kinect.cursor.deactivate(); 

			document.getElementById('sc_pl1').innerHTML = 0;
			document.getElementById('sc_pl2').innerHTML = 0;
			
			//UI RESET
			HUD.reset();
		   
			//physics RESET
			PHYSICS.reset();
		},
		
		startGame : function() {
			this.NEW_GAME();
			UI.hideHUB();
		},
		
		Goal : function() {
			if( PHYSICS.puck_body.m_position.y > 50 || PHYSICS.puck_body.m_position.y < -50)
			{
				PHYSICS.resetVelocity();
				
				if( PHYSICS.puck_body.m_position.y > 50 )
				{
					PHYSICS.puck_body.m_position.Set( 0,-20 );
					++HUD.g_score[0];
					
					document.getElementById('sc_pl1').innerHTML = HUD.g_score[ 0 ];
					
					if( HUD.g_score[ 0 ] == 11 || HUD.g_score[ 1 ] == 11 )
						kinect.snapshot().saveToLocalStorage();

					if( HUD.g_score[0] >= GAME.score_to_victory )
					{
						document.getElementById('title').innerHTML = HUD.pl_names[ 0 ] + ' WINS!';
						this.GAME_OVER();
					}
				}
				if( PHYSICS.puck_body.m_position.y < -50 )  //AI / p2 scores
				{
					PHYSICS.puck_body.m_position.Set( 0, 20 );
					++HUD.g_score[1];
					
					document.getElementById( 'sc_pl2' ).innerHTML = HUD.g_score[ 1 ];
					
					if( HUD.g_score[ 0 ] == 11 || HUD.g_score[ 1 ] == 11 )
						kinect.snapshot().saveToLocalStorage();
					
					if( HUD.g_score[ 1 ] >= GAME.score_to_victory )
					{
						document.getElementById( 'title' ).innerHTML = HUD.pl_names[ 1 ] + ' WINS!';
						this.GAME_OVER();
					}
				}
			}
			return;
		}
	};
})( GAME, CONTENT );