(function( GAME, CONTENT ) {
	
	/*******************
	* called after each frame
	*******************/
	var PHYSICS, update, wallCollision,
		AI,
		RESTOREJOINTS,
		OPTIONS,
		renderer,
		scene,
		STATE,
		time, oldTime,
		camera = [],
		cam_len = 2,
		renderCallback = function() {
			requestAnimationFrame( renderCallback );
			render();
					
			time = new Date().getTime();
			
			var elapsedTime = ( time - oldTime ) / 100;
				
			oldTime = time;
			
			if( elapsedTime > 1 / 60 ) 
				elapsedTime = 1 / 60;
				
			if ( PHYSICS.world )
			{
				STATE.Goal();
				
				var sklen = kinect.sk_len;
				
				if( kinect.sk_len === 1 )
					AI( 1 ),AI( 3 )
				else
					RESTOREJOINTS( 1 ),RESTOREJOINTS( 3 );
				
				while( sklen-- )
				{
					PHYSICS.m_joint[ sklen ].SetTarget( PHYSICS.pos[ sklen ] );
					PHYSICS.m_joint[ sklen + 2 ].SetTarget( PHYSICS.pos[ sklen + 2] );
				}
				
				//clamp the speed of the puck 
				if( PHYSICS.puck_body.m_linearVelocity.Length() > g_maxspeed ) 
				{
					PHYSICS.puck_body.m_linearVelocity.Normalize(); 
					PHYSICS.puck_body.m_linearVelocity.Multiply( g_maxspeed );
				}

				PHYSICS.world.Step( elapsedTime, 1 );
				wallCollision( PHYSICS.puck_body );
					 
				//reset the graphics (unrolled loop)
				update( PHYSICS.puck_body, "puck" ); 
				
				update( PHYSICS.mallet_body[ 0 ], "mallet0" );	//player 1 right
				update( PHYSICS.mallet_body[ 1 ], "mallet1" );	//player 2 right
				
				update( PHYSICS.mallet_body[ 2 ], "mallet2" );	//player 1 left
				update( PHYSICS.mallet_body[ 3 ], "mallet3" );	//player 2 left
			}
			
			return false;
		},
		
		render = function() {
			//var timer = new Date().getTime() / 1000;
			var SCREEN_WIDTH = CONTENT.WIDTH,
				SCREEN_HEIGHT = CONTENT.HEIGHT,
				keptX = [],
				keptY = [],
				keptZ = [],
				message = kinect.coords
				c_len = cam_len;

			while( c_len-- )
			{
				keptX[ c_len ] = RENDERER.camera[ c_len ].position.x;
				keptY[ c_len ] = RENDERER.camera[ c_len ].position.y;
				keptZ[ c_len ] = RENDERER.camera[ c_len ].position.z;
			}
			
			//split screen
			if( OPTIONS.view.split_screen )
			{
				//camera head tracking for player 2
			
			//camera head tracking for player 1
				if( kinect.sk_len !== 0 )
				{	
					RENDERER.camera[ 0 ].position.x += ( message[ 0 ][ 1 ].x - 32 ) * 2 ;
					RENDERER.camera[ 0 ].position.y -= ( message[ 0 ][ 1 ].y - 16 ) * 1.8;
					RENDERER.camera[ 0 ].position.z += (  message[ 0 ][ 1 ].z - 22 ) * 1.2;
					
					RENDERER.camera[ 0 ].target.position.x = 45;
					RENDERER.camera[ 0 ].target.position.y = 0;
					RENDERER.camera[ 0 ].target.position.z = 0;
				
					if( kinect.sk_len > 1 )
					{
						RENDERER.camera[ 1 ].position.x += ( message[ 1 ][ 1 ].x - 40 ) * -2;
						RENDERER.camera[ 1 ].position.y -= ( message[ 1 ][ 1 ].y - 36 ) * 1.8;
						RENDERER.camera[ 1 ].position.z -= (  message[ 1 ][ 1 ].z - 36 );
						
					//	if( RENDERER.camera[ 1 ].position.z > 270 ) RENDERER.camera[ 1 ].position.z = 270;
					//	else if( RENDERER.camera[ 1 ].position.z < 104 ) RENDERER.camera[ 1 ].position.z = 104;
					}
				}
				renderer.clear();
				renderer.enableScissorTest( true );
			
				renderer.setScissor( SCREEN_WIDTH/2, 0, SCREEN_WIDTH/2 - 2, SCREEN_HEIGHT  );
				renderer.render( scene, RENDERER.camera[ 1 ] );
			
				renderer.setScissor( 0, 0, SCREEN_WIDTH/2 - 2, SCREEN_HEIGHT );
			}
			else
			{
				//camera head tracking for player 1
				if( kinect.sk_len !== 0 )
				{	
					RENDERER.camera[ 0 ].position.x += ( message[ 0 ][ 1 ].x  - 50 ) * 2;
					RENDERER.camera[ 0 ].position.y -= ( message[ 0 ][ 1 ].y - 16 ) * 1.8;
					RENDERER.camera[ 0 ].position.z += (  message[ 0 ][ 1 ].z - 45 ) * 1.2;
					
					RENDERER.camera[ 0 ].target.position.x = 10;
					RENDERER.camera[ 0 ].target.position.y = 0;
					RENDERER.camera[ 0 ].target.position.z = 0;
					
					if( RENDERER.camera[ 0 ].position.z > 310 ) RENDERER.camera[ 0 ].position.z = 310;
					else if( RENDERER.camera[ 0 ].position.z < 80 ) RENDERER.camera[ 0 ].position.z = 80;
				}
				renderer.enableScissorTest( false );
			}	
			renderer.render( scene, RENDERER.camera[ 0 ] );
			

			RENDERER.camera[ 0 ].position.x = keptX[ 0 ];
			RENDERER.camera[ 0 ].position.z = keptZ[ 0 ];
			RENDERER.camera[ 0 ].position.y = keptY[ 0 ];
			
			RENDERER.camera[ 1 ].position.x = keptX[ 1 ];
			RENDERER.camera[ 1 ].position.z = keptZ[ 1 ];
			RENDERER.camera[ 1 ].position.y = keptY[ 1 ];
		};
	
	var RENDERER = CONTENT.RENDERER = {
		camera	: [],
		init	:	function( div_container ) {
			PHYSICS = CONTENT.PHYSICS;
			update = PHYSICS.update;
			STATE = GAME.state;
			wallCollision = PHYSICS.wallCollision;

			OPTIONS = CONTENT.OPTIONS;
			
			AI = CONTENT.AI;
			RESTOREJOINTS = CONTENT.RESTOREJOINTS;
		
			camera[ 0 ] = new THREE.Camera( 45, window.innerWidth / window.innerHeight, 1, 1000 );	
			camera[ 0 ].position.x = 10;
			camera[ 0 ].position.y = 90;
			camera[ 0 ].position.z = 115;
			
			camera[ 0 ].target.position.x = 10;
			camera[ 0 ].target.position.y = 0;
			camera[ 0 ].target.position.z = 0;
			
			RENDERER.camera[ 0 ] = camera[ 0 ];
			
			camera[ 1 ] = new THREE.Camera( 45, window.innerWidth / window.innerHeight, 1, 1000 );	
			camera[ 1 ].position.x = 40;
			camera[ 1 ].position.y = 90;
			camera[ 1 ].position.z = -140;
			
			camera[ 1 ].target.position.x = 54;
			camera[ 1 ].target.position.y = 10;
			camera[ 1 ].target.position.z = 25;
			
			RENDERER.camera[ 1 ] = camera[ 1 ];
			
			this.camera = camera;
			this.scene = scene = new THREE.Scene();
			
			scene.addLight( new THREE.AmbientLight( 0xffffff ) );
					
			var light = new THREE.DirectionalLight( 0xeefeef, 1.34 );
			light.position.z = 1;
			
			this.scene.addLight( light );
			
			this.LoadAssets( "assets/plane.js", "plane" );				
			this.LoadAssets( "assets/table.js", "table" );
			this.LoadAssets( "assets/mallet2.js", "mallet0" );
			this.LoadAssets( "assets/mallet.js", "mallet1" );
			this.LoadAssets( "assets/mallet2.js", "mallet2" );
			this.LoadAssets( "assets/mallet.js", "mallet3" );
			this.LoadAssets( "assets/puck.js", "puck" );
					
			renderer = this.renderer = new THREE.WebGLRenderer();
			div_container.appendChild( renderer.domElement );
			
			renderer.sortObjects = false;
			renderer.setSize( window.innerWidth, window.innerHeight );

			var runResize = function() {
				CONTENT.WIDTH = window.innerWidth;
				CONTENT.HEIGHT = window.innerHeight;
				
				CONTENT.RENDERER.camera[ 0 ].aspect = CONTENT.WIDTH  / CONTENT.HEIGHT;
				CONTENT.RENDERER.camera[ 0 ].updateProjectionMatrix();
				
				CONTENT.RENDERER.camera[ 1 ].aspect = CONTENT.WIDTH  / CONTENT.HEIGHT;
				CONTENT.RENDERER.camera[ 1 ].updateProjectionMatrix();
				
				CONTENT.RENDERER.renderer.setSize( CONTENT.WIDTH , CONTENT.HEIGHT );
				
				//font-reset
				document.getElementsByTagName('body')[0].style.fontSize = CONTENT.HEIGHT / 12 + 'px';
			};
			runResize();
			
			window.addEventListener( 'resize', function() {
				runResize();
			}, false );
			
			
			return false;
		},
		
		renderCallback : renderCallback,
		
		LoadAssets : function( path ,name ) {
			var loader = new THREE.JSONLoader(),
				q = this;
				
			loader.load({
				model: path + "#" + new Date(),
				callback: function( geometry ) {
					geometry.materials[ 0 ][ 0 ].shading = THREE.SmoothShading;

					var material = new THREE.MeshFaceMaterial({
						color:		0xffffff,
						opacity:	0.9,
						shading:	THREE.SmoothShading,
						wireframe:	true,
						wireframeLinewidth:	200
					});
					
					mesh = new THREE.Mesh( geometry, material  );
					mesh.name = name;
					mesh.scale.set( 1.0, 1.0, 1.0 );
					q.scene.addObject( mesh );
				}
			});
		},
		
		loadCustomAssets : function( e ) {
			switch ( e ) {
				case 0 :
					var object = scene.getChildByName( "plane" );
					scene.removeObject( object );
					object = scene.getChildByName( "mallet0" );
					scene.removeObject( object );
					object = scene.getChildByName( "mallet1" );
					scene.removeObject( object );
					object = scene.getChildByName( "mallet2" );
					scene.removeObject( object );
					object = scene.getChildByName( "mallet3" );
					scene.removeObject( object );
					object = scene.getChildByName( "puck" );
					scene.removeObject( object );
					
					this.LoadAssets( "assets/plane.js", "plane" );				
					this.LoadAssets( "assets/mallet2.js", "mallet0" );
					this.LoadAssets( "assets/mallet.js", "mallet1" );
					this.LoadAssets( "assets/mallet2.js", "mallet2" );
					this.LoadAssets( "assets/mallet.js", "mallet3" );
					this.LoadAssets( "assets/puck.js", "puck" );
				break;
				case 1 :
					var object = scene.getChildByName( "plane" );
					scene.removeObject( object );
					object = scene.getChildByName( "mallet0" );
					scene.removeObject( object );
					object = scene.getChildByName( "mallet1" );
					scene.removeObject( object );
					object = scene.getChildByName( "mallet2" );
					scene.removeObject( object );
					object = scene.getChildByName( "mallet3" );
					scene.removeObject( object );
					
					object = scene.getChildByName( "puck" );
					scene.removeObject( object );
					
					this.LoadAssets( "assets/plane1.js", "plane" );	
					this.LoadAssets( "assets/mallet2.js", "mallet0" );
					this.LoadAssets( "assets/mallet.js", "mallet1" );
					this.LoadAssets( "assets/mallet2.js", "mallet2" );
					this.LoadAssets( "assets/mallet.js", "mallet3" );
					this.LoadAssets( "assets/puck.js", "puck" );				
				break;
				case 2 :
					var object = scene.getChildByName( "plane" );
					scene.removeObject( object );
					object = scene.getChildByName( "mallet0" );
					scene.removeObject( object );
					object = scene.getChildByName( "mallet1" );
					scene.removeObject( object );
					object = scene.getChildByName( "mallet2" );
					scene.removeObject( object );
					object = scene.getChildByName( "mallet3" );
					scene.removeObject( object );
					object = scene.getChildByName( "puck" );
					scene.removeObject( object );
					
					this.LoadAssets( "assets/plane2.js", "plane" );				
					this.LoadAssets( "assets/mallet2.js", "mallet0" );
					this.LoadAssets( "assets/mallet.js", "mallet1" );
					this.LoadAssets( "assets/mallet2.js", "mallet2" );
					this.LoadAssets( "assets/mallet.js", "mallet3" );
					this.LoadAssets( "assets/puck2.js", "puck" );
				break;
			}
		},
		
		/***************
		* Camera "templates"
		* case 0 is default, 1 is birds eye view
		* and 2 is two player split screen
		***************/
		setCamera : function( e ) {
			var camera = this.camera[0];
			
			switch ( e ) {
				case 0 :
					camera.position.x = 0;
					camera.position.y = 90;
					camera.position.z = 115;
					camera.target.position.x = 10;
					
					OPTIONS.view.split_screen = false;
				break;
				case 1 :
					camera.position.x = 0;
					camera.position.y = 160;
					camera.position.z = 20;
					camera.target.position.x = 10;
					
					OPTIONS.view.split_screen = false;
				break;
				case 2 :
					OPTIONS.view.split_screen = true;

					camera.target.position.x = 40;
					camera.target.position.y = 0;
					camera.target.position.z = 0;
				break;
			}
			return false;
		}
	};

})( GAME, CONTENT );