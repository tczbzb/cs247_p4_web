var nw = function (global) { 
    var Public  = {},
        _       = {}; //privates

    _.map3d = null;
    _.state = {pressed:false};

    _.mapConfig = {
         urlToMesh:'maps3d.svc.nokia.com/data4',
         urlToMaptiler:'1.maptile.lbs.ovi.com/maptiler/v2/maptile/newest/satellite.day',
         maptilerFormat:'jpg?token=fee2f2a877fd4a429f17207a57658582&app_id=nokiaMaps',
         autoSleep:true,
         maxTileCache:200,
         resourceUrl:config.resourcePath,
         disableCORS: false
    };
    
    _.createMap = function (args, parentNodeId)
    {
        var map = null;
        args.parentNode = document.getElementById(parentNodeId);
        map = new Map3d(args);
        return map;
    };

    _.checkLoading = function() {
        var currentCount = _.map3d.downloadQueue.getPendingRequestCount();
        var spinner      = $("#loading-spinner");
        if(currentCount === 0) {
            spinner.hide();
        } else {
            spinner.show();
        }
        window.setTimeout(_.checkLoading, 200);
    };
    
    Public.start = function(parentNodeId, supportsCORSImages) {
	
        if(!supportsCORSImages) {
            _.mapConfig.disableCORS = true;
            _.mapConfig.urlToMaptiler = config.sameDomainTileUrl;
        }
        global._map3d = _.map3d = _.createMap(_.mapConfig, parentNodeId);

        var view   = new _.map3d.View(0,0,1,1);
        var scene  = new _.map3d.Scene(true);
        var user   = new _.map3d.User();
      
        Public.flyToMoon = function(url) {
            if (!scene.moon && url) {
                scene.addMoon(url);
            }
            if (scene.moon) {
                user.backToGlobe(5,1,scene.moon);
            } else {
                console.log("Sorry. There is no moon in a scene.");
            }
        };
        Public.flyToEarth = function() {
            user.backToGlobe(33,1,scene.earth);
        };        
        
        controls.initialize(user,_.state);
        view.bindUser(user);
        user.bindScene(scene);
        
        labels.createLabels(_.map3d, scene, user, labels.citiesConfig);
        
        var renderWindow = _.map3d.renderWindow;
        renderWindow.attachView(view);    
        renderWindow.start();
        
        Public.setRedBlueStereo = function(enable,screenSeparation,cameraSeparation) {
            view.setStereo(enable);
            if (screenSeparation !== undefined)
                _.map3d.setOptions({stereoScreenSeparation:screenSeparation});
            if (cameraSeparation !== undefined)
                _.map3d.setOptions({stereoCameraSeparation:cameraSeparation});
        };
        
        _.checkLoading();
    };

    return Public;

}(this);

