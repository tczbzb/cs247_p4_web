CONTENT.AI = function( index ) {
	var puck_body = PHYSICS.puck_body,
		mallet_body = PHYSICS.mallet_body;

	if( PHYSICS.m_joint[ 3 ] )
	{
		PHYSICS.world.DestroyJoint( PHYSICS.m_joint[ 3 ] );
		PHYSICS.m_joint[ 3 ] = null;
		
		PHYSICS.world.DestroyJoint( PHYSICS.m_joint[ 1 ] );
		PHYSICS.m_joint[ 1 ] = null;
	}
		
	if( puck_body.m_position.y > 0) 
	{
		var movX = puck_body.m_position.x - mallet_body[ index ].m_position.x;
		var movY = puck_body.m_position.y - mallet_body[index ].m_position.y;
		var mov = new b2Vec2(movX,movY);
		mov.Normalize();
		//{
			mov.Multiply(200 * mallet_body[ index ].m_mass);
			mallet_body[ index ].ApplyForce(mov,mallet_body[ index ].m_position);
		//}
	}
	else if( mallet_body[ index ].m_position.x > -27 && mallet_body[ index ].m_position.x < 27)
	{
			var mov = new b2Vec2(puck_body.m_position.x - mallet_body[ index ].m_position.x, 1.0);
			mov.Multiply(10.0);
			mallet_body[ index ].SetLinearVelocity(mov);
	}
	else
	{
		   var mov = new b2Vec2(0.0, 20.0);
		   mallet_body[ index ].SetLinearVelocity(mov); 
	}
	
	if( mallet_body[ index ].m_position.y < 0.1 )  
	{
		var mov = new b2Vec2(-0.5, 0.0);
		mov.Multiply(100.0);
		mallet_body[ index ].SetLinearVelocity(mov); 
	}
	
	if( mallet_body[ index ].m_position.y > 45 )
	{
		var mov = new b2Vec2(0.0, -0.5);
		mallet_body[ index ].SetLinearVelocity(mov); 
	}
	mallet_body[ index ].WakeUp();
	
	return true;
};

CONTENT.RESTOREJOINTS = function( index ) {
	if( !PHYSICS.m_joint[ index ] )
	{
		var forty = index == 3 ? -40 : 40;
		
		  var md = new b2MouseJointDef();
		  md.body1 = PHYSICS.world.GetGroundBody();
		  md.body2 = PHYSICS.mallet_body[ index ];
		  var p2 = new b2Vec2(15,-40.0);
		  md.target.Set(p2);
		  md.maxForce = 100000 * PHYSICS.mallet_body[0].m_mass;
		  md.timeStep =  1/60; // note it's set same as the world timestep 1/60
		  md.frequencyHz = 15;
		
		  PHYSICS.m_joint[ index ] = PHYSICS.world.CreateJoint( md );
		  PHYSICS.m_joint[ index ].m_localAnchor.Set( 0.0,0.0 ); 
		  PHYSICS.m_joint[ index ].SetTarget( new b2Vec2( -15, forty ) );
	}
	return true;
}