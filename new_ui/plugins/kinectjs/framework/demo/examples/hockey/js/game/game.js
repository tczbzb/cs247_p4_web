/********************
*	Game Container	*
********************/
var GAME = window.GAME = {
		credits		:	{
			name	:	'Air Hockey',
			version	:	'1.0.0',
			author	:	'Rinesh Thomas',
			url		:	'http://rinesh.in/',
			original:	'http://www.chromeexperiments.com/detail/webgl-air-hockey-demo/'
		},
		
		//	holds the game engine and content
		content		:	{
			AI			:	null,
			PHYSICS		:	null,
			RENDERER	:	null,
			UI			:	null
		},
		
		// container of the controls scheme (currently only motion controls)
		controls	:	{},
		
		//kickstarts everything
		init		: null
	},
	//object caching
	CONTROLS = GAME.controls,
	CONTENT = GAME.content;