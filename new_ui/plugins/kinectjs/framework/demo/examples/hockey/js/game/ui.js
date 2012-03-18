(function( GAME, CONTENT ) {

	var _hub = '_hub',
		_scoreBoard = '_scoreBoard',
		_menu = '_menu';

	/************************
	* Handles the basic UI
	************************/
	CONTENT.UI = {
		regions	:	[
			'buttonStart', 'buttonOptions', 'buttonAbout',
			'buttonMirror', 'buttonBird', 'buttonPerson',
			'buttonCourt', 'buttonDragon', 'buttonBit',
			'buttonMenuBack', 'buttonMenuBack2', 'scrollable'
		],
		
		hideHUB : function() {
			_hub.style.display = "none";
			_scoreBoard.style.display = "block";
		},

		showHUB : function() {
			_hub.style.display = "block";
			_scoreBoard.style.display = "none";
		},
		
		showMenu : function( id, el ) {
			var newAct = document.getElementById( id ),
				oldAct = this.activeMenu;
				
			if( el.className.indexOf( 'active' ) )
				el.className = el.className.substr( 0, el.className.length - 1 );
			
			oldAct.className = "act fade";
			setTimeout( function() {
				oldAct.className = "";
			}, 340 );
			
			this.activeMenu = newAct;
			setTimeout(function() {
				newAct.className += " act";
				
				if( newAct.getAttribute( 'data-init' ) )
					eval( newAct.getAttribute( 'data-init' ) );
			}, 360 );
		},

		aboutScroller : function() {
			document.getElementById('_about')._SCROLLER.refresh();
		},

		assetsLib : function( e ) {
			CONTENT.RENDERER.loadCustomAssets( e );
		},
		
		setCamera : function( index ) {
			CONTENT.RENDERER.setCamera( index );
		},

		init	: function() {
			_hub = document.getElementById( _hub );
			_scoreBoard = document.getElementById( _scoreBoard );
			_menu = document.getElementById( _menu );
			
			this.activeMenu = _menu;
		}

	};
	
	CONTENT.HUD = {
		g_score		: [ 0, 0 ],
		g_deltaTime : 0,
		g_pauseTime : 0,
		g_pause		: false,
		g_over		: false,
		pl_names	: [ 'RED', 'GRN' ],
		
		reset		: function() {
			this.g_pause = true;
			this.g_over = false;
		   
			this.g_score[ 0 ] = 0;
			this.g_score[ 1 ] = 0;
		}
	};
	
	CONTENT.OPTIONS = {
		view : {
			split_screen : false
		}
	};
	
})( GAME, CONTENT );