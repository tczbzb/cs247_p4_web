var g_maxspeed = 148; //max speed of the puck +/- this value to change the speed of the game
		
GAME.init = function() {
	//make the webgl container element and bind its resizability
	this.score_to_victory = 12;
	
	var div = document.createElement('div'),
		q = this,
		body = document.getElementsByTagName('body')[0];
	
	div.id = 'webgl';
	div.style.cssText = "position:fixed;width:100%; height:100%;left:0;top:0;z-index:100;";
	body.appendChild( div );
	
	CONTENT.UI.init();
	CONTROLS.init();
	
	//menu specs - font size
	body.style.fontSize = window.innerHeight / 12 + 'px';
	document.getElementById('_about')._SCROLLER = new iScroll( document.getElementById('scrollWrapper'), {} );

	var RENDERER = CONTENT.RENDERER;
	RENDERER.init( div );
	RENDERER.renderCallback();	//render initialization
	
	var PHYSICS = CONTENT.PHYSICS;
	PHYSICS.init();
};