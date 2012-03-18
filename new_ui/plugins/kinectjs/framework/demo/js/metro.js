/*********************************
* VERSION I, 13 Feb 2012
*---------------------------------
* Tile (metro) based interface in JS
* will work with touchevents and mouse too
*
* For use with KinectJS,
* check the index.css stylesheet for info on css
*
* Authors	: Pantelis Kalogiros
* url		: kinect.childnodes.com
**********************************/
(function( doc, win ) {
	//arguments	:	container element, nodeList and / or tagname
	win.metro = function( container, nodeList, tagname ) {
		var li;
		
		!tagname && ( tagname = 'li' );
		
		nodeList
		&& ( li = nodeList )
		|| ( li = container.getElementsByTagName( tagname ) );
				
		var len = li.length,
			prefix = navigator.userAgent.toLowerCase(),
			lprefix,
			populateMouse,
			latest_el,
			
			cursorMove,
			cursorOut;
			
		//browser / control sniffer
		if( win.kinect )
		{
			populateMouse = function( e ) {
				var $th = e.target;
				return	{
					x: ( parseInt( kinect.cursor.x ) / 100 * win.innerWidth - $th.offsetLeft - $th.parentNode.offsetLeft ),
					y: ( parseInt( kinect.cursor.y ) / 100 * win.innerHeight - $th.offsetTop - $th.parentNode.offsetTop ),
				};
			};
			
			cursorMove = 'kinectTouchMove';
			cursorOut = 'kinectTouchEnd';
		}
		//touchscreens
		else if( 'ontouchstart' in doc.documentElement ) {
			populateMouse = function( e ) {
				var $th = e.target;
				return	{
					x: ( e.touches[ 0 ].pageX - $th.offsetLeft - $th.parentNode.offsetLeft ),
					y: ( e.touches[ 0 ].pageY - $th.offsetTop - $th.parentNode.offsetTop ),
				};
			};
			
			cursorMove = 'touchmove';
			cursorOut = 'touchend';
		}
		else
		{
			//mouse controls
			populateMouse = function( e ) {
				var $th = e.target;
				return	{
					x: ( e.pageX - $th.offsetLeft - $th.parentNode.offsetLeft ),
					y: ( e.pageY - $th.offsetTop - $th.parentNode.offsetTop ),
				};
			};
			
			cursorMove = 'mousemove';
			cursorOut = 'mouseout';
		}
		
		//check for browser prefix -webkit- -moz- -ms-
		if( win.opera )
			prefix = 'O';
		else if( prefix.indexOf( 'firefox' ) !== -1 )
			prefix = 'Moz';
		else if( prefix.indexOf( 'webkit' ) !== -1 )
			prefix = 'webkit';
		else
			prefix = 'MS';
			
		lprefix = prefix.toLowerCase();
				
		while( len-- )
		{
			(function( li ) {
				li.metro = {
					origin:     0,
					ang:        15,
					ang2:       15,
					orizorvert: 0
				};
				
				li.addEventListener( cursorMove, function( e ) {
					var mouse = populateMouse( e ),
						metro = this.metro,
						el = this,
						str = '',
						originX = 0,
						originY = 0;
						
					latest_el = this;
					
					metro.orizorvert = 0;
					metro.orizorvert2 = 0;
					
					metro.ang = 15;
					metro.ang2 = 15;
					
					originX = mouse.x * 100 / this.offsetWidth;
					originY = mouse.y * 100 / this.offsetHeight;
					
					str += '-' + lprefix + '-transform-origin-x:' + originX + '%;';
					str += '-' + lprefix + '-transform-origin-y:' + originY + '%;';

					if( mouse.x < this.offsetWidth * 44 /100 ) {
						metro.orizorvert = 'left';
						metro.ang = -metro.ang * ( 100 - originX ) / 100;
					}
					else if( mouse.x > parseInt( this.offsetWidth * 58/100 ) )
					{
						metro.orizorvert = 'right';
						metro.ang = metro.ang * originX / 100;
					}
					else
						metro.ang = 0;
					
					if(mouse.y < this.offsetHeight * 44 /100 )
					{
						metro.orizorvert2 = 'top';
						metro.ang2 = metro.ang2 * ( 100 - originY ) / 100;
					}
					else if(mouse.y > parseInt( li.offsetHeight * 58/100  ))
					{
						metro.orizorvert2 = 'bottom';
						metro.ang2 = -metro.ang2 * originY / 100;
					}
					else
						metro.ang2 = 0;

					this.metro = metro;
					
					metro.ang2 = metro.ang2 > 15 ? 13 : ( metro.ang2 < -15 ? -13 : metro.ang2 );
					metro.ang = metro.ang > 15 ? 13 : ( metro.ang < -15 ? -13 : metro.ang );

					if( metro.orizorvert !== 0 || metro.orizorvert2 !== 0 )
					{
						str += '-' + lprefix + '-transform:rotateY( ' + metro.ang + 'deg) rotateX(' + metro.ang2 + 'deg);';
						this.style.cssText = str;
					}
					else
						this.style.cssText = '-' + lprefix + '-transform-origin:50% 50%;-' + lprefix + '-transform:scale(' + ( 1 - Math.sin( 4.2 * Math.PI / 2 ) / 10 ) + ')';
				}, false);
				
				li.addEventListener( cursorOut, function( e ) {
					if( !latest_el )
						this.style.cssText = '';
					else
						latest_el.style.cssText = '';
				}, false );
			
			})( li[ len ] );
		}
	}
})( document, window )