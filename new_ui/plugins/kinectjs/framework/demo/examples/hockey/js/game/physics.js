(function( GAME, CONTENT ) {

	var pos = [],
		scene,
		CreatePhysicsWorld = function() {
			scene = CONTENT.RENDERER.scene;
			
		  //Physics
		  var worldAABB = new b2AABB();
		  worldAABB.minVertex.Set( -10000, -10000 );
		  worldAABB.maxVertex.Set( 1000, 1000 );
		  var gravity = new b2Vec2( 0, 0 );
		  var doSleep = true;
		  PHYSICS.world = new b2World( worldAABB, gravity, doSleep );
		  
		  //edges left
		  var groundSd = new b2BoxDef();
		  groundSd.extents.Set(50, 55);
		  groundSd.restitution = 0.2;
		  var groundBd = new b2BodyDef();
		  groundBd.AddShape(groundSd);
		  groundBd.position.Set(-80, 0);
		  groundBd.m_flags |= b2Body.e_allowSleepFlag;
		  PHYSICS.world.CreateBody(groundBd);
			
		  //edges right
		  var groundSd = new b2BoxDef();
		  groundSd.extents.Set(50, 55);
		  groundSd.restitution = 0.2;
		  var groundBd = new b2BodyDef();
		  groundBd.AddShape(groundSd);
		  groundBd.position.Set(80, 0);
		  groundBd.m_flags |= b2Body.e_allowSleepFlag;
		  PHYSICS.world.CreateBody(groundBd); 
		  
		 //edges Top left
		  var groundSd = new b2BoxDef();
		  groundSd.extents.Set(20, 50);
		  groundSd.restitution = 1.0;
		  var groundBd = new b2BodyDef();
		  groundBd.AddShape(groundSd);
		  groundBd.position.Set(-30, 100);
		  groundBd.m_flags |= b2Body.e_allowSleepFlag;
		  PHYSICS.world.CreateBody(groundBd);
			
		  //edges Top right
		  var groundSd = new b2BoxDef();
		  groundSd.extents.Set(20, 50);
		  groundSd.restitution = 1.0;
		  var groundBd = new b2BodyDef();
		  groundBd.AddShape(groundSd);
		  groundBd.position.Set(30, 100);
		  groundBd.m_flags |= b2Body.e_allowSleepFlag;
		  PHYSICS.world.CreateBody(groundBd); 
		  
		  //edges Bottom left
		  var groundSd = new b2BoxDef();
		  groundSd.extents.Set(20, 50);
		  groundSd.restitution = 1.0;
		  var groundBd = new b2BodyDef();
		  groundBd.AddShape(groundSd);
		  groundBd.position.Set(-30, -100);
		  groundBd.m_flags |= b2Body.e_allowSleepFlag;
		  PHYSICS.world.CreateBody(groundBd);
			
		  //edges Bottom right
		  var groundSd = new b2BoxDef();
		  groundSd.extents.Set(20, 50);
		  groundSd.restitution = 1.0;
		  var groundBd = new b2BodyDef();
		  groundBd.AddShape(groundSd);
		  groundBd.position.Set(30, -100);
		  groundBd.m_flags |= b2Body.e_allowSleepFlag;
		  PHYSICS.world.CreateBody(groundBd); 
		  
		  //Corners
		  var cornerd = new b2PolyDef();
		  cornerd.vertexCount = 3;
		  cornerd.vertices[0].Set(0,2); 
		  cornerd.vertices[1].Set(0,0);
		  cornerd.vertices[2].Set(2,0);
		  cornerd.restitution = 1.0;
		  var groundBd = new b2BodyDef();
		  groundBd.AddShape(cornerd);
		  groundBd.rotation = 0.0;
		  groundBd.position.Set(-30, -50);
		  groundBd.m_flags |= b2Body.e_allowSleepFlag;
		  PHYSICS.world.CreateBody(groundBd); 
		  
		  var groundBd = new b2BodyDef();
		  groundBd.AddShape(cornerd);
		  groundBd.rotation = 1.57079633;
		  groundBd.position.Set(30, -50);
		  groundBd.m_flags |= b2Body.e_allowSleepFlag;
		  PHYSICS.world.CreateBody(groundBd);
		  
		  var groundBd = new b2BodyDef();
		  groundBd.AddShape(cornerd);
		  groundBd.rotation = 3.14159265;
		  groundBd.position.Set(30, 50);
		  groundBd.m_flags |= b2Body.e_allowSleepFlag;
		  PHYSICS.world.CreateBody(groundBd);
		  
		  var groundBd = new b2BodyDef();
		  groundBd.AddShape(cornerd);
		  groundBd.rotation = 4.71238898;
		  groundBd.position.Set(-30, 50);
		  groundBd.m_flags |= b2Body.e_allowSleepFlag;
		  PHYSICS.world.CreateBody(groundBd);
		  //Corners end
					  
		  var puckSd = new b2CircleDef();  //puck
		  puckSd.density = 1.0;
		  puckSd.radius = 2.5;
		  puckSd.restitution = 0.8;
		  puckSd.friction = 0;
		  groundSd.linearDamping = 20;
		  var puckBd = new b2BodyDef();
		  puckBd.AddShape(puckSd);
		  puckBd.position.Set(0,-20.0);
		  PHYSICS.puck_body = PHYSICS.world.CreateBody(puckBd);
		  
		  puckSd = new b2CircleDef();   //mallet0
		  puckSd.density = 100.0;
		  puckSd.radius = 4.0;
		  puckSd.restitution = 1.0;
		  puckSd.friction = 0;
		  puckBd = new b2BodyDef();
		  puckBd.AddShape(puckSd);
		  puckBd.position.Set(15,40.0);
		  PHYSICS.mallet_body[0] = PHYSICS.world.CreateBody(puckBd);
		  
		  puckSd = new b2CircleDef();   //mallet1
		  puckSd.density = 100.0;
		  puckSd.radius = 4.0;
		  puckSd.restitution = 1.0;
		  puckSd.friction = 0;
		  puckBd = new b2BodyDef();
		  puckBd.AddShape(puckSd);
		  puckBd.position.Set(15,-40.0);
		  PHYSICS.mallet_body[1] = PHYSICS.world.CreateBody(puckBd);
		  
		  puckSd = new b2CircleDef();   //mallet2
		  puckSd.density = 100.0;
		  puckSd.radius = 4.0;
		  puckSd.restitution = 1.0;
		  puckSd.friction = 0;
		  puckBd = new b2BodyDef();
		  puckBd.AddShape(puckSd);
		  puckBd.position.Set(-15,40.0);
		  PHYSICS.mallet_body[2] = PHYSICS.world.CreateBody(puckBd);
		  
		  puckSd = new b2CircleDef();   //mallet3
		  puckSd.density = 100.0;
		  puckSd.radius = 4.0;
		  puckSd.restitution = 1.0;
		  puckSd.friction = 0;
		  puckBd = new b2BodyDef();
		  puckBd.AddShape(puckSd);
		  puckBd.position.Set(-15,-40.0);
		  PHYSICS.mallet_body[3] = PHYSICS.world.CreateBody(puckBd);
				
		  //Make m_joint Player 1 Paddle
		  var md = new b2MouseJointDef();
		  md.body1 = PHYSICS.world.GetGroundBody();
		  md.body2 = PHYSICS.mallet_body[0];
		  var p2 = new b2Vec2(15,-40.0);
		  md.target.Set(p2);
		  md.maxForce = 100000 * PHYSICS.mallet_body[0].m_mass;
		  md.timeStep =  1/60; // note it's set same as the world timestep 1/60
		  md.frequencyHz = 15;
		  PHYSICS.m_joint[0] = PHYSICS.world.CreateJoint(md);
		  PHYSICS.m_joint[0].m_localAnchor.Set(0.0,0.0); 
		  PHYSICS.m_joint[0].SetTarget( p2 );
		  
		  //Make m_joint Player 1 Paddle
		  var md = new b2MouseJointDef();
		  md.body1 = PHYSICS.world.GetGroundBody();
		  md.body2 = PHYSICS.mallet_body[2];
		  var p2 = new b2Vec2(-15,-40.0);
		  md.target.Set(p2);
		  md.maxForce = 100000 * PHYSICS.mallet_body[2].m_mass;
		  md.timeStep =  1/60; // note it's set same as the world timestep 1/60
		  md.frequencyHz = 15;
		  PHYSICS.m_joint[2] = PHYSICS.world.CreateJoint(md);
		  PHYSICS.m_joint[2].m_localAnchor.Set(0.0,0.0); 
		  PHYSICS.m_joint[2].SetTarget( p2 );
		  
		  //Make m_joint Player 2 Paddle
		  var md = new b2MouseJointDef();
		  md.body1 = PHYSICS.world.GetGroundBody();
		  md.body2 = PHYSICS.mallet_body[1];
		  var p2 = new b2Vec2(15,40.0);
		  md.target.Set(p2);
		  md.maxForce = 100000 * PHYSICS.mallet_body[1].m_mass;
		  md.timeStep =  1/60; // note it's set same as the world timestep 1/60
		  md.frequencyHz = 15;
		  PHYSICS.m_joint[1] = PHYSICS.world.CreateJoint(md);
		  PHYSICS.m_joint[1].m_localAnchor.Set(0.0,0.0); 
		  PHYSICS.m_joint[1].SetTarget( p2 );
		  
		  //Make m_joint Player 2 Paddle
		  var md = new b2MouseJointDef();
		  md.body1 = PHYSICS.world.GetGroundBody();
		  md.body2 = PHYSICS.mallet_body[3];
		  var p2 = new b2Vec2(-15,40.0);
		  md.target.Set(p2);
		  md.maxForce = 100000 * PHYSICS.mallet_body[3].m_mass;
		  md.timeStep =  1/60; // note it's set same as the world timestep 1/60
		  md.frequencyHz = 15;
		  PHYSICS.m_joint[3] = PHYSICS.world.CreateJoint(md);
		  PHYSICS.m_joint[3].m_localAnchor.Set(0.0,0.0); 
		  PHYSICS.m_joint[3].SetTarget( p2 );

		  pos[ 0 ] = new b2Vec2( 15,-40.0 );
		  pos[ 2 ] = new b2Vec2( -15,-40.0 );
		  pos[ 1 ] = new b2Vec2( 15,40.0 );
		  pos[ 3 ] = new b2Vec2( -15,40.0 );
		  
		  PHYSICS.pos = pos;
		};

	var PHYSICS = CONTENT.PHYSICS = {
		//	properties
		world		: null,
		puck_body	: null,
		mallet_body	: [],
		m_joint		: [],
		
		init : CreatePhysicsWorld,
		RENDERER : CONTENT.RENDERER,

		//	functions
		update : function( body, objectName ) {
			var object = scene.getChildByName( objectName ); 
			
			if( body.m_position && object)
			{
				object.position.x =	body.m_position.x;
				object.position.z =	-body.m_position.y;
			}
			return false;
		},
		
		wallCollision	: function( body ) {
			if( body.m_position.x > 26.6 || body.m_position.x < -26.6 )
			{
				if( body.m_position.x > 26.6 )
					body.m_position.x = 26.6;
				else if( body.m_position.x < -26.6 )
					body.m_position.x = -26.6;  

				body.m_linearVelocity.Set( -body.m_linearVelocity.x, body.m_linearVelocity.y );
			}
			
			if( body.m_position.y > 46.0 || body.m_position.y < -46.0 )
			{
				if( body.m_position.x > -13.3 && body.m_position.x < 13.3 )
					return;
				else if( body.m_position.y > 46.0 )
				  body.m_position.y = 46;
				else if( body.m_position.y < 46.0 )
				  body.m_position.y = -46;
				  
				body.m_linearVelocity.Set( body.m_linearVelocity.x, -body.m_linearVelocity.y );  
			}
		},
		
		move : function( coords ) {
			if( CONTROLS.game_is_active )
			{
				var p = new THREE.Vector2( 0, 0 );
				
				//p.x = coords[ 0 ][ 0 ].x * 1.7 * 0.5 - 25; // 100 convert to 25 and -25 ==>  [( 0 <==> 100 ) - 50 ] / 2
				p.x = ( coords[ 0 ][ 0 ].x - 50 ) / 1.7;
				//p.y = coords[ 0 ][ 0 ].y * 1.5 *  -0.5 + 5; //100 convert to 45 to -4
				//p.y = ( -coords[ 0 ][ 0 ].y / 2 ) - 5;
				p.y = (( -coords[ 0 ][ 0 ].z  ) - 105 ) / 2;
				
				pX_orig = p.x;
				
				if( p.x > 25 )
					p.x = 25;
				if( p.x < -25 )
					p.x = -25;   
				if( p.y > -4 )
					p.y = -4;
				else if( p.y < -45 )
					p.y = -45;

				pos[ 0 ].x = p.x;
				pos[ 0 ].y = p.y;
				 
				p.x = ( coords[ 0 ][ 2 ].x - 50 ) / 1.7;
				p.y = (( -coords[ 0 ][ 2 ].z ) - 105 ) / 2;
				
				if( p.x > 25 )
					p.x = 25;
				if( p.x < -25 )
					p.x = -25;   
				if( p.y > -4 )
					p.y = -4;
				else if( p.y < -45 )
					p.y = -45;
					
				pos[ 2 ].x = p.x;
				pos[ 2 ].y = p.y;
				 
				if( kinect.sk_len > 1 ) //second player data!
				{
					p.x = ( -coords[ 1 ][ 0 ].x + 50 )/ 1.7;
					p.y =  (( coords[ 1 ][ 0 ].z  ) + 105 ) / 2;
					
					pX_orig = p.x;
					
					if( p.x > 25 )
						p.x = 25;
					if( p.x < -25 )
						p.x = -25; 
						
					if( p.y > 40 )
						p.y = 40;
					else if( p.y < -4 )
						p.y = -4;

					pos[ 1 ].x = p.x;
					pos[ 1 ].y = p.y;
					 
					//first player second dish
					p.x = ( -coords[ 1 ][ 2 ].x + 50 ) / 1.7;
					p.y =  (( coords[ 1 ][ 2 ].z  ) + 105 ) / 2;
					
					if( p.x > 25 )
						p.x = 25;
					if( p.x < -25 )
						p.x = -25;   
					if( p.y > 40 )
						p.y = 40;
					else if( p.y < -4 )
						p.y = -4;
						
					pos[ 3 ].x = p.x;
					pos[ 3 ].y = p.y;
				}
				this.pos = pos;
			}
		},
		
		reset : function() {
			this.mallet_body[0].m_position.Set(15,-40.0);  
			this.mallet_body[1].m_position.Set(15,40.0); 

			this.mallet_body[2].m_position.Set(-15,-40.0); 
			this.mallet_body[3].m_position.Set(-15,40.0); 

			this.puck_body.m_position.Set(0,-20);

			var mov = new b2Vec2( 0.0, 0.0 );
			this.mallet_body[0].SetLinearVelocity(mov); 
			this.mallet_body[1].SetLinearVelocity(mov);
			this.mallet_body[2].SetLinearVelocity(mov);
			this.mallet_body[3].SetLinearVelocity(mov);
			this.puck_body.SetLinearVelocity(mov);

			//reset the graphics
			this.update( this.puck_body, "puck"); 
			this.update( this.mallet_body[0], "mallet0");
			this.update( this.mallet_body[1], "mallet1");
			this.update( this.mallet_body[2], "mallet2");
			this.update( this.mallet_body[3], "mallet3");
			
			return false;
		},
		
		resetVelocity : function() {
			this.mallet_body[0].m_linearVelocity.SetZero();
			this.mallet_body[1].m_linearVelocity.SetZero();
			this.mallet_body[2].m_linearVelocity.SetZero();
			this.mallet_body[3].m_linearVelocity.SetZero();
			
			this.puck_body.m_linearVelocity.SetZero();
		}
	
	};
})( GAME, CONTENT )