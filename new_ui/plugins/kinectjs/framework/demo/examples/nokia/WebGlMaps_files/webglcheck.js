var BrowserDetect = {
init: function () {
          this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
          this.version = this.searchVersion(navigator.userAgent) ||
              this.searchVersion(navigator.appVersion) || "an unknown version";
          this.OS = this.searchString(this.dataOS) || "an unknown OS";
      },
searchString: function (data) {
                  for (var i=0;i<data.length;i++) {
                      var dataString = data[i].string;
                      var dataProp = data[i].prop;
                      this.versionSearchString = data[i].versionSearch || data[i].identity;
                      if (dataString) {
                          if (dataString.indexOf(data[i].subString) != -1)
                              return data[i].identity;
                      }
                      else if (dataProp)
                          return data[i].identity;
                  }
              },
searchVersion: function (dataString) {
                   var index = dataString.indexOf(this.versionSearchString);
                   if (index == -1) return;
                   return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
               },
dataBrowser: [
             {
string: navigator.userAgent,
        subString: "Chrome",
        identity: "Chrome"
             },
             {   string: navigator.userAgent,
subString: "OmniWeb",
           versionSearch: "OmniWeb/",
           identity: "OmniWeb"
             },
             {
string: navigator.vendor,
        subString: "Apple",
        identity: "Safari",
        versionSearch: "Version"
             },
             {
prop: window.opera,
      identity: "Opera",
      versionSearch: "Version"
             },
             {
string: navigator.userAgent,
      identity: "Opera",
      versionSearch: "Version"
             },
             {
string: navigator.vendor,
        subString: "iCab",
        identity: "iCab"
             },
             {
string: navigator.vendor,
        subString: "KDE",
        identity: "Konqueror"
             },
             {
string: navigator.userAgent,
        subString: "Firefox",
        identity: "Firefox"
             },
             {
string: navigator.vendor,
        subString: "Camino",
        identity: "Camino"
             },
             {       // for newer Netscapes (6+)
string: navigator.userAgent,
        subString: "Netscape",
        identity: "Netscape"
             },
             {
string: navigator.userAgent,
        subString: "MSIE",
        identity: "Explorer",
        versionSearch: "MSIE"
             },
             {
string: navigator.userAgent,
        subString: "Gecko",
        identity: "Mozilla",
        versionSearch: "rv"
             },
             {       // for older Netscapes (4-)
string: navigator.userAgent,
        subString: "Mozilla",
        identity: "Netscape",
        versionSearch: "Mozilla"
             }
      ],
          dataOS : [
          {
string: navigator.platform,
        subString: "Win",
        identity: "Windows"
          },
          {
string: navigator.platform,
        subString: "Mac",
        identity: "Mac"
          },
          {
string: navigator.userAgent,
        subString: "iPhone",
        identity: "iPhone/iPod"
          },
          {
string: navigator.platform,
        subString: "Linux",
        identity: "Linux"
          }
      ]

};
BrowserDetect.init();

var check = function() {
    var Public = {};
    var supportedBrowsers = {"Chrome": 9,
                             "Firefox": 8};

    var noWebGL = function(text) {
         try {
            $("#checked").html(text);
            $("#welcome-screen").show();
            $("#welcome-screen").addClass("backgroundImage");
            $("#maps-link").css("display", "inline-table");
            $("#mapControls").hide();
         } catch(e) {
             document.getElementById('checked').firstChild.nodeValue = text;
             var welcome_screen = document.getElementById('welcome-screen');
             welcome_screen.className = 'backgroundImage2';
             document.getElementById('maps-link').style['display'] = "inline-table";
             document.getElementById('mapControls').style['display'] = "none";
         }         
    };

    var appendWebGlScript = function() {
        //load script synchronous, so we can go on, when loaded
        $.ajax({
              url: config.mapJsFile,
              dataType: "script",
              async: false
        });

    };

	var displayWebGLError = function() {
		if(!supportedBrowsers[BrowserDetect.browser] ||
                supportedBrowsers[BrowserDetect.browser] > BrowserDetect.version) {
            noWebGL("This 3D experience requires the latest version of Google Chrome or Mozilla Firefox.");
        } else {
			noWebGL("Unfortunately, there's a WebGL compatibility problem.  </br>You may want to check your system settings.");
		}
	};

	var checkCORSTextureSupport = function() {
        var image = new Image();
        if("crossOrigin" in image) {
            return true;
        }
        return false;
    };
    
    var printError = function( text ) {
        try {
            console.log(text);
        } catch(e) {
        };
    };

    Public.start = function(skipBrowserLimitation) {
        var canvas,
			body,
            gl,
            has_cors;
            
        has_cors = checkCORSTextureSupport();       
        
        if (!skipBrowserLimitation) {
            if (!has_cors) {
                var pos = document.URL.search('index\\.html');
                if (pos >= 0)
                    printError("Your browser does not support CORS. Try " + document.URL.substr(0,pos) + "override.html");
                else printError("Your browser does not support CORS. Try override.html");
                displayWebGLError();
                return;
            }
        
            //canvas = $("body").append("<canvas id='mytestcanvas'></canvas>").children().last()[0];
			body = document.getElementsByTagName('body')[0];
			canvas = body.appendChild(document.createElement("canvas"));
			       
            var contextNames = ["webgl","experimental-webgl","moz-webgl","webkit-3d"];
            for(var i = 0; i < contextNames.length; i++){
                try{
                    gl = canvas.getContext(contextNames[i]);
                    if(gl){
                      break;
                    }
                }catch(e){
                    printError(e);
				    displayWebGLError();
                    return;
                }
            }
            if(gl === null) {
                printError("no webgl");
			    displayWebGLError();
                return;
            }
            
            //$("#mytestcanvas").remove();
			body.removeChild(canvas);
        }
        
        appendWebGlScript();        
        
        try {
            nw.start("map3d", has_cors);
        } catch (e){
            printError(e);
            displayWebGLError();
            return;
        }
        $("#mapscontainer").fadeIn();

        $(document).bind("click", function(evt) {
            $("#welcome-screen").fadeOut(400);
        });
    };
    return Public;
}();

