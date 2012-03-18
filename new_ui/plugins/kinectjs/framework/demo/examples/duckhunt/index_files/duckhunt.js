function calculateScale() {
	
	var div = $( document.getElementById('gameField') ),
		height = div.outerHeight(),
		width = div.outerWidth(),
		
		maxHeight = window.innerHeight,
		maxWidth = window.innerWidth;
		
	var retY = window.retY = maxHeight / height,
		retX = window.retX = maxWidth / width;
		
	
	div.get(0).style.cssText = '-webkit-transform:scaleX(' + retX + ') scaleY(' + retY + ');margin-top:' + ( ( ( maxHeight - height ) / 2  )  ) + 'px;';
}

$(document).ready(function() {
	calculateScale();
});

window.addEventListener('resize', calculateScale,false);
/************************************************
	DUCK HUNT JS 
		by Matthew Surabian - MattSurabian.com
		A first draft...
**************************************************/
window.duck = [];
var levelArray = [["Level 1",3,2,5,3,13],["Level 2",5,3,6,4,10],["Level 3",6,3,7,4,10],["Level 4",3,10,7,11,18],["Level 5",5,2,8,3,13], ["Level 6",1,15,8,15,25]];
$(document).ready(function(){
	//mute the sounds for debuging	
	//$(".sounds").attr("volume","0");
	theGame.loadLevel(levelArray[theGame.currentLevel][0],levelArray[theGame.currentLevel][1],levelArray[theGame.currentLevel][2],levelArray[theGame.currentLevel][3],levelArray[theGame.currentLevel][4],levelArray[theGame.currentLevel][5]);
});
var mute= 0;
var theGame={
	playfield:"#game",
	pieces: ["theFlash","tree","grass","theDog","sniffDog"],
	currentLevel:0,
	currentWave:0,
	pointsPerDuck:100,
	quackID:0,
	sniffID:0,
	checkWaveID:0,
	toWait:false,
	score:0,
	totalKills:0,
	totalMisses:0,
	killsThisLevel:0,
	missesThisLevel:0,
	levelName:"",
	shotsThisWave:0,
	shotsTaken:0,
	duckID:0,
	duckMax:0,
	//level vars
	levelWaves:0,
	levelDucks:0,
	levelBullets:0,
	levelTime:0,
	levelTimeID:0,
	duckSpeed:0,
	ducksAlive:0,
	ducksDead:0,
	lastBang:1,
	clearingWave:false,
	levelInProg:false,
	flyAwayProg:false,
	waitingLevel:0,
	dogTimer:0,
	init: function(){
		$(theGame.playfield).html("");
		
		for(var i=0;i<theGame.pieces.length;i++){
			$(theGame.playfield).append('<div id="'+theGame.pieces[i]+'"></div>');	
		}
		
		$(".messages").css("display","none");
		$(".gameinfo").css("display","none");
		$("#gameField").unbind("mousedown");

		//show the intro then load the wave
		theGame.intro(2000);
		theGame.dogSniff();
		theGame.waitingLevel = setTimeout(theGame.level,6000);
	theGame.shotsThisWave = 0;
	},
	
	openingScreen: function(){
		return true;	
	},
	updateScore: function(adjust){
		theGame.score+=adjust;
		$("#scoreboard").html(addCommas(theGame.score.toString()));	
	},
	loadLevel: function(name,waves,ducks,dSpeed,bullets,time){
		
		clearTimeout(theGame.waitingLevel);
		clearTimeout(theGame.dogTimer);
		clearTimeout(theGame.levelTimeID);
		levelName = name;
		theGame.levelTime = time*1000;
		theGame.levelWaves = waves;
		theGame.levelDucks = ducks;
		theGame.levelBullets = bullets;
		theGame.currentWave = 0;
		theGame.setDuckSpeed(dSpeed);
	
		//init the board, then to intro
		this.init();
		
	},
	
	clearDucks: function(){
		$(".deadDuck").remove();
	},
	
	level: function(){
		theGame.clearDucks();
		if(theGame.levelTimeID !=0){
			clearTimeout(theGame.levelTimeID);	
		}
		$(".gameinfo").css("display","block");
		theGame.missesThisLevel = 0;
		theGame.killsThisLevel = 0;
		$("#ducksKilled").html("");
		theGame.doWave(theGame.currentWave);
				
	},
	doWave: function(num){
		clearInterval(theGame.quackID);	
		if(num < theGame.levelWaves){
		theGame.shotsThisWave = 0;
		theGame.clearDucks();
		theGame.drawBullets();
		
		theGame.ducksAlive = theGame.levelDucks;
		theGame.ducksDead = 0;
		//add the ducks duckMax is for unique IDs
		//even when removed from the DOM old IDs anger the sprite engine
		theGame.duckMax = theGame.duckID + theGame.ducksAlive;
		for(var i=theGame.duckID;i<theGame.duckMax;i++){
			if(i%2 == 0){
				duckClass="duckA";	
			}else{
				duckClass="duckB";
			}
			$(theGame.playfield).append('<div id="theDuck'+i+'" class="ducks '+duckClass+'"></div>');
		}	
		 theGame.duckID = theGame.duckMax;
		$("#waves").html("WAVE "+(theGame.currentWave+1)+" of "+theGame.levelWaves);

		theGame.releaseTheDucks();
		}else{
			
			if((theGame.currentLevel+1) < levelArray.length){
				
				var skills = (theGame.killsThisLevel/(theGame.killsThisLevel+theGame.missesThisLevel))*100;
				if(skills<70){
					theGame.updateScore(-(theGame.killsThisLevel*theGame.pointsPerDuck));
					$("#loser").css("display","block");
					
					setTimeout(function() {
						tryAgain();
					},1800);
					return false;
				}
				
				theGame.currentLevel++;
				theGame.totalKills = theGame.killsThisLevel;
				theGame.totalMisses= theGame.missesThisLevel;
				setTimeout(function(){
					theGame.loadLevel(levelArray[theGame.currentLevel][0],levelArray[theGame.currentLevel][1],levelArray[theGame.currentLevel][2],levelArray[theGame.currentLevel][3],levelArray[theGame.currentLevel][4],levelArray[theGame.currentLevel][5]);	
				},2000);
				
				
			}else{
				var skills = (theGame.killsThisLevel/(theGame.killsThisLevel+theGame.missesThisLevel))*100;
				if(skills>70){
					$("#winner").css("display","block");

				}else{
					theGame.updateScore(-(theGame.killsThisLevel*theGame.pointsPerDuck));
					$("#loser").css("display","block");

					return false;	
				}
			}
			
		}
				
			
	},
	waveCleared: function(){
		$("#gameField").unbind("mousedown");
		if(!theGame.clearingWave){
			 $("#gameField").animate({
			 	backgroundColor: '#64b0ff'
			 },500);
			theGame.clearingWave = true;
			theGame.drawDucks();
			theGame.currentWave++;
			theGame.doWave(theGame.currentWave);

			setTimeout(function(){theGame.clearingWave=false;},5000);	
		}
	},
	releaseTheDucks: function(){
		//animate the ducks
		$('.ducks').each(function( i ){
			window.duck[ i ] = this;
			
			$(this).sprite({fps: 6, no_of_frames: 3,start_at_frame: 1});
			$(this).spRandom({
	          top: 400,
	          left: 700,
	          right: 0,
	          bottom: 0,
	          speed: theGame.duckSpeed,
	          pause: 0
	     	 });
	     	 $(this).bind("mousedown",function(){theGame.shootDuck($(this))});
		});
		
		$("#gameField").bind("mousedown",theGame.shootGun);
		
		clearTimeout(theGame.levelTimeID);
		theGame.levelTimeID = setTimeout(theGame.flyAway,theGame.levelTime);

	},
	cleanScreen: function(name){
		$(name).css("display","none");
	},
	flashScreen: function(){
		var flashTime = 70;
		$("#theFlash").css("display","block");
		setTimeout(this.cleanScreen,flashTime,"#theFlash");
		
	},
	intro: function(time){
		
			$("#level").html(levelName);
			$("#level").css("display","block");
			
			setTimeout(this.cleanScreen,time,"#level");
	},
	drawBullets: function(){
		var bulletsText = "";
		var shotsLeft = theGame.levelBullets - theGame.shotsThisWave;
		
		if(shotsLeft>15){
			shotsLeft = 15;	
		}
		
		for(var i=0; i<shotsLeft; i++){
			bulletsText += '<img src="images/bullet.png" align="absmiddle"/>';	
		}	
		$("#ammo").html("<strong>Shots: </strong>"+bulletsText);
		
	},
	shootGun: function(){
		theGame.shotsTaken++;
		theGame.shotsThisWave++;
		
		if( theGame.shotsThisWave == theGame.levelBullets && theGame.ducksAlive>0)
		{
			theGame.outOfAmmo();
		}
		else if(theGame.shotsThisWave > theGame.levelBullets && theGame.ducksAlive>0){
			return false;
		}

		theGame.flashScreen();
		theGame.drawBullets();	
		if(theGame.lastBang == 1){

		theGame.lastBang = 0;
		}else{

		theGame.lastBang = 1;
		}
	},
	shootDuck: function(obj){
		if( theGame.shotsThisWave > theGame.levelBullets )
		{
			return false;
		}	
			
			
		theGame.flashScreen();
		
		theGame.ducksAlive--;
		theGame.ducksDead++;
		theGame.killsThisLevel++;
		$("#ducksKilled").append("<img src='images/duckDead.png'/>");
		$._spritely.instances[$(obj).attr("id")].stop_random=true;
		$(obj).stop(true,false);
			$(obj).unbind();
			$(obj).addClass("deadSpin");
		theGame.updateScore(theGame.pointsPerDuck);
	
      	
		$(obj).spStop(true);
		$(obj).spState(5);

      	if(theGame.ducksAlive == 0){
    	
      		clearInterval(theGame.quackID);	
      	}
      	setTimeout(function(){
        $(obj).spState(6);
		$(obj).spStart();
		$(obj).animate({
			top:'420'
		},800,function(){
			$(obj).destroy();
			$(obj).attr("class","deadDuck");
			theGame.dogPopUp();
		});
      	},500);
	
		  
	},
	dogPopUp: function(){
		if(	!theGame.flyAwayProg){

		$("#theDog").css("backgroundPosition","0px 0px");

		$("#theDog").animate({
			bottom: '110'
		},400,function(){

		setTimeout(function(){$("#theDog").animate({
					bottom: '-10'
					},500,function(){
						if(theGame.ducksAlive == 0){
							setTimeout(function(){theGame.waveCleared();},1000);	
						}	
					});},500);
		});	
		}
	},
	dogSniff: function(){
		//make sure the dog is in the right spot and visible
		
		$("#sniffDog").css("bottom","4px");
		$("#sniffDog").css("left","-400px");
		$('#sniffDog').css("background-image","url(images/dogSniffJump.png)");
		$('#sniffDog').css("background-position","0px 0px");
		$('#sniffDog').fadeIn();
	
		//play the sniffing sound
	
		//animate the dog sprite and the dog itself
		$('#sniffDog').sprite({fps: 6, no_of_frames: 4});
		$('#sniffDog').animate({
			left: '240'
		},5000,'linear',function(){
			//stop sniffing
			
			//stop the sprite
			$('#sniffDog').destroy();
			//barking
			$('#sniffDog').css("background-position","-632px 0px");
			
		
			//make the dog jump in one second
			theGame.dogTimer = setTimeout(function(){
				$('#sniffDog').css("background-image","url(images/jumpDog.png)");
				$('#sniffDog').css("bottom","75px");
				$('#sniffDog').css("background-position","0px 0px");
				$('#sniffDog').sprite({fps: 50, no_of_frames: 2,play_frames: 2});
				$('#sniffDog').fadeOut();
				$('#sniffDog').spStop();
				$('#sniffDog').destroy();
				
			},1000);

	});
	},
	dogLaugh: function(){
		$("#theDog").stop(true,false);
		$("#theDog").css("background-position","-276px 0px");
			$("#theDog").animate({
				bottom: '110'
			},500,function(){
				
				clearInterval(theGame.quackID);
				
			
				setTimeout(function(){
					$("#theDog").animate({
						bottom: -10
					},500,function(){
						theGame.flyAwayProg = false;
						setTimeout(function(){theGame.waveCleared();},1000);	
					});},500);
				
			});	
						
	},
	outOfAmmo: function(){
		$(".ducks").unbind();
		$("#gameField").unbind();	
		theGame.clearingWave=false;
		setTimeout(theGame.flyAway(),300);
	},
	flyAway: function(){
		if(theGame.ducksAlive > 0){
			clearTimeout(theGame.levelTimeID);
			theGame.flyAwayProg = true;
			$(".ducks").unbind();
			 $("#gameField").unbind();

			 $("#gameField").animate({
			 	backgroundColor: '#fbb4d4'
			 },900);
			 $(".ducks").each(function(){
			 	if(!$(this).hasClass("deadSpin")){
			 	theGame.missesThisLevel++;
			 	$("#ducksKilled").append("<img src='images/duckLive.png'/>");
				var self = $(this);
				$._spritely.instances[self.attr("id")].stop_random=true;
				self.spState(2);
				self.animate({
					top:'-200',
					left:'460'	
				},500,function(){
					self.attr("class","deadDuck");
					self.destroy();	
				});
			 	}
			});	
			
			setTimeout(function(){theGame.dogLaugh();},200);
			}	
	},
	drawDucks: function(){
		var ducksScore = "";
		var liveMax = theGame.missesThisLevel;
		var deadMax = theGame.killsThisLevel;
		if(theGame.ducksLived > 25){
			liveMax = 25;
		}
		if(theGame.ducksKilled>25){
			deadMax = 25;	
		}
		for(var i=0;i<liveMax;i++){
			ducksScore += "<img src='images/duckLive.png'/>";	
		}
		for(var i=0;i<deadMax;i++){
			ducksScore += "<img src='images/duckDead.png'/>";	
		}
	
		
		$("#ducksKilled").html(ducksScore);
	},
	setDuckSpeed: function(speedVal){
		switch( speedVal ){
			case 0:
			theGame.duckSpeed = 7600;
			break;
			case 1:
			theGame.duckSpeed = 10800;
			break;
			case 2:
			theGame.duckSpeed = 9500;
			break;	
			case 3:
			theGame.duckSpeed = 8000;
			break;
			case 4:
			theGame.duckSpeed = 7800;
			break;
			case 5:
			theGame.duckSpeed = 7200;
			break;
			case 6:
			theGame.duckSpeed = 6800;
			break;
			case 7:
			theGame.duckSpeed = 6500;
			break;
			case 8:
			theGame.duckSpeed = 6200;
			break;
			case 9:
			theGame.duckSpeed = 6000;
			break;
			case 10:
			theGame.duckSpeed = 5500;
			break;
			default:
			theGame.duckSpeed = 7200;
			break;
		}
	}	
}

function makeLevel(){
	var LCwaves = parseInt($("#LCwaves").attr("value"));
	var LCducks = parseInt($("#LCducks").attr("value"));
	var LCbullets = parseInt($("#LCbullets").attr("value"));
	var LCwavetime = parseInt($("#LCwavetime").attr("value"));
	var LCdif = parseInt($("#LCdif").attr("value"));
	$("#sniffDog").stop();
	theGame.loadLevel("Custom Level",LCwaves,LCducks,LCdif,LCbullets,LCwavetime);		
}

function tryAgain(){
		theGame.loadLevel(levelArray[theGame.currentLevel][0],levelArray[theGame.currentLevel][1],levelArray[theGame.currentLevel][2],levelArray[theGame.currentLevel][3],levelArray[theGame.currentLevel][4],levelArray[theGame.currentLevel][5]);
}

function addCommas(nStr)
{
	nStr += '';
	x = nStr.split('.');
	x1 = x[0];
	x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}